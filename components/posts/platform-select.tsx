"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Globe, Camera, Briefcase } from "lucide-react"

type Account = {
  id: string
  platform: string
  platformUsername: string
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

export function PlatformSelect({
  selectedIds,
  onSelectionChange,
}: {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => setAccounts(data))
      .finally(() => setLoading(false))
  }, [])

  function toggleAccount(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No accounts connected. Connect accounts first in the Accounts page.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        const Icon = platformIcons[account.platform] ?? Globe
        const label = platformLabels[account.platform] ?? account.platform
        return (
          <div key={account.id} className="flex items-center gap-3">
            <Checkbox
              id={`platform-${account.id}`}
              checked={selectedIds.includes(account.id)}
              onCheckedChange={() => toggleAccount(account.id)}
            />
            <Label htmlFor={`platform-${account.id}`} className="flex items-center gap-2 cursor-pointer">
              <Icon className="h-4 w-4" />
              <span>{account.platformUsername}</span>
              <span className="text-muted-foreground text-xs">({label})</span>
            </Label>
          </div>
        )
      })}
    </div>
  )
}
