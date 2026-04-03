import type { SocialAccount, MediaFile, Platform } from "@/lib/generated/prisma/client"
import type { PlatformAdapter, PlatformComment, ConnectResult } from "./types"
import { decrypt } from "@/lib/encryption"

const LINKEDIN_API_URL = "https://api.linkedin.com/v2"
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2"

export class LinkedInAdapter implements PlatformAdapter {
  private getClientId(): string {
    const id = process.env.LINKEDIN_CLIENT_ID
    if (!id) throw new Error("LINKEDIN_CLIENT_ID is required")
    return id
  }

  private getClientSecret(): string {
    const secret = process.env.LINKEDIN_CLIENT_SECRET
    if (!secret) throw new Error("LINKEDIN_CLIENT_SECRET is required")
    return secret
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const scopes = ["openid", "profile", "w_member_social"].join(" ")

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.getClientId(),
      redirect_uri: redirectUri,
      state,
      scope: scopes,
    })

    return `${LINKEDIN_AUTH_URL}/authorization?${params}`
  }

  async handleCallback(code: string, redirectUri: string): Promise<ConnectResult> {
    const tokenRes = await fetch(`${LINKEDIN_AUTH_URL}/accessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
      }),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.json()
      throw new Error(`LinkedIn token exchange failed: ${err.error_description ?? "Unknown error"}`)
    }

    const { access_token, expires_in, refresh_token } = await tokenRes.json()

    const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) throw new Error("Failed to fetch LinkedIn profile")
    const profile = await profileRes.json()

    return {
      platform: "linkedin" as Platform,
      platformUserId: profile.sub,
      platformUsername: profile.name ?? `${profile.given_name} ${profile.family_name}`,
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      tokenExpiresAt: new Date(Date.now() + (expires_in ?? 5184000) * 1000),
    }
  }

  async publishPost(account: SocialAccount, content: string, _media?: MediaFile[]): Promise<string> {
    const token = decrypt(account.accessToken)

    const body = {
      author: `urn:li:person:${account.platformUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    const res = await fetch(`${LINKEDIN_API_URL}/ugcPosts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(`LinkedIn publish failed: ${err.message ?? JSON.stringify(err)}`)
    }

    const postId = res.headers.get("x-restli-id") ?? ""
    return postId
  }

  async fetchComments(account: SocialAccount, platformPostId: string): Promise<PlatformComment[]> {
    const token = decrypt(account.accessToken)

    const res = await fetch(
      `${LINKEDIN_API_URL}/socialActions/${encodeURIComponent(platformPostId)}/comments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.elements ?? []).map((c: { $URN: string; actor: string; message: { text: string }; created: { time: number } }) => ({
      platformCommentId: c.$URN ?? "",
      authorName: c.actor ?? "Unknown",
      content: c.message?.text ?? "",
      createdAt: new Date(c.created?.time ?? Date.now()),
    }))
  }

  async replyToComment(account: SocialAccount, commentId: string, text: string): Promise<void> {
    const token = decrypt(account.accessToken)

    const res = await fetch(
      `${LINKEDIN_API_URL}/socialActions/${encodeURIComponent(commentId)}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          actor: `urn:li:person:${account.platformUserId}`,
          message: { text },
        }),
      }
    )
    if (!res.ok) throw new Error("LinkedIn reply failed")
  }

  async refreshToken(account: SocialAccount): Promise<{
    accessToken: string
    refreshToken: string | null
    tokenExpiresAt: Date | null
  }> {
    const currentRefresh = account.refreshToken ? decrypt(account.refreshToken) : null
    if (!currentRefresh) throw new Error("No refresh token available")

    const res = await fetch(`${LINKEDIN_AUTH_URL}/accessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: currentRefresh,
        client_id: this.getClientId(),
        client_secret: this.getClientSecret(),
      }),
    })

    if (!res.ok) throw new Error("LinkedIn token refresh failed")
    const { access_token, expires_in, refresh_token } = await res.json()

    return {
      accessToken: access_token,
      refreshToken: refresh_token ?? null,
      tokenExpiresAt: new Date(Date.now() + (expires_in ?? 5184000) * 1000),
    }
  }
}
