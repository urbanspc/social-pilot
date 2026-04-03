import { db } from "@/lib/db"
import { ReviewCard } from "@/components/comments/review-card"
import { Toaster } from "@/components/ui/sonner"
import { Badge } from "@/components/ui/badge"

export default async function ReviewQueuePage() {
  const pendingReplies = await db.commentReply.findMany({
    where: { status: "pending_review" },
    orderBy: { comment: { fetchedAt: "desc" } },
    include: {
      comment: {
        include: {
          platformPost: {
            include: {
              socialAccount: true,
              post: true,
            },
          },
        },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Review Queue</h1>
          <p className="mt-1 text-muted-foreground">
            Approve or reject auto-generated replies before they are posted.
          </p>
        </div>
        {pendingReplies.length > 0 && (
          <Badge className="bg-yellow-500/10 text-yellow-600">
            {pendingReplies.length} pending
          </Badge>
        )}
      </div>
      <div className="mt-6 space-y-4">
        {pendingReplies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium">All clear!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No replies waiting for review.
            </p>
          </div>
        ) : (
          pendingReplies.map((reply) => (
            <ReviewCard
              key={reply.id}
              replyId={reply.id}
              commentContent={reply.comment.content}
              commentAuthor={reply.comment.authorName}
              replyContent={reply.content}
              source={reply.source}
              platform={reply.comment.platformPost.socialAccount.platform}
              platformUsername={reply.comment.platformPost.socialAccount.platformUsername}
              postContent={reply.comment.platformPost.post.content}
            />
          ))
        )}
      </div>
      <Toaster />
    </div>
  )
}
