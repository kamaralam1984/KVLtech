import { promises as fs } from "fs"
import path from "path"

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params

  // Validate slug format to prevent path traversal
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return <SiteNotFound />
  }

  const indexPath = path.join(
    process.cwd(),
    "public",
    "generated-sites",
    slug,
    "index.html"
  )

  let htmlContent: string

  try {
    htmlContent = await fs.readFile(indexPath, "utf-8")
  } catch {
    return <SiteNotFound />
  }

  // Inject KVL TECH powered-by bar before </body>
  const poweredByBar = `
<style>
  #kvl-powered-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background: rgba(11, 20, 55, 0.92);
    backdrop-filter: blur(8px);
    color: #fff;
    text-align: center;
    padding: 6px 16px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  #kvl-powered-bar a {
    color: #C9A227;
    text-decoration: none;
    font-weight: 600;
  }
  #kvl-powered-bar a:hover { text-decoration: underline; }
</style>
<div id="kvl-powered-bar">
  Powered by <a href="https://kvlbusinesssolutions.com" target="_blank" rel="noopener noreferrer">KVL TECH</a>
  &nbsp;·&nbsp; This is a preview site
</div>`

  const injected = htmlContent.replace("</body>", poweredByBar + "\n</body>")

  return (
    <div
      style={{ margin: 0, padding: 0, height: "100vh" }}
      dangerouslySetInnerHTML={{ __html: injected }}
    />
  )
}

function SiteNotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: "#0B1437",
        color: "#fff",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 64 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Site Not Found</h1>
      <p style={{ color: "#aaa", fontSize: 16 }}>
        This preview site does not exist or may have expired.
      </p>
      <a
        href="/"
        style={{
          marginTop: 16,
          padding: "12px 32px",
          background: "#C9A227",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Go Home
      </a>
    </div>
  )
}
