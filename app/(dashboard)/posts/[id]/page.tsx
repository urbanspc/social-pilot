import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PostStatusBadge } from "@/components/posts/post-status-badge"
import { getFileUrl } from "@/lib/storage"
import { Globe, Camera, Briefcase, ArrowLeftIcon, ImageIcon, FileVideoIcon } from "lucide-react"
import { deletePost } from "@/app/actions/posts"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const post = await db.post.findUnique({
    where: { id },
    include: {
      mediaFiles: true,
      platformPosts: {
        include: { socialAccount: true },
      },
    },
  })

  if (!post) notFound()

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/posts">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Post Detail</h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </p>
        </div>
        <PostStatusBadge status={post.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{post.content}</p>
            </CardContent>
          </Card>

          {post.mediaFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Media ({post.mediaFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {post.mediaFiles.map((file) => (
                    <div key={file.id} className="h-24 w-24 overflow-hidden rounded-lg border">
                      {file.mimeType.startsWith("video/") ? (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <FileVideoIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={getFileUrl(file.minioKey)}
                          alt={file.originalName}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.platformPosts.map((pp) => {
                const Icon = platformIcons[pp.socialAccount.platform] ?? Globe
                const label = platformLabels[pp.socialAccount.platform] ?? pp.socialAccount.platform
                return (
                  <div key={pp.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="text-sm font-medium">{pp.socialAccount.platformUsername}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <PostStatusBadge status={pp.status} />
                      {pp.errorMessage && (
                        <p className="mt-1 text-xs text-destructive">{pp.errorMessage}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {post.scheduledAt && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {new Date(post.scheduledAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          <form action={deletePost.bind(null, post.id)}>
            <Button type="submit" variant="destructive" className="w-full">
              Delete Post
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
