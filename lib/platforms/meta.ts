import type { SocialAccount, MediaFile, Platform } from "@/lib/generated/prisma/client"
import type { PlatformAdapter, PlatformComment, ConnectResult } from "./types"
import { decrypt } from "@/lib/encryption"

const META_GRAPH_URL = "https://graph.facebook.com/v21.0"

export class MetaAdapter implements PlatformAdapter {
  private platform: "facebook" | "instagram"

  constructor(platform: "facebook" | "instagram") {
    this.platform = platform
  }

  private getAppId(): string {
    const id = process.env.META_APP_ID
    if (!id) throw new Error("META_APP_ID is required")
    return id
  }

  private getAppSecret(): string {
    const secret = process.env.META_APP_SECRET
    if (!secret) throw new Error("META_APP_SECRET is required")
    return secret
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = [
      "pages_manage_posts",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
    ].join(",")

    const params = new URLSearchParams({
      client_id: this.getAppId(),
      redirect_uri: redirectUri,
      state,
      scope: scopes,
      response_type: "code",
    })

    return `https://www.facebook.com/v21.0/dialog/oauth?${params}`
  }

  async handleCallback(code: string, redirectUri: string): Promise<ConnectResult> {
    // Exchange code for short-lived token
    const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      client_id: this.getAppId(),
      client_secret: this.getAppSecret(),
      redirect_uri: redirectUri,
      code,
    })}`

    const tokenRes = await fetch(tokenUrl)
    if (!tokenRes.ok) {
      const err = await tokenRes.json()
      throw new Error(`Meta token exchange failed: ${err.error?.message ?? "Unknown error"}`)
    }
    const { access_token: shortToken } = await tokenRes.json()

    // Exchange for long-lived token (60 days)
    const longTokenUrl = `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.getAppId(),
      client_secret: this.getAppSecret(),
      fb_exchange_token: shortToken,
    })}`

    const longRes = await fetch(longTokenUrl)
    if (!longRes.ok) {
      throw new Error("Failed to exchange for long-lived token")
    }
    const { access_token: longToken, expires_in } = await longRes.json()

    if (this.platform === "facebook") {
      return this.connectFacebookPage(longToken, expires_in)
    } else {
      return this.connectInstagramAccount(longToken, expires_in)
    }
  }

  private async connectFacebookPage(token: string, expiresIn: number): Promise<ConnectResult> {
    const pagesRes = await fetch(`${META_GRAPH_URL}/me/accounts?access_token=${token}`)
    if (!pagesRes.ok) throw new Error("Failed to fetch Facebook pages")
    const { data: pages } = await pagesRes.json()

    if (!pages || pages.length === 0) {
      throw new Error("No Facebook pages found. You need a Facebook Page to connect.")
    }

    const page = pages[0]

    return {
      platform: "facebook" as Platform,
      platformUserId: page.id,
      platformUsername: page.name,
      accessToken: page.access_token,
      refreshToken: token,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    }
  }

  private async connectInstagramAccount(token: string, expiresIn: number): Promise<ConnectResult> {
    const pagesRes = await fetch(
      `${META_GRAPH_URL}/me/accounts?fields=id,name,instagram_business_account&access_token=${token}`
    )
    if (!pagesRes.ok) throw new Error("Failed to fetch pages for Instagram")
    const { data: pages } = await pagesRes.json()

    const pageWithIg = pages?.find((p: { instagram_business_account?: { id: string } }) => p.instagram_business_account)
    if (!pageWithIg) {
      throw new Error("No Instagram Business account found connected to your Facebook pages.")
    }

    const igAccountId = pageWithIg.instagram_business_account.id

    const igRes = await fetch(
      `${META_GRAPH_URL}/${igAccountId}?fields=username&access_token=${token}`
    )
    if (!igRes.ok) throw new Error("Failed to fetch Instagram account details")
    const igData = await igRes.json()

    return {
      platform: "instagram" as Platform,
      platformUserId: igAccountId,
      platformUsername: igData.username ?? pageWithIg.name,
      accessToken: pageWithIg.access_token,
      refreshToken: token,
      tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    }
  }

  async publishPost(account: SocialAccount, content: string, media?: MediaFile[]): Promise<string> {
    const token = decrypt(account.accessToken)

    if (this.platform === "facebook") {
      const res = await fetch(`${META_GRAPH_URL}/${account.platformUserId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, access_token: token }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(`Facebook publish failed: ${err.error?.message}`)
      }
      const data = await res.json()
      return data.id
    } else {
      const containerRes = await fetch(`${META_GRAPH_URL}/${account.platformUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: content, access_token: token }),
      })
      if (!containerRes.ok) throw new Error("Instagram media container creation failed")
      const { id: containerId } = await containerRes.json()

      const publishRes = await fetch(`${META_GRAPH_URL}/${account.platformUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerId, access_token: token }),
      })
      if (!publishRes.ok) throw new Error("Instagram publish failed")
      const data = await publishRes.json()
      return data.id
    }
  }

  async fetchComments(account: SocialAccount, platformPostId: string): Promise<PlatformComment[]> {
    const token = decrypt(account.accessToken)
    const res = await fetch(
      `${META_GRAPH_URL}/${platformPostId}/comments?fields=id,from,message,created_time&access_token=${token}`
    )
    if (!res.ok) return []
    const { data } = await res.json()

    return (data ?? []).map((c: { id: string; from?: { name: string }; message: string; created_time: string }) => ({
      platformCommentId: c.id,
      authorName: c.from?.name ?? "Unknown",
      content: c.message,
      createdAt: new Date(c.created_time),
    }))
  }

  async replyToComment(account: SocialAccount, commentId: string, text: string): Promise<void> {
    const token = decrypt(account.accessToken)
    const res = await fetch(`${META_GRAPH_URL}/${commentId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, access_token: token }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Reply failed: ${err.error?.message}`)
    }
  }

  async refreshToken(account: SocialAccount): Promise<{
    accessToken: string
    refreshToken: string | null
    tokenExpiresAt: Date | null
  }> {
    const currentRefresh = account.refreshToken ? decrypt(account.refreshToken) : null
    if (!currentRefresh) throw new Error("No refresh token available")

    const url = `${META_GRAPH_URL}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: this.getAppId(),
      client_secret: this.getAppSecret(),
      fb_exchange_token: currentRefresh,
    })}`

    const res = await fetch(url)
    if (!res.ok) throw new Error("Meta token refresh failed")
    const { access_token, expires_in } = await res.json()

    return {
      accessToken: access_token,
      refreshToken: access_token,
      tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
    }
  }
}
