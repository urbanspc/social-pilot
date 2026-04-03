import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-blue-500/10 text-blue-600" },
  publishing: { label: "Publishing", className: "bg-yellow-500/10 text-yellow-600" },
  published: { label: "Published", className: "bg-green-500/10 text-green-600" },
  failed: { label: "Failed", className: "bg-red-500/10 text-red-600" },
}

export function PostStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.draft
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
