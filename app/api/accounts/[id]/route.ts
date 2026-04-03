import { auth } from "@clerk/nextjs/server"
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = await getUserRole()
  if (role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 })
  }

  const { id } = await params

  const account = await db.socialAccount.findUnique({ where: { id } })
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 })
  }

  await db.socialAccount.delete({ where: { id } })

  return Response.json({ success: true })
}
