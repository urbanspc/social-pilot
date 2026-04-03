import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PostStatusBadge } from "./post-status-badge"
import { Globe, Camera, Briefcase, ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

type PostCardProps = {
  id: string
  content: string
  status: string
  createdAt: Date
  scheduledAt: Date | null
  mediaCount: number
  platforms: { platform: string; status: string }[]
}

export function PostCard({ id, content, status, createdAt, scheduledAt, mediaCount, platforms }: PostCardProps) {
  return (
    <Link href={`/posts/${id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="line-clamp-2 text-sm">{content}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
                {mediaCount > 0 && (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {mediaCount}
                  </span>
                )}
                {scheduledAt && (
                  <span>Scheduled: {new Date(scheduledAt).toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex -space-x-1">
                {platforms.map((p, i) => {
                  const Icon = platformIcons[p.platform] ?? Globe
                  return <Icon key={i} className="h-4 w-4" />
                })}
              </div>
              <PostStatusBadge status={status} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
