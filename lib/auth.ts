import { auth } from "@/auth"

export type UserRole = "admin" | "member"

export async function getSession() {
  const session = await auth()
  return session
}

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}

export async function getUserRole(): Promise<UserRole> {
  const session = await auth()
  return ((session?.user as { role?: string })?.role as UserRole) ?? "member"
}

export async function requireAdmin() {
  const user = await requireAuth()
  const role = (user as { role?: string }).role ?? "member"
  if (role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
  return user
}

export async function getAuthUser() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  const user = session.user
  return {
    id: user.id!,
    role: ((user as { role?: string }).role as UserRole) ?? "member",
    email: user.email!,
  }
}
