import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostStatusBadge } from "@/components/posts/post-status-badge"
import {
  PenSquareIcon,
  CalendarIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  LinkIcon,
  TrendingUpIcon,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const [
    totalPosts,
    publishedPosts,
    scheduledPosts,
    failedPosts,
    connectedAccounts,
    pendingReplies,
    recentPosts,
    upcomingScheduled,
  ] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { status: "published" } }),
    db.post.count({ where: { status: "scheduled" } }),
    db.post.count({ where: { status: "failed" } }),
    db.socialAccount.count(),
    db.commentReply.count({ where: { status: "pending_review" } }),
    db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        platformPosts: { include: { socialAccount: true } },
      },
    }),
    db.post.findMany({
      where: { status: "scheduled", scheduledAt: { gte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: {
        platformPosts: { include: { socialAccount: true } },
      },
    }),
  ])

  const stats = [
    { label: "Total Posts", value: totalPosts, icon: PenSquareIcon },
    { label: "Published", value: publishedPosts, icon: TrendingUpIcon },
    { label: "Scheduled", value: scheduledPosts, icon: CalendarIcon },
    { label: "Connected Accounts", value: connectedAccounts, icon: LinkIcon },
    { label: "Pending Replies", value: pendingReplies, icon: ShieldCheckIcon, href: "/comments/review" },
    { label: "Failed Posts", value: failedPosts, icon: MessageSquareIcon },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Overview of your social media activity.
          </p>
        </div>
        <Link href="/posts/new">
          <Button>
            <PenSquareIcon className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Link href="/posts">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="block">
                    <div className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{post.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <PostStatusBadge status={post.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming scheduled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Scheduled</CardTitle>
            <Link href="/scheduler">
              <Button variant="ghost" size="sm">View calendar</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingScheduled.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming scheduled posts.</p>
            ) : (
              <div className="space-y-3">
                {upcomingScheduled.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="block">
                    <div className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{post.content}</p>
                        <p className="text-xs text-muted-foreground">
                          <CalendarIcon className="mr-1 inline h-3 w-3" />
                          {post.scheduledAt?.toLocaleString()}
                        </p>
                      </div>
                      <PostStatusBadge status={post.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
