"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AccountCard } from "./account-card"
import { ConnectAccountDialog } from "./connect-account-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

type Account = {
  id: string
  platform: string
  platformUsername: string
  tokenExpiresAt: string | null
  tokenHealth: "healthy" | "expiring_soon" | "expired" | "unknown"
  createdAt: string
}

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const successMsg = searchParams.get("success")
  const errorMsg = searchParams.get("error")

  useEffect(() => {
    fetchAccounts()
  }, [])

  useEffect(() => {
    if (successMsg) {
      toast.success(successMsg)
    }
    if (errorMsg) {
      toast.error(errorMsg)
    }
  }, [successMsg, errorMsg])

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/accounts")
      if (res.ok) {
        const data = await res.json()
        setAccounts(data)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDisconnect(id: string) {
    const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" })
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      toast.success("Account disconnected")
    } else {
      const data = await res.json()
      toast.error(data.error ?? "Failed to disconnect")
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[72px] w-full" />
        <Skeleton className="h-[72px] w-full" />
        <Skeleton className="h-[72px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No accounts connected</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your social media accounts to get started.
          </p>
          <div className="mt-4">
            <ConnectAccountDialog />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
