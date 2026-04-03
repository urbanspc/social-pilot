import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await db.socialAccount.findMany({
    select: {
      id: true,
      platform: true,
      platformUsername: true,
      tokenExpiresAt: true,
      connectedBy: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const accountsWithHealth = accounts.map((account) => ({
    ...account,
    tokenHealth: !account.tokenExpiresAt
      ? "unknown"
      : account.tokenExpiresAt > new Date()
        ? account.tokenExpiresAt < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ? "expiring_soon"
          : "healthy"
        : "expired",
  }))

  return Response.json(accountsWithHealth)
}
