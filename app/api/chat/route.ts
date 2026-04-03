import { auth } from "@/auth"
import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "placeholder") {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  }

  const body = await request.json()
  const { messages, context } = body as {
    messages: { role: "user" | "assistant"; content: string }[]
    context?: string
  }

  if (!messages || messages.length === 0) {
    return Response.json({ error: "Messages required" }, { status: 400 })
  }

  // Build system prompt with business context
  const persona = await db.aIPersona.findFirst({ where: { isDefault: true } })

  let systemPrompt = `You are Social Copilot AI, a helpful social media assistant. You help with:
- Writing post captions and content
- Suggesting hashtags and improvements
- Generating content ideas
- Analyzing social media strategy
- Answering questions about social media best practices

Keep responses concise and actionable.`

  if (persona) {
    systemPrompt += `\n\nBusiness context: ${persona.businessContext}`
    systemPrompt += `\nTone: ${persona.tone}`
    systemPrompt += `\nAdditional instructions: ${persona.instructions}`
  }

  if (context) {
    systemPrompt += `\n\nAdditional context: ${context}`
  }

  try {
    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const textBlock = response.content.find((b) => b.type === "text")
    const reply = textBlock?.text ?? ""

    return Response.json({
      reply,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
