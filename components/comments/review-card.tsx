"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, XIcon, EditIcon, Globe, Camera, Briefcase } from "lucide-react"
import { approveReply, rejectReply } from "@/app/actions/comments"
import { toast } from "sonner"

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

type ReviewCardProps = {
  replyId: string
  commentContent: string
  commentAuthor: string
  replyContent: string
  source: string
  platform: string
  platformUsername: string
  postContent: string
}

export function ReviewCard({
  replyId,
  commentContent,
  commentAuthor,
  replyContent,
  source,
  platform,
  platformUsername,
  postContent,
}: ReviewCardProps) {
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(replyContent)
  const [loading, setLoading] = useState(false)

  const Icon = platformIcons[platform] ?? Globe

  async function handleApprove() {
    setLoading(true)
    try {
      const content = editing ? editedContent : undefined
      await approveReply(replyId, content)
      toast.success("Reply approved")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve")
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    setLoading(true)
    try {
      await rejectReply(replyId)
      toast.success("Reply rejected")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3 w-3" />
          <span>{platformUsername}</span>
          <span>·</span>
          <span>Post: {postContent.slice(0, 50)}...</span>
        </div>

        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">Comment from {commentAuthor}:</p>
          <p className="mt-1 text-sm">{commentContent}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-muted-foreground">Proposed reply:</p>
            <Badge variant="secondary" className="text-xs">
              {source === "keyword_rule" ? "Keyword" : "AI"}
            </Badge>
          </div>
          {editing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-sm rounded-md border p-3">{replyContent}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApprove} disabled={loading}>
            <CheckIcon className="mr-1 h-4 w-4" />
            {editing ? "Approve Edited" : "Approve"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(!editing)} disabled={loading}>
            <EditIcon className="mr-1 h-4 w-4" />
            {editing ? "Cancel Edit" : "Edit"}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={loading}>
            <XIcon className="mr-1 h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
