import { auth } from "@/auth"
import { NextRequest } from "next/server"
import { uploadFile, getFileUrl } from "@/lib/storage"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"]
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: "File type not allowed" }, { status: 400 })
  }

  // Validate file size (50MB max)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return Response.json({ error: "File too large (max 50MB)" }, { status: 400 })
  }

  const result = await uploadFile(file)

  return Response.json({
    key: result.key,
    url: getFileUrl(result.key),
    size: result.size,
    mimeType: result.mimeType,
    originalName: result.originalName,
  })
}
