import Anthropic from "@anthropic-ai/sdk"

type KeywordRule = {
  id: string
  keyword: string
  replyTemplate: string
  matchType: "exact" | "contains" | "regex"
  isActive: boolean
}

type AIPersona = {
  name: string
  tone: string
  businessContext: string
  instructions: string
}

export function matchKeywordRule(comment: string, rules: KeywordRule[]): KeywordRule | null {
  const activeRules = rules.filter((r) => r.isActive)

  for (const rule of activeRules) {
    switch (rule.matchType) {
      case "exact":
        if (comment.toLowerCase() === rule.keyword.toLowerCase()) return rule
        break
      case "contains":
        if (comment.toLowerCase().includes(rule.keyword.toLowerCase())) return rule
        break
      case "regex":
        try {
          if (new RegExp(rule.keyword, "i").test(comment)) return rule
        } catch {
          // Invalid regex, skip
        }
        break
    }
  }

  return null
}

export async function generateAIReply(
  comment: string,
  authorName: string,
  persona: AIPersona
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required")

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system: `You are a social media community manager. Your persona: ${persona.name}.
Tone: ${persona.tone}
Business context: ${persona.businessContext}
Instructions: ${persona.instructions}

Write a brief, natural reply to the comment below. Keep it concise (1-3 sentences). Be helpful and on-brand. Do not use hashtags in replies.`,
    messages: [
      {
        role: "user",
        content: `Comment from ${authorName}: "${comment}"\n\nWrite a reply:`,
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === "text")
  return textBlock?.text ?? ""
}
