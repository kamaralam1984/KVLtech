import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { websiteToHTML, type GeneratedWebsite } from "@/lib/website-builder"
import { promises as fs } from "fs"
import path from "path"

const SITES_DIR = path.join(process.cwd(), "public", "generated-sites")

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50)
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await req.json()) as { website: GeneratedWebsite; subdomain?: string }
    const { website, subdomain } = body

    if (!website?.businessName) {
      return NextResponse.json({ error: "website object with businessName is required" }, { status: 400 })
    }

    // Validate businessName: alphanumeric + hyphens only, max 50 chars
    const rawName = subdomain || website.businessName
    const slug = slugify(rawName)

    if (!slug || slug.length > 50 || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid businessName: must be alphanumeric + hyphens only, max 50 chars" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const deploySlug = `${slug}-${timestamp}`
    const siteDir = path.join(SITES_DIR, deploySlug)

    await ensureDir(siteDir)

    const htmlContent = websiteToHTML(website)

    // Extract style block from HTML for separate style.css
    const styleMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/)
    const css = styleMatch ? styleMatch[1].trim() : ""

    await Promise.all([
      fs.writeFile(path.join(siteDir, "index.html"), htmlContent, "utf-8"),
      fs.writeFile(path.join(siteDir, "style.css"), css, "utf-8"),
      fs.writeFile(
        path.join(siteDir, "site.json"),
        JSON.stringify(website, null, 2),
        "utf-8"
      ),
    ])

    const deployUrl = `/preview/${deploySlug}`
    const downloadUrl = `/generated-sites/${deploySlug}/index.html`
    const previewPath = `/generated-sites/${deploySlug}`

    return NextResponse.json({
      deployUrl,
      downloadUrl,
      previewPath,
      slug: deploySlug,
      deployedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deploy failed"
    console.error("[website-builder/deploy] error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
