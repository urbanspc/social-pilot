-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('facebook', 'instagram', 'linkedin');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'scheduled', 'publishing', 'published', 'failed');

-- CreateEnum
CREATE TYPE "PlatformPostStatus" AS ENUM ('pending', 'published', 'failed');

-- CreateEnum
CREATE TYPE "ReplySource" AS ENUM ('keyword_rule', 'ai_generated');

-- CreateEnum
CREATE TYPE "ReplyStatus" AS ENUM ('pending_review', 'approved', 'posted', 'rejected');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('exact', 'contains', 'regex');

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "platformUsername" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "connectedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPost" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "socialAccountId" TEXT NOT NULL,
    "platformPostId" TEXT,
    "status" "PlatformPostStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "PlatformPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "minioKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "platformCommentId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReply" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" "ReplySource" NOT NULL,
    "status" "ReplyStatus" NOT NULL DEFAULT 'pending_review',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3),

    CONSTRAINT "CommentReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordRule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "replyTemplate" TEXT NOT NULL,
    "matchType" "MatchType" NOT NULL DEFAULT 'contains',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeywordRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPersona" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "businessContext" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPersona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_platform_platformUserId_key" ON "SocialAccount"("platform", "platformUserId");

-- CreateIndex
CREATE INDEX "PlatformPost_postId_idx" ON "PlatformPost"("postId");

-- CreateIndex
CREATE INDEX "PlatformPost_socialAccountId_idx" ON "PlatformPost"("socialAccountId");

-- CreateIndex
CREATE INDEX "MediaFile_postId_idx" ON "MediaFile"("postId");

-- CreateIndex
CREATE INDEX "Comment_platformPostId_idx" ON "Comment"("platformPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_platformPostId_platformCommentId_key" ON "Comment"("platformPostId", "platformCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReply_commentId_key" ON "CommentReply"("commentId");

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformPost" ADD CONSTRAINT "PlatformPost_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_platformPostId_fkey" FOREIGN KEY ("platformPostId") REFERENCES "PlatformPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReply" ADD CONSTRAINT "CommentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
