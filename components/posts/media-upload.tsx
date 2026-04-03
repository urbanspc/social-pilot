"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlusIcon, XIcon, FileVideoIcon } from "lucide-react"
import { toast } from "sonner"

export type UploadedMedia = {
  key: string
  url: string
  originalName: string
  mimeType: string
  size: number
}

export function MediaUpload({
  media,
  onMediaChange,
}: {
  media: UploadedMedia[]
  onMediaChange: (media: UploadedMedia[]) => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setUploading(true)

      try {
        const newMedia: UploadedMedia[] = []
        for (const file of Array.from(files)) {
          const formData = new FormData()
          formData.append("file", file)

          const res = await fetch("/api/upload", { method: "POST", body: formData })
          if (!res.ok) {
            const err = await res.json()
            toast.error(err.error ?? "Upload failed")
            continue
          }

          const data = await res.json()
          newMedia.push(data)
        }
        onMediaChange([...media, ...newMedia])
      } finally {
        setUploading(false)
      }
    },
    [media, onMediaChange]
  )

  const handleRemove = useCallback(
    (key: string) => {
      onMediaChange(media.filter((m) => m.key !== key))
    },
    [media, onMediaChange]
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {media.map((item) => (
          <div key={item.key} className="group relative h-24 w-24 overflow-hidden rounded-lg border">
            {item.mimeType.startsWith("video/") ? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <FileVideoIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <img src={item.url} alt={item.originalName} className="h-full w-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.key)}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.multiple = true
            input.accept = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
            input.onchange = () => handleUpload(input.files)
            input.click()
          }}
        >
          <ImagePlusIcon className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Add Media"}
        </Button>
      </div>
    </div>
  )
}
