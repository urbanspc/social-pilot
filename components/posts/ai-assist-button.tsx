"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SparklesIcon } from "lucide-react"
import { aiAssistPost } from "@/app/actions/ai-assist"
import { toast } from "sonner"

const actions = [
  { id: "improve", label: "Improve writing" },
  { id: "hashtags", label: "Suggest hashtags" },
  { id: "shorten", label: "Make shorter" },
  { id: "expand", label: "Expand content" },
  { id: "ideas", label: "Related post ideas" },
] as const

export function AIAssistButton({
  content,
  onResult,
}: {
  content: string
  onResult: (text: string) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleAction(action: "improve" | "hashtags" | "shorten" | "expand" | "ideas") {
    if (!content.trim()) {
      toast.error("Write some content first")
      return
    }

    setLoading(true)
    try {
      const result = await aiAssistPost(content, action)
      onResult(result)
      toast.success("AI suggestion ready")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI assist failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="sm" disabled={loading}>
            <SparklesIcon className="mr-2 h-4 w-4" />
            {loading ? "Thinking..." : "AI Assist"}
          </Button>
        }
      />
      <DropdownMenuContent>
        {actions.map((action) => (
          <DropdownMenuItem key={action.id} onClick={() => handleAction(action.id)}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
