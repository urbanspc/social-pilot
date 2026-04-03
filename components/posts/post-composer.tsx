"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MediaUpload, type UploadedMedia } from "./media-upload"
import { PlatformSelect } from "./platform-select"
import { SendIcon, ClockIcon } from "lucide-react"
import { toast } from "sonner"
import { createPost } from "@/app/actions/posts"

export function PostComposer() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      toast.error("Write some content first")
      return
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("content", content)

      for (const id of selectedPlatforms) {
        formData.append("platformIds", id)
      }

      if (showSchedule && scheduledAt) {
        formData.append("scheduledAt", scheduledAt)
      }

      for (const item of media) {
        formData.append("mediaKeys", item.key)
        formData.append("mediaNames", item.originalName)
        formData.append("mediaMimeTypes", item.mimeType)
        formData.append("mediaSizes", String(item.size))
      }

      await createPost(formData)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create post")
      setSubmitting(false)
    }
  }

  const charCount = content.length

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="What do you want to share?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px] resize-y"
                />
                <p className="mt-1 text-xs text-muted-foreground text-right">
                  {charCount} characters
                </p>
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">Media</Label>
                <MediaUpload media={media} onMediaChange={setMedia} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformSelect
                selectedIds={selectedPlatforms}
                onSelectionChange={setSelectedPlatforms}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={showSchedule ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <ClockIcon className="mr-2 h-4 w-4" />
                  {showSchedule ? "Scheduled" : "Schedule for later"}
                </Button>
              </div>
              {showSchedule && (
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              )}
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting}>
            <SendIcon className="mr-2 h-4 w-4" />
            {submitting
              ? "Publishing..."
              : showSchedule && scheduledAt
                ? "Schedule Post"
                : "Publish Now"}
          </Button>
        </div>
      </div>
    </form>
  )
}
