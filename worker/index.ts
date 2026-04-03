import "dotenv/config"
import cron from "node-cron"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma/client"

// Worker uses its own Prisma client (not the Next.js singleton)
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" })
const db = new PrismaClient({ adapter })

async function publishDuePosts() {
  const now = new Date()

  // Find posts that are scheduled and due
  const duePosts = await db.post.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    include: {
      platformPosts: { include: { socialAccount: true } },
      mediaFiles: true,
    },
  })

  if (duePosts.length === 0) return

  console.log(`[${now.toISOString()}] Found ${duePosts.length} post(s) to publish`)

  for (const post of duePosts) {
    await db.post.update({
      where: { id: post.id },
      data: { status: "publishing" },
    })

    let allSucceeded = true

    for (const platformPost of post.platformPosts) {
      try {
        // Dynamic import to avoid bundling issues
        const { getAdapter } = await import("../lib/platforms/registry")
        const adapter = getAdapter(platformPost.socialAccount.platform)
        const platformPostId = await adapter.publishPost(
          platformPost.socialAccount,
          post.content,
          post.mediaFiles
        )

        await db.platformPost.update({
          where: { id: platformPost.id },
          data: {
            status: "published",
            platformPostId,
            publishedAt: new Date(),
          },
        })

        console.log(`  Published to ${platformPost.socialAccount.platform}: ${platformPost.socialAccount.platformUsername}`)
      } catch (err) {
        allSucceeded = false
        const message = err instanceof Error ? err.message : "Unknown error"
        await db.platformPost.update({
          where: { id: platformPost.id },
          data: {
            status: "failed",
            errorMessage: message,
          },
        })
        console.error(`  Failed on ${platformPost.socialAccount.platform}: ${message}`)
      }
    }

    await db.post.update({
      where: { id: post.id },
      data: { status: allSucceeded ? "published" : "failed" },
    })
  }
}

async function refreshExpiringTokens() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const expiringAccounts = await db.socialAccount.findMany({
    where: {
      tokenExpiresAt: {
        lte: sevenDaysFromNow,
        gt: new Date(),
      },
    },
  })

  for (const account of expiringAccounts) {
    try {
      const { getAdapter } = await import("../lib/platforms/registry")
      const adapter = getAdapter(account.platform)
      const { encrypt } = await import("../lib/encryption")
      const updated = await adapter.refreshToken(account)

      await db.socialAccount.update({
        where: { id: account.id },
        data: {
          accessToken: encrypt(updated.accessToken),
          refreshToken: updated.refreshToken ? encrypt(updated.refreshToken) : null,
          tokenExpiresAt: updated.tokenExpiresAt,
        },
      })

      console.log(`Refreshed token for ${account.platform}: ${account.platformUsername}`)
    } catch (err) {
      console.error(`Failed to refresh token for ${account.platformUsername}: ${err}`)
    }
  }
}

// Run every minute — check for scheduled posts
cron.schedule("* * * * *", async () => {
  try {
    await publishDuePosts()
  } catch (err) {
    console.error("Error in publishDuePosts:", err)
  }
})

// Run every 6 hours — refresh tokens expiring within 7 days
cron.schedule("0 */6 * * *", async () => {
  try {
    await refreshExpiringTokens()
  } catch (err) {
    console.error("Error in refreshExpiringTokens:", err)
  }
})

console.log("Worker started. Watching for scheduled posts...")
