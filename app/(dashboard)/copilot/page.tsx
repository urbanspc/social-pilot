import { CopilotChat } from "@/components/copilot/chat"

export default function CopilotPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Copilot</h1>
        <p className="mt-1 text-muted-foreground">
          Chat with AI to get content ideas, post suggestions, and performance insights.
        </p>
      </div>
      <CopilotChat />
    </div>
  )
}
