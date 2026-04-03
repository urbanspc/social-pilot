"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrashIcon } from "lucide-react"
import { createKeywordRule, toggleKeywordRule, deleteKeywordRule } from "@/app/actions/keyword-rules"
import { toast } from "sonner"

type Rule = {
  id: string
  keyword: string
  replyTemplate: string
  matchType: string
  isActive: boolean
  createdAt: Date
}

export function KeywordRulesList({ rules }: { rules: Rule[] }) {
  const [showForm, setShowForm] = useState(false)

  async function handleCreate(formData: FormData) {
    try {
      await createKeywordRule(formData)
      toast.success("Rule created")
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create rule")
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleKeywordRule(id)
    } catch (err) {
      toast.error("Failed to toggle rule")
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteKeywordRule(id)
      toast.success("Rule deleted")
    } catch (err) {
      toast.error("Failed to delete rule")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <form action={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="keyword">Keyword / Phrase</Label>
                  <Input id="keyword" name="keyword" placeholder="e.g., price, shipping" required />
                </div>
                <div>
                  <Label htmlFor="matchType">Match Type</Label>
                  <Select name="matchType" defaultValue="contains">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="exact">Exact Match</SelectItem>
                      <SelectItem value="regex">Regex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="replyTemplate">Reply Template</Label>
                <Textarea
                  id="replyTemplate"
                  name="replyTemplate"
                  placeholder="The reply to send when this keyword is matched..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Save Rule</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {rules.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No keyword rules</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add rules to auto-generate replies when comments contain specific keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rule.keyword}</p>
                    <Badge variant="secondary" className="text-xs">
                      {rule.matchType}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {rule.replyTemplate}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggle(rule.id)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
