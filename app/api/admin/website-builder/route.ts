import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  generateWebsiteContent,
  generateSection,
  websiteToHTML,
  type GeneratedWebsite,
  type WebsiteSection,
} from "@/lib/website-builder"

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error: "AI Website Builder requires GROQ_API_KEY to be set in your .env file.",
        hint: "Add GROQ_API_KEY=your_key_here to .env and restart the server.",
      },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { action } = body

    // Regenerate a single section
    if (action === "regenerate-section") {
      const { sectionType, businessName, industry, tone } = body as {
        action: string
        sectionType: WebsiteSection["type"]
        businessName: string
        industry: string
        tone?: string
      }

      if (!sectionType || !businessName || !industry) {
        return NextResponse.json(
          { error: "sectionType, businessName, and industry are required" },
          { status: 400 }
        )
      }

      const section = await generateSection(sectionType, { businessName, industry, tone })
      return NextResponse.json({ section })
    }

    // Export as HTML file
    if (action === "export") {
      const { website } = body as { action: string; website: GeneratedWebsite }

      if (!website) {
        return NextResponse.json({ error: "website object is required" }, { status: 400 })
      }

      const html = websiteToHTML(website)
      const fileName = `${website.businessName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-website.html`

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      })
    }

    // Generate full website (default action)
    const { prompt, industry, style, language } = body as {
      prompt: string
      industry?: string
      style?: "modern" | "classic" | "minimal" | "corporate"
      language?: "english" | "hindi" | "both"
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    const website = await generateWebsiteContent(prompt, { industry, style, language })
    const htmlPreview = websiteToHTML(website)

    return NextResponse.json({ website, htmlPreview })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    console.error("[website-builder] error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
