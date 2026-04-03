"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FacebookIcon, InstagramIcon, LinkedinIcon, PlusIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const platforms = [
  { id: "facebook", label: "Facebook", icon: FacebookIcon, description: "Connect a Facebook Page" },
  { id: "instagram", label: "Instagram", icon: InstagramIcon, description: "Connect an Instagram Business account" },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon, description: "Connect your LinkedIn profile" },
]

export function ConnectAccountDialog() {
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState<string | null>(null)

  async function handleConnect(platform: string) {
    setConnecting(platform)
    try {
      const res = await fetch("/api/accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      })
      const data = await res.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      }
    } catch {
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Social Account</DialogTitle>
          <DialogDescription>
            Choose a platform to connect. You will be redirected to authorize access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 pt-4">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant="outline"
              className="flex h-auto items-center justify-start gap-3 p-4"
              onClick={() => handleConnect(platform.id)}
              disabled={connecting !== null}
            >
              {connecting === platform.id ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <platform.icon className="h-5 w-5" />
              )}
              <div className="text-left">
                <p className="font-medium">{platform.label}</p>
                <p className="text-sm text-muted-foreground">{platform.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
