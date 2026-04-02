import { auth, currentUser } from "@clerk/nextjs/server"

export type UserRole = "admin" | "member"

export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth()
  return (sessionClaims?.metadata as { role?: UserRole })?.role ?? "member"
}

export async function requireAdmin() {
  const role = await getUserRole()
  if (role !== "admin") {
    throw new Error("Unauthorized: admin access required")
  }
}

export async function getAuthUser() {
  const user = await currentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  const role = await getUserRole()
  return { id: user.id, role, email: user.emailAddresses[0]?.emailAddress }
}
