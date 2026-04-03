import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getUserRole } from "@/lib/auth"
import {
  ShieldCheckIcon,
  DatabaseIcon,
  BotIcon,
  KeyIcon,
} from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  const role = await getUserRole()

  const [accountCount, postCount, ruleCount, personaCount] = await Promise.all([
    db.socialAccount.count(),
    db.post.count(),
    db.keywordRule.count(),
    db.aIPersona.count(),
  ])

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "placeholder"
  const hasMetaKeys = !!process.env.META_APP_ID && process.env.META_APP_ID !== "placeholder"
  const hasLinkedInKeys = !!process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== "placeholder"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Team settings and configuration.
        </p>
      </div>

      {/* User info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            Your Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm">{session?.user?.email ?? "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Role</span>
            <Badge variant="secondary">{role}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="text-xs text-muted-foreground font-mono">{session?.user?.id}</span>
          </div>
        </CardContent>
      </Card>

      {/* System status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>Overview of configured services and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connected Accounts</span>
            <Badge variant="secondary">{accountCount}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Total Posts</span>
            <Badge variant="secondary">{postCount}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Keyword Rules</span>
            <Badge variant="secondary">{ruleCount}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">AI Personas</span>
            <Badge variant="secondary">{personaCount}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>Status of external service connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className="h-4 w-4" />
              <span className="text-sm">Claude AI (Anthropic)</span>
            </div>
            <Badge className={hasAnthropicKey ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
              {hasAnthropicKey ? "Configured" : "Not configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">Meta (Facebook + Instagram)</span>
            <Badge className={hasMetaKeys ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
              {hasMetaKeys ? "Configured" : "Not configured"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm">LinkedIn</span>
            <Badge className={hasLinkedInKeys ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
              {hasLinkedInKeys ? "Configured" : "Not configured"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To configure API keys, update the environment variables in your <code className="rounded bg-muted px-1">.env</code> file:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> — Get from anthropic.com</li>
            <li><code className="rounded bg-muted px-1">META_APP_ID</code> / <code className="rounded bg-muted px-1">META_APP_SECRET</code> — Get from developers.facebook.com</li>
            <li><code className="rounded bg-muted px-1">LINKEDIN_CLIENT_ID</code> / <code className="rounded bg-muted px-1">LINKEDIN_CLIENT_SECRET</code> — Get from linkedin.com/developers</li>
          </ul>
          <p className="mt-2">After updating, restart the application for changes to take effect.</p>
        </CardContent>
      </Card>
    </div>
  )
}
