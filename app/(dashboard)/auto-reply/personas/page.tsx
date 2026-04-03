import { db } from "@/lib/db"
import { PersonasList } from "@/components/auto-reply/personas-list"
import { Toaster } from "@/components/ui/sonner"

export default async function AIPersonasPage() {
  const personas = await db.aIPersona.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">AI Personas</h1>
        <p className="mt-1 text-muted-foreground">
          Configure AI personality and tone for auto-replies.
        </p>
      </div>
      <div className="mt-6">
        <PersonasList personas={personas} />
      </div>
      <Toaster />
    </div>
  )
}
