import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import type { Platform } from "@/lib/generated/prisma/client"
import crypto from "crypto"

const META_GRAPH_URL = "https://graph.facebook.com/v21.0"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) redirect("/accounts?error=Facebook+auth+denied")
  if (!code || !stateParam) redirect("/accounts?error=Missing+code")

  let state: { platform: Platform; token: string; userId: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64").toString("utf8"))
  } catch {
    redirect("/accounts?error=Invalid+state")
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectUri = `${baseUrl}/api/auth/meta/callback`
  const appId = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(`${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code,
    })}`)
    if (!tokenRes.ok) throw new Error("Token exchange failed")
    const { access_token: shortToken } = await tokenRes.json()

    // Exchange for long-lived token
    const longRes = await fetch(`${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token", client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken,
    })}`)
    if (!longRes.ok) throw new Error("Long token failed")
    const { access_token: longToken, expires_in } = await longRes.json()
    const tokenExpiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null

    if (state.platform === "instagram") {
      // Instagram flow
      const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?fields=id,name,instagram_business_account,access_token&access_token=${longToken}`)
      if (!pagesRes.ok) throw new Error("Failed to fetch pages")
      const { data: pages } = await pagesRes.json()
      const pageWithIg = pages?.find((p: any) => p.instagram_business_account)
      if (!pageWithIg) throw new Error("No Instagram Business account found")
      const igId = pageWithIg.instagram_business_account.id
      const igRes = await fetch(`${META_GRAPH_URL}/${igId}?fields=username&access_token=${longToken}`)
      const igData = igRes.ok ? await igRes.json() : {}

      await db.socialAccount.upsert({
        where: { platform_platformUserId: { platform: "instagram", platformUserId: igId } },
        update: { platformUsername: igData.username ?? pageWithIg.name, accessToken: encrypt(pageWithIg.access_token), refreshToken: encrypt(longToken), tokenExpiresAt },
        create: { platform: "instagram", platformUserId: igId, platformUsername: igData.username ?? pageWithIg.name, accessToken: encrypt(pageWithIg.access_token), refreshToken: encrypt(longToken), tokenExpiresAt, connectedBy: state.userId },
      })
      redirect("/accounts?success=instagram+connected")
    }

    // Facebook flow — fetch pages
    const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?fields=id,name,access_token&access_token=${longToken}`)
    if (!pagesRes.ok) throw new Error("Failed to fetch pages")
    const { data: pages } = await pagesRes.json()
    if (!pages || pages.length === 0) redirect("/accounts?error=No+Facebook+pages+found")

    // Connect ALL pages (not just one)
    for (const page of pages) {
      await db.socialAccount.upsert({
        where: { platform_platformUserId: { platform: "facebook", platformUserId: page.id } },
        update: { platformUsername: page.name, accessToken: encrypt(page.access_token), refreshToken: encrypt(longToken), tokenExpiresAt },
        create: { platform: "facebook", platformUserId: page.id, platformUsername: page.name, accessToken: encrypt(page.access_token), refreshToken: encrypt(longToken), tokenExpiresAt, connectedBy: state.userId },
      })
    }

    redirect(`/accounts?success=${pages.length}+Facebook+pages+connected`)
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) throw err
    console.error("Meta callback error:", err.message)
    redirect("/accounts?error=Connection+failed")
  }
}
