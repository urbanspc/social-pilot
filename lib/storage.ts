import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function uploadFile(
  file: File
): Promise<{ key: string; size: number; mimeType: string; originalName: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true })

  const ext = file.name.split(".").pop() ?? ""
  const key = `${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(join(UPLOAD_DIR, key), buffer)

  return {
    key,
    size: file.size,
    mimeType: file.type,
    originalName: file.name,
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    await unlink(join(UPLOAD_DIR, key))
  } catch {
    // File may not exist, ignore
  }
}

export function getFileUrl(key: string): string {
  return `/uploads/${key}`
}
