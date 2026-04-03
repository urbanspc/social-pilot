"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PostStatusBadge } from "@/components/posts/post-status-badge"
import { Globe, Camera, Briefcase, ClockIcon, XIcon, EditIcon } from "lucide-react"
import { reschedulePost, cancelScheduledPost } from "@/app/actions/scheduler"
import { toast } from "sonner"
import Link from "next/link"

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

type ScheduleCardProps = {
  id: string
  content: string
  status: string
  scheduledAt: string
  platforms: { platform: string; username: string }[]
}

export function ScheduleCard({ id, content, status, scheduledAt, platforms }: ScheduleCardProps) {
  const [editing, setEditing] = useState(false)
  const [newDate, setNewDate] = useState(scheduledAt.slice(0, 16))
  const [loading, setLoading] = useState(false)

  async function handleReschedule() {
    setLoading(true)
    try {
      await reschedulePost(id, newDate)
      toast.success("Post rescheduled")
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reschedule")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    setLoading(true)
    try {
      await cancelScheduledPost(id)
      toast.success("Schedule cancelled — post moved to drafts")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/posts/${id}`} className="hover:underline">
              <p className="line-clamp-2 text-sm font-medium">{content}</p>
            </Link>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ClockIcon className="h-3 w-3" />
              <span>{new Date(scheduledAt).toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              {platforms.map((p, i) => {
                const Icon = platformIcons[p.platform] ?? Globe
                return (
                  <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {p.username}
                    {i < platforms.length - 1 && ","}
                  </span>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PostStatusBadge status={status} />
            {status === "scheduled" && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setEditing(!editing)} disabled={loading}>
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancel} disabled={loading}>
                  <XIcon className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>
        {editing && (
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-auto"
            />
            <Button size="sm" onClick={handleReschedule} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
