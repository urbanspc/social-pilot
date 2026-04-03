import type { Platform } from "@/lib/generated/prisma/client"
import type { PlatformAdapter } from "./types"
import { MetaAdapter } from "./meta"
import { LinkedInAdapter } from "./linkedin"

const adapters: Record<string, PlatformAdapter> = {
  facebook: new MetaAdapter("facebook"),
  instagram: new MetaAdapter("instagram"),
  linkedin: new LinkedInAdapter(),
}

export function getAdapter(platform: Platform): PlatformAdapter {
  const adapter = adapters[platform]
  if (!adapter) {
    throw new Error(`No adapter for platform: ${platform}`)
  }
  return adapter
}

export function getSupportedPlatforms(): Platform[] {
  return Object.keys(adapters) as Platform[]
}
