"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, TrashIcon, StarIcon } from "lucide-react"
import { createPersona, setDefaultPersona, deletePersona } from "@/app/actions/personas"
import { toast } from "sonner"

type Persona = {
  id: string
  name: string
  tone: string
  businessContext: string
  instructions: string
  isDefault: boolean
  createdAt: Date
}

export function PersonasList({ personas }: { personas: Persona[] }) {
  const [showForm, setShowForm] = useState(false)

  async function handleCreate(formData: FormData) {
    try {
      await createPersona(formData)
      toast.success("Persona created")
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create persona")
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultPersona(id)
      toast.success("Default persona updated")
    } catch (err) {
      toast.error("Failed to update default")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deletePersona(id)
      toast.success("Persona deleted")
    } catch (err) {
      toast.error("Failed to delete persona")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Persona
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form action={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Professional, Casual" required />
                </div>
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Input id="tone" name="tone" placeholder="e.g., friendly, formal" required />
                </div>
              </div>
              <div>
                <Label htmlFor="businessContext">Business Context</Label>
                <Textarea
                  id="businessContext"
                  name="businessContext"
                  placeholder="Describe what your business does..."
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  name="instructions"
                  placeholder="Custom guidelines for AI replies (dos and don'ts)..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="isDefault" name="isDefault" value="true" />
                <Label htmlFor="isDefault">Set as default persona</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Persona</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {personas.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No AI personas</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a persona to configure how AI generates auto-replies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {personas.map((persona) => (
            <Card key={persona.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{persona.name}</p>
                      {persona.isDefault && (
                        <Badge className="bg-yellow-500/10 text-yellow-600">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Tone: {persona.tone}</p>
                    {persona.businessContext && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {persona.businessContext}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!persona.isDefault && (
                      <Button variant="ghost" size="icon" onClick={() => handleSetDefault(persona.id)} title="Set as default">
                        <StarIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(persona.id)}>
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
