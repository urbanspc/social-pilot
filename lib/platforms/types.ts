import type { SocialAccount, MediaFile, Platform } from "@/lib/generated/prisma/client"

export type PlatformComment = {
  platformCommentId: string
  authorName: string
  content: string
  createdAt: Date
}

export type ConnectResult = {
  platform: Platform
  platformUserId: string
  platformUsername: string
  accessToken: string
  refreshToken: string | null
  tokenExpiresAt: Date | null
}

export interface PlatformAdapter {
  getAuthUrl(redirectUri: string, state: string): string
  handleCallback(code: string, redirectUri: string): Promise<ConnectResult>
  publishPost(account: SocialAccount, content: string, media?: MediaFile[]): Promise<string>
  fetchComments(account: SocialAccount, platformPostId: string): Promise<PlatformComment[]>
  replyToComment(account: SocialAccount, commentId: string, text: string): Promise<void>
  refreshToken(account: SocialAccount): Promise<{
    accessToken: string
    refreshToken: string | null
    tokenExpiresAt: Date | null
  }>
}
