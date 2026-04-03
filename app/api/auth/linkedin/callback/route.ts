import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import { getAdapter } from "@/lib/platforms/registry"
import type { Platform } from "@/lib/generated/prisma/client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    redirect(`/accounts?error=${encodeURIComponent(error)}`)
  }

  if (!code || !stateParam) {
    redirect("/accounts?error=Missing+code+or+state")
  }

  let state: { platform: Platform; token: string; userId: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64").toString("utf8"))
  } catch {
    redirect("/accounts?error=Invalid+state")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`

  try {
    const adapter = getAdapter("linkedin")
    const result = await adapter.handleCallback(code, redirectUri)

    // Validate tokenExpiresAt — some platforms return invalid dates
    const tokenExpiresAt = result.tokenExpiresAt instanceof Date && !isNaN(result.tokenExpiresAt.getTime())
      ? result.tokenExpiresAt
      : null

    await db.socialAccount.upsert({
      where: {
        platform_platformUserId: {
          platform: result.platform,
          platformUserId: result.platformUserId,
        },
      },
      update: {
        platformUsername: result.platformUsername,
        accessToken: encrypt(result.accessToken),
        refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
        tokenExpiresAt,
      },
      create: {
        platform: result.platform,
        platformUserId: result.platformUserId,
        platformUsername: result.platformUsername,
        accessToken: encrypt(result.accessToken),
        refreshToken: result.refreshToken ? encrypt(result.refreshToken) : null,
        tokenExpiresAt,
        connectedBy: state.userId,
      },
    })

    redirect(`/accounts?success=linkedin+connected`)
  } catch (err: any) {
    // Next.js redirect() throws a special error — let it pass through
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
    const fullMessage = err instanceof Error ? err.message : "Unknown error"
    const message = fullMessage.length > 100 ? fullMessage.substring(0, 100) + '...' : fullMessage
    console.error('LinkedIn callback error:', fullMessage)
    redirect(`/accounts?error=${encodeURIComponent(message)}`)
  }
}
