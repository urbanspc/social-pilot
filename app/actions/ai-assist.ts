"use server"

import { auth } from "@/auth"
import Anthropic from "@anthropic-ai/sdk"
import { db } from "@/lib/db"

export async function aiAssistPost(content: string, action: "improve" | "hashtags" | "shorten" | "expand" | "ideas") {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === "placeholder") {
    throw new Error("ANTHROPIC_API_KEY not configured")
  }

  const persona = await db.aIPersona.findFirst({ where: { isDefault: true } })

  const prompts: Record<string, string> = {
    improve: `Improve this social media post. Make it more engaging and compelling. Return only the improved text:\n\n${content}`,
    hashtags: `Suggest 5-10 relevant hashtags for this social media post. Return only the hashtags separated by spaces:\n\n${content}`,
    shorten: `Shorten this social media post while keeping the key message. Return only the shortened text:\n\n${content}`,
    expand: `Expand this social media post with more detail and engagement hooks. Return only the expanded text:\n\n${content}`,
    ideas: `Based on this post topic, suggest 5 related post ideas. Return a numbered list:\n\n${content}`,
  }

  let systemPrompt = "You are a social media content expert. Be concise and practical."
  if (persona) {
    systemPrompt += `\nTone: ${persona.tone}`
    systemPrompt += `\nBusiness: ${persona.businessContext}`
  }

  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: "user", content: prompts[action] ?? prompts.improve }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  return textBlock?.text ?? ""
}
