"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function approveReply(replyId: string, editedContent?: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  const reply = await db.commentReply.findUnique({
    where: { id: replyId },
    include: {
      comment: {
        include: {
          platformPost: { include: { socialAccount: true } },
        },
      },
    },
  })

  if (!reply) throw new Error("Reply not found")

  await db.commentReply.update({
    where: { id: replyId },
    data: {
      content: editedContent ?? reply.content,
      status: "approved",
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/comments/review")
  revalidatePath("/comments")
}

export async function rejectReply(replyId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  await db.commentReply.update({
    where: { id: replyId },
    data: {
      status: "rejected",
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/comments/review")
}

export async function postApprovedReplies() {
  // This would be called by the worker, but we also expose it as an action
  // for manual triggering from the UI
  const approvedReplies = await db.commentReply.findMany({
    where: { status: "approved" },
    include: {
      comment: {
        include: {
          platformPost: { include: { socialAccount: true } },
        },
      },
    },
  })

  for (const reply of approvedReplies) {
    try {
      const { getAdapter } = await import("@/lib/platforms/registry")
      const adapter = getAdapter(reply.comment.platformPost.socialAccount.platform)

      await adapter.replyToComment(
        reply.comment.platformPost.socialAccount,
        reply.comment.platformCommentId,
        reply.content
      )

      await db.commentReply.update({
        where: { id: reply.id },
        data: {
          status: "posted",
          postedAt: new Date(),
        },
      })
    } catch (err) {
      console.error(`Failed to post reply ${reply.id}: ${err}`)
    }
  }

  revalidatePath("/comments/review")
}
