import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { websiteToHTML, type GeneratedWebsite } from "@/lib/website-builder"
import { promises as fs } from "fs"
import path from "path"

const SITES_DIR = path.join(process.cwd(), "public", "generated-sites")

async function ensureDir() {
  try {
    await fs.mkdir(SITES_DIR, { recursive: true })
  } catch {
    // already exists
  }
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40)
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { website } = (await req.json()) as { website: GeneratedWebsite }

    if (!website?.businessName) {
      return NextResponse.json({ error: "website object is required" }, { status: 400 })
    }

    await ensureDir()

    const slug = slugify(website.businessName)
    const timestamp = Date.now()
    const baseName = `${slug}-${timestamp}`

    const jsonPath = path.join(SITES_DIR, `${baseName}.json`)
    const htmlPath = path.join(SITES_DIR, `${baseName}.html`)

    const html = websiteToHTML(website)

    await Promise.all([
      fs.writeFile(jsonPath, JSON.stringify(website, null, 2), "utf-8"),
      fs.writeFile(htmlPath, html, "utf-8"),
    ])

    const previewUrl = `/generated-sites/${baseName}.html`

    return NextResponse.json({
      jsonPath: `/generated-sites/${baseName}.json`,
      htmlPath: previewUrl,
      previewUrl,
      fileName: baseName,
      savedAt: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed"
    console.error("[website-builder/save] error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await ensureDir()

    const files = await fs.readdir(SITES_DIR)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const sites = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(SITES_DIR, file)
        const stat = await fs.stat(filePath)
        const baseName = file.replace(".json", "")

        let businessName = baseName
        let industry = ""
        let tagline = ""

        try {
          const raw = await fs.readFile(filePath, "utf-8")
          const data = JSON.parse(raw) as GeneratedWebsite
          businessName = data.businessName || baseName
          industry = data.industry || ""
          tagline = data.tagline || ""
        } catch {
          // skip parse errors
        }

        return {
          fileName: baseName,
          businessName,
          industry,
          tagline,
          jsonUrl: `/generated-sites/${baseName}.json`,
          htmlUrl: `/generated-sites/${baseName}.html`,
          previewUrl: `/generated-sites/${baseName}.html`,
          savedAt: stat.mtime.toISOString(),
          size: stat.size,
        }
      })
    )

    // Sort newest first
    sites.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())

    return NextResponse.json({ sites, count: sites.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
