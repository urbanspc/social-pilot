"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function createKeywordRule(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const role = await getUserRole()
  if (role !== "admin") throw new Error("Admin access required")

  const keyword = formData.get("keyword") as string
  const replyTemplate = formData.get("replyTemplate") as string
  const matchType = (formData.get("matchType") as string) ?? "contains"

  if (!keyword?.trim() || !replyTemplate?.trim()) {
    throw new Error("Keyword and reply template are required")
  }

  await db.keywordRule.create({
    data: {
      keyword: keyword.trim(),
      replyTemplate: replyTemplate.trim(),
      matchType: matchType as "exact" | "contains" | "regex",
      isActive: true,
    },
  })

  revalidatePath("/auto-reply/rules")
}

export async function toggleKeywordRule(ruleId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const rule = await db.keywordRule.findUnique({ where: { id: ruleId } })
  if (!rule) throw new Error("Rule not found")

  await db.keywordRule.update({
    where: { id: ruleId },
    data: { isActive: !rule.isActive },
  })

  revalidatePath("/auto-reply/rules")
}

export async function deleteKeywordRule(ruleId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.keywordRule.delete({ where: { id: ruleId } })
  revalidatePath("/auto-reply/rules")
}
