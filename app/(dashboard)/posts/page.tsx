import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PostCard } from "@/components/posts/post-card"
import { PenSquareIcon } from "lucide-react"

export default async function PostsPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mediaFiles: true,
      platformPosts: {
        include: { socialAccount: true },
      },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all your posts.
          </p>
        </div>
        <Link href="/posts/new">
          <Button>
            <PenSquareIcon className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first post to get started.
            </p>
            <Link href="/posts/new" className="mt-4">
              <Button>
                <PenSquareIcon className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              content={post.content}
              status={post.status}
              createdAt={post.createdAt}
              scheduledAt={post.scheduledAt}
              mediaCount={post.mediaFiles.length}
              platforms={post.platformPosts.map((pp) => ({
                platform: pp.socialAccount.platform,
                status: pp.status,
              }))}
            />
          ))
        )}
      </div>
    </div>
  )
}
