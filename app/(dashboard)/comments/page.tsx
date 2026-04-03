import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Camera, Briefcase } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

export default async function CommentsPage() {
  const comments = await db.comment.findMany({
    orderBy: { fetchedAt: "desc" },
    include: {
      reply: true,
      platformPost: {
        include: {
          socialAccount: true,
          post: true,
        },
      },
    },
    take: 100,
  })

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="mt-1 text-muted-foreground">
          View comments across all your platforms.
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium">No comments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Comments will appear here once the worker polls them from your connected platforms.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const Icon = platformIcons[comment.platformPost.socialAccount.platform] ?? Globe
            const replyStatus = comment.reply?.status

            return (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{comment.authorName}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(comment.fetchedAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        on: {comment.platformPost.post.content.slice(0, 60)}...
                      </p>
                      {comment.reply && (
                        <div className="mt-2 rounded-md bg-muted p-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {comment.reply.source === "keyword_rule" ? "Keyword" : "AI"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={
                                replyStatus === "posted"
                                  ? "bg-green-500/10 text-green-600"
                                  : replyStatus === "pending_review"
                                    ? "bg-yellow-500/10 text-yellow-600"
                                    : replyStatus === "rejected"
                                      ? "bg-red-500/10 text-red-600"
                                      : "bg-blue-500/10 text-blue-600"
                              }
                            >
                              {replyStatus?.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm">{comment.reply.content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
