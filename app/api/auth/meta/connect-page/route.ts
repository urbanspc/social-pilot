import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"

const META_GRAPH_URL = "https://graph.facebook.com/v21.0"

export async function POST(request: NextRequest) {
  try {
    const { pageId, pageName, longToken, expiresIn, userId } = await request.json()

    if (!pageId || !longToken || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch the page access token for this specific page
    const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?access_token=${longToken}`)
    if (!pagesRes.ok) {
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }
    const { data: pages } = await pagesRes.json()
    const page = pages?.find((p: any) => p.id === pageId)
    if (!page) {
      return NextResponse.json({ error: "Page not found or access denied" }, { status: 404 })
    }

    const tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null

    await db.socialAccount.upsert({
      where: {
        platform_platformUserId: {
          platform: "facebook",
          platformUserId: page.id,
        },
      },
      update: {
        platformUsername: page.name || pageName,
        accessToken: encrypt(page.access_token),
        refreshToken: encrypt(longToken),
        tokenExpiresAt,
      },
      create: {
        platform: "facebook",
        platformUserId: page.id,
        platformUsername: page.name || pageName,
        accessToken: encrypt(page.access_token),
        refreshToken: encrypt(longToken),
        tokenExpiresAt,
        connectedBy: userId,
      },
    })

    return NextResponse.json({ success: true, page: page.name })
  } catch (err: any) {
    console.error("Connect page error:", err)
    return NextResponse.json({ error: err.message || "Failed to connect page" }, { status: 500 })
  }
}
