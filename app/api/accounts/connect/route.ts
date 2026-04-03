import { auth } from "@/auth"
import { NextRequest } from "next/server"
import { getAdapter } from "@/lib/platforms/registry"
import type { Platform } from "@/lib/generated/prisma/client"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id!

  const body = await request.json()
  const platform = body.platform as Platform

  if (!platform) {
    return Response.json({ error: "Platform is required" }, { status: 400 })
  }

  const adapter = getAdapter(platform)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const callbackPlatform = platform === "instagram" ? "meta" : platform === "facebook" ? "meta" : platform
  const redirectUri = `${baseUrl}/api/auth/${callbackPlatform}/callback`

  const stateToken = randomBytes(16).toString("hex")
  const state = JSON.stringify({ platform, token: stateToken, userId })

  const authUrl = adapter.getAuthUrl(redirectUri, Buffer.from(state).toString("base64"))

  return Response.json({ authUrl })
}
