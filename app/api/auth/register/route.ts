import { NextRequest } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, password } = body

  if (!email || !password) {
    return Response.json({ error: "Email and password are required" }, { status: 400 })
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 400 })
  }

  const passwordHash = await hash(password, 12)

  // First user gets admin role
  const userCount = await db.user.count()
  const role = userCount === 0 ? "admin" : "member"

  await db.user.create({
    data: {
      name: name || null,
      email,
      passwordHash,
      role,
    },
  })

  return Response.json({ success: true })
}
