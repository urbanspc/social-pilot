import { db } from "@/lib/db"
import { KeywordRulesList } from "@/components/auto-reply/keyword-rules-list"
import { Toaster } from "@/components/ui/sonner"

export default async function KeywordRulesPage() {
  const rules = await db.keywordRule.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Keyword Rules</h1>
        <p className="mt-1 text-muted-foreground">
          Define auto-reply rules that trigger on specific keywords in comments.
        </p>
      </div>
      <div className="mt-6">
        <KeywordRulesList rules={rules} />
      </div>
      <Toaster />
    </div>
  )
}
