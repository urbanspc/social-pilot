import { Suspense } from "react"
import { AccountList } from "@/components/accounts/account-list"
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"

export default function AccountsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social Accounts</h1>
          <p className="mt-1 text-muted-foreground">
            Connect and manage your social media accounts.
          </p>
        </div>
        <ConnectAccountDialog />
      </div>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <AccountList />
        </Suspense>
      </div>
      <Toaster />
    </div>
  )
}
