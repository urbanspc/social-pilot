"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getUserRole } from "@/lib/auth"

export async function createPersona(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  const role = await getUserRole()
  if (role !== "admin") throw new Error("Admin access required")

  const name = formData.get("name") as string
  const tone = formData.get("tone") as string
  const businessContext = formData.get("businessContext") as string
  const instructions = formData.get("instructions") as string
  const isDefault = formData.get("isDefault") === "true"

  if (!name?.trim() || !tone?.trim()) {
    throw new Error("Name and tone are required")
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await db.aIPersona.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })
  }

  await db.aIPersona.create({
    data: {
      name: name.trim(),
      tone: tone.trim(),
      businessContext: businessContext?.trim() ?? "",
      instructions: instructions?.trim() ?? "",
      isDefault,
    },
  })

  revalidatePath("/auto-reply/personas")
}

export async function setDefaultPersona(personaId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.aIPersona.updateMany({
    where: { isDefault: true },
    data: { isDefault: false },
  })

  await db.aIPersona.update({
    where: { id: personaId },
    data: { isDefault: true },
  })

  revalidatePath("/auto-reply/personas")
}

export async function deletePersona(personaId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await db.aIPersona.delete({ where: { id: personaId } })
  revalidatePath("/auto-reply/personas")
}
