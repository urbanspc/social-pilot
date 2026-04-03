"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { editPost } from "@/app/actions/posts"
import { PencilIcon, CheckIcon, XIcon, Loader2Icon } from "lucide-react"

export function EditPostForm({ postId, currentContent }: { postId: string; currentContent: string }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(currentContent)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)

  const handleSave = async () => {
    if (!content.trim() || content === currentContent) {
      setEditing(false)
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const result = await editPost(postId, content)
      if (result?.warnings?.length) {
        setMessage({ type: "warning", text: `Updated locally. Warnings: ${result.warnings.join(", ")}` })
      } else {
        setMessage({ type: "success", text: "Post updated on all platforms" })
      }
      setEditing(false)
      // Refresh page after short delay
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-wrap flex-1">{currentContent}</p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
            <PencilIcon className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
        {message && (
          <div className={`mt-3 rounded-md px-3 py-2 text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" :
            message.type === "warning" ? "bg-yellow-50 text-yellow-700" :
            "bg-red-50 text-red-700"
          }`}>
            {message.text}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="resize-y"
        disabled={saving}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2Icon className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...</>
          ) : (
            <><CheckIcon className="h-3.5 w-3.5 mr-1.5" /> Save & Update on Facebook</>
          )}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setContent(currentContent) }} disabled={saving}>
          <XIcon className="h-3.5 w-3.5 mr-1.5" /> Cancel
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        This will update the post text on Facebook and locally. Images cannot be changed.
      </p>
    </div>
  )
}
