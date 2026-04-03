"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getAdapter } from "@/lib/platforms/registry"
import type { PostStatus } from "@/lib/generated/prisma/client"

export async function createPost(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  const content = formData.get("content") as string
  const platformIds = formData.getAll("platformIds") as string[]
  const scheduledAt = formData.get("scheduledAt") as string | null
  const mediaKeys = formData.getAll("mediaKeys") as string[]
  const mediaNames = formData.getAll("mediaNames") as string[]
  const mediaMimeTypes = formData.getAll("mediaMimeTypes") as string[]
  const mediaSizes = formData.getAll("mediaSizes") as string[]

  if (!content?.trim()) throw new Error("Content is required")
  if (platformIds.length === 0) throw new Error("Select at least one platform")

  const status: PostStatus = scheduledAt ? "scheduled" : "draft"

  const post = await db.post.create({
    data: {
      content: content.trim(),
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdBy: userId,
      mediaFiles: {
        create: mediaKeys.map((key, i) => ({
          minioKey: key,
          originalName: mediaNames[i] ?? "unknown",
          mimeType: mediaMimeTypes[i] ?? "application/octet-stream",
          size: parseInt(mediaSizes[i] ?? "0", 10),
        })),
      },
      platformPosts: {
        create: platformIds.map((accountId) => ({
          socialAccountId: accountId,
          status: "pending",
        })),
      },
    },
  })

  // If not scheduled, publish immediately
  if (!scheduledAt) {
    await publishPost(post.id)
  }

  revalidatePath("/posts")
  redirect(`/posts/${post.id}`)
}

export async function publishPost(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      platformPosts: { include: { socialAccount: true } },
      mediaFiles: true,
    },
  })

  if (!post) throw new Error("Post not found")

  await db.post.update({
    where: { id: postId },
    data: { status: "publishing" },
  })

  let allSucceeded = true

  for (const platformPost of post.platformPosts) {
    try {
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
    } catch (err) {
      allSucceeded = false
      await db.platformPost.update({
        where: { id: platformPost.id },
        data: {
          status: "failed",
          errorMessage: err instanceof Error ? err.message : "Unknown error",
        },
      })
    }
  }

  await db.post.update({
    where: { id: postId },
    data: { status: allSucceeded ? "published" : "failed" },
  })

  revalidatePath("/posts")
  revalidatePath(`/posts/${postId}`)
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Delete from platforms (Facebook, etc.) before deleting locally
  const postWithPlatforms = await db.platformPost.findMany({
    where: { postId },
    include: { socialAccount: true },
  })

  for (const pp of postWithPlatforms) {
    if (pp.platformPostId && pp.socialAccount) {
      try {
        const { getAdapter } = await import("@/lib/platforms/registry")
        const adapter = getAdapter(pp.socialAccount.platform)
        await adapter.deletePost(pp.socialAccount, pp.platformPostId)
      } catch (err) {
        console.error("Platform delete failed:", err)
      }
    }
  }

  await db.post.delete({ where: { id: postId } })

  revalidatePath("/posts")
  redirect("/posts")
}


export async function editPost(postId: string, newContent: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Update on platforms (Facebook, etc.)
  const postWithPlatforms = await db.platformPost.findMany({
    where: { postId, status: "published" },
    include: { socialAccount: true },
  })

  const errors: string[] = []
  for (const pp of postWithPlatforms) {
    if (pp.platformPostId && pp.socialAccount) {
      try {
        const { getAdapter } = await import("@/lib/platforms/registry")
        const adapter = getAdapter(pp.socialAccount.platform)
        await adapter.updatePost(pp.socialAccount, pp.platformPostId, newContent)
      } catch (err: any) {
        errors.push(`${pp.socialAccount.platform}: ${err.message}`)
      }
    }
  }

  // Update locally
  await db.post.update({
    where: { id: postId },
    data: { content: newContent },
  })

  revalidatePath("/posts")
  revalidatePath(`/posts/${postId}`)

  if (errors.length > 0) {
    return { success: true, warnings: errors }
  }
  return { success: true }
}
