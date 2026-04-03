"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"

export async function reschedulePost(postId: string, newDate: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post not found")
  if (post.status !== "scheduled") throw new Error("Only scheduled posts can be rescheduled")

  await db.post.update({
    where: { id: postId },
    data: { scheduledAt: new Date(newDate) },
  })

  revalidatePath("/scheduler")
  revalidatePath(`/posts/${postId}`)
}

export async function cancelScheduledPost(postId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const userId = session.user.id!

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error("Post not found")
  if (post.status !== "scheduled") throw new Error("Only scheduled posts can be cancelled")

  await db.post.update({
    where: { id: postId },
    data: { status: "draft", scheduledAt: null },
  })

  revalidatePath("/scheduler")
  revalidatePath("/posts")
}
