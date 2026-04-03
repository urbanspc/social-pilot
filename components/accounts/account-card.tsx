"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Globe, Camera, Briefcase, TrashIcon } from "lucide-react"

type Account = {
  id: string
  platform: string
  platformUsername: string
  tokenExpiresAt: string | null
  tokenHealth: "healthy" | "expiring_soon" | "expired" | "unknown"
  createdAt: string
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Globe,
  instagram: Camera,
  linkedin: Briefcase,
}

const platformLabels: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
}

const healthColors: Record<string, string> = {
  healthy: "bg-green-500/10 text-green-600",
  expiring_soon: "bg-yellow-500/10 text-yellow-600",
  expired: "bg-red-500/10 text-red-600",
  unknown: "bg-muted text-muted-foreground",
}

const healthLabels: Record<string, string> = {
  healthy: "Connected",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  unknown: "Unknown",
}

export function AccountCard({
  account,
  onDisconnect,
}: {
  account: Account
  onDisconnect: (id: string) => void
}) {
  const Icon = platformIcons[account.platform] ?? Globe
  const label = platformLabels[account.platform] ?? account.platform

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium">{account.platformUsername}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={healthColors[account.tokenHealth]}>
            {healthLabels[account.tokenHealth]}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
              <TrashIcon className="h-4 w-4 text-destructive" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect {label}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {account.platformUsername} from Social Copilot.
                  You can reconnect it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDisconnect(account.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
