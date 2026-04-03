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

async function pollComments() {
  // Get all published platform posts
  const platformPosts = await db.platformPost.findMany({
    where: {
      status: "published",
      platformPostId: { not: null },
    },
    include: { socialAccount: true },
  })

  for (const pp of platformPosts) {
    try {
      const { getAdapter } = await import("../lib/platforms/registry")
      const adapter = getAdapter(pp.socialAccount.platform)
      const comments = await adapter.fetchComments(pp.socialAccount, pp.platformPostId!)

      for (const comment of comments) {
        // Upsert to deduplicate
        await db.comment.upsert({
          where: {
            platformPostId_platformCommentId: {
              platformPostId: pp.id,
              platformCommentId: comment.platformCommentId,
            },
          },
          update: {},
          create: {
            platformPostId: pp.id,
            platformCommentId: comment.platformCommentId,
            authorName: comment.authorName,
            content: comment.content,
          },
        })
      }
    } catch (err) {
      console.error(`Failed to poll comments for ${pp.socialAccount.platformUsername}: ${err}`)
    }
  }
}

async function processAutoReplies() {
  // Find comments without replies
  const unrepliedComments = await db.comment.findMany({
    where: { reply: null },
    include: {
      platformPost: { include: { socialAccount: true } },
    },
  })

  if (unrepliedComments.length === 0) return

  // Load keyword rules and default persona
  const keywordRules = await db.keywordRule.findMany({ where: { isActive: true } })
  const defaultPersona = await db.aIPersona.findFirst({ where: { isDefault: true } })

  const { matchKeywordRule, generateAIReply } = await import("../lib/auto-reply")

  for (const comment of unrepliedComments) {
    try {
      // Try keyword match first
      const matchedRule = matchKeywordRule(comment.content, keywordRules)

      let replyContent: string
      let source: "keyword_rule" | "ai_generated"

      if (matchedRule) {
        replyContent = matchedRule.replyTemplate
        source = "keyword_rule"
      } else if (defaultPersona) {
        replyContent = await generateAIReply(
          comment.content,
          comment.authorName,
          defaultPersona
        )
        source = "ai_generated"
      } else {
        // No keyword match and no AI persona configured — skip
        continue
      }

      if (replyContent) {
        await db.commentReply.create({
          data: {
            commentId: comment.id,
            content: replyContent,
            source,
            status: "pending_review",
          },
        })
        console.log(`Auto-reply queued for comment by ${comment.authorName} (${source})`)
      }
    } catch (err) {
      console.error(`Failed to process auto-reply for comment ${comment.id}: ${err}`)
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

// Run every 5 minutes — poll comments from platforms
cron.schedule("*/5 * * * *", async () => {
  try {
    await pollComments()
    await processAutoReplies()
  } catch (err) {
    console.error("Error in comment polling:", err)
  }
})

console.log("Worker started. Watching for scheduled posts...")
