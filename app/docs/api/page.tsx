import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Key, Shield, Zap, AlertCircle, Code2, Globe } from "lucide-react"

// ── Helpers ──────────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: "GET" | "POST" | "PATCH" | "DELETE" }) {
  const styles: Record<string, string> = {
    GET: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    PATCH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
  }
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono border ${styles[method]}`}
    >
      {method}
    </span>
  )
}

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-mono text-[#8b949e]">{lang}</span>
      </div>
      <pre className="bg-[#0d1117] text-[#e6edf3] text-xs leading-relaxed p-5 overflow-x-auto font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

function ParamsTable({
  params,
}: {
  params: { name: string; type: string; required: boolean; description: string }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Parameter
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Type
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Required
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => (
            <tr
              key={p.name}
              className={`border-b border-[var(--color-border)] last:border-0 ${
                i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"
              }`}
            >
              <td className="px-4 py-3">
                <code className="text-xs font-mono text-[#C9A227]">{p.name}</code>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs font-mono text-[var(--color-text-muted)]">{p.type}</code>
              </td>
              <td className="px-4 py-3">
                {p.required ? (
                  <span className="text-xs font-semibold text-red-400">Yes</span>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      {children}
    </section>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
      {children}
    </h2>
  )
}

function EndpointCard({
  method,
  path,
  scope,
  description,
  params,
  curlExample,
  responseExample,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  scope: string
  description: string
  params: { name: string; type: string; required: boolean; description: string }[]
  curlExample: string
  responseExample: string
}) {
  return (
    <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-[var(--color-text)] font-semibold">{path}</code>
        <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30">
          {scope}
        </span>
      </div>
      <div className="p-5 space-y-5 bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-text-muted)]">{description}</p>

        {params.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Query Parameters
            </h4>
            <ParamsTable params={params} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Example Request
            </h4>
            <CodeBlock code={curlExample} lang="bash" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Example Response
            </h4>
            <CodeBlock code={responseExample} lang="json" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApiDocsPage() {
  const navItems = [
    { id: "introduction", label: "Introduction" },
    { id: "authentication", label: "Authentication" },
    { id: "endpoints", label: "Endpoints" },
    { id: "errors", label: "Error Codes" },
    { id: "sdk", label: "SDK" },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-[104px] bg-[var(--color-bg)] min-h-screen">
        {/* Hero */}
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="section-badge inline-flex items-center gap-2">
                <Code2 size={13} />
                API Reference
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[var(--color-text)]">
              KVL TECH <span className="text-gold-gradient">Public API</span>
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mb-6">
              A REST API for programmatic access to your KVL TECH data — orders, leads, analytics,
              and clients. All responses are JSON. Authentication is via API keys.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Globe size={14} />, label: "Base URL: https://kvlbusinesssolutions.com/api/v1" },
                { icon: <Shield size={14} />, label: "Bearer Token Auth" },
                { icon: <Zap size={14} />, label: "100 req/min rate limit" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-xs font-medium text-[var(--color-text)]"
                >
                  <span className="text-[#C9A227]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 flex gap-10">
          {/* Sidebar nav */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-28 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 px-2">
                On this page
              </p>
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* 1. Introduction */}
            <Section id="introduction">
              <SectionHeading>Introduction</SectionHeading>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                The KVL TECH Public API gives you programmatic access to your business data. It
                follows REST conventions — resources are addressed by URL, operations map to HTTP
                verbs, and all responses are JSON.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Base URL", value: "https://kvlbusinesssolutions.com/api/v1" },
                  { label: "Format", value: "application/json" },
                  { label: "Authentication", value: "Bearer token (API key)" },
                  { label: "Rate Limit", value: "100 requests per minute" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        {item.label}
                      </p>
                      <p className="text-sm font-mono text-[var(--color-text)] mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2. Authentication */}
            <Section id="authentication">
              <SectionHeading>Authentication</SectionHeading>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                All API requests must be authenticated using an API key. Generate your key in the{" "}
                <Link href="/admin/api-keys" className="text-[#C9A227] hover:underline font-medium">
                  Admin Panel → API Keys
                </Link>
                . Two authentication methods are supported:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-3">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-[#C9A227]" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      Method 1: Authorization Header (recommended)
                    </span>
                  </div>
                  <CodeBlock code={`Authorization: Bearer kvl_xxxx_your_api_key_here`} lang="http" />
                </div>

                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-3">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-[#C9A227]" />
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      Method 2: X-Api-Key Header
                    </span>
                  </div>
                  <CodeBlock code={`X-Api-Key: kvl_xxxx_your_api_key_here`} lang="http" />
                </div>
              </div>

              <div className="flex gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                  Keep your API key secret. Do not expose it in client-side code or public
                  repositories. Each key enforces a rate limit of{" "}
                  <strong>100 requests per minute</strong>. Exceeding this returns HTTP 429.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)] mb-3">Scopes</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  Each API key has a set of scopes that control which endpoints it can access. Assign
                  scopes when creating the key in the admin panel.
                </p>
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          Scope
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          Access
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { scope: "read:orders", access: "List and retrieve orders" },
                        { scope: "read:leads", access: "List and retrieve contact leads" },
                        { scope: "read:analytics", access: "Access analytics summary data" },
                        { scope: "read:clients", access: "List and retrieve clients" },
                        { scope: "admin", access: "Unrestricted access to all endpoints" },
                      ].map((row, i) => (
                        <tr
                          key={row.scope}
                          className={`border-b border-[var(--color-border)] last:border-0 ${
                            i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <code className="text-xs font-mono text-[#C9A227]">{row.scope}</code>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{row.access}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            {/* 3. Endpoints */}
            <Section id="endpoints">
              <SectionHeading>Endpoints</SectionHeading>

              <EndpointCard
                method="GET"
                path="/api/v1/orders"
                scope="read:orders"
                description="Returns a paginated list of all orders, including client and product information."
                params={[
                  { name: "limit", type: "integer", required: false, description: "Number of records per page (default: 20, max: 100)" },
                  { name: "page", type: "integer", required: false, description: "Page number, 1-indexed (default: 1)" },
                  { name: "status", type: "string", required: false, description: "Filter by order status: PAYMENT_PENDING, ACTIVE, COMPLETED, CANCELLED" },
                ]}
                curlExample={`curl https://kvlbusinesssolutions.com/api/v1/orders \\
  -H "Authorization: Bearer kvl_xxxx_your_key" \\
  -G \\
  -d limit=10 \\
  -d page=1`}
                responseExample={`{
  "data": [
    {
      "id": "clx1abc...",
      "orderNumber": "KVL-2026-0001",
      "status": "ACTIVE",
      "amount": 29900,
      "plan": "PREMIUM",
      "createdAt": "2026-06-01T09:00:00.000Z",
      "client": {
        "name": "Acme Corp",
        "email": "billing@acme.com"
      },
      "product": {
        "name": "E-Commerce Website"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/v1/leads"
                scope="read:leads"
                description="Returns a paginated list of contact leads from the CRM pipeline."
                params={[
                  { name: "limit", type: "integer", required: false, description: "Number of records per page (default: 20, max: 100)" },
                  { name: "page", type: "integer", required: false, description: "Page number, 1-indexed (default: 1)" },
                ]}
                curlExample={`curl https://kvlbusinesssolutions.com/api/v1/leads \\
  -H "Authorization: Bearer kvl_xxxx_your_key" \\
  -G \\
  -d limit=20`}
                responseExample={`{
  "data": [
    {
      "id": "clx2def...",
      "name": "Jane Doe",
      "phone": "+91 98765 43210",
      "email": "jane@example.com",
      "service": "Logo Design",
      "source": "contact_form",
      "status": "NEW",
      "score": 72,
      "createdAt": "2026-06-05T14:30:00.000Z"
    }
  ],
  "total": 138,
  "page": 1,
  "limit": 20
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/v1/analytics"
                scope="read:analytics"
                description="Returns a high-level analytics summary including revenue, order counts, lead totals, conversion rate, and 12-month revenue trend."
                params={[]}
                curlExample={`curl https://kvlbusinesssolutions.com/api/v1/analytics \\
  -H "Authorization: Bearer kvl_xxxx_your_key"`}
                responseExample={`{
  "totalRevenue": 1450000,
  "totalOrders": 86,
  "totalLeads": 312,
  "conversionRate": 15.38,
  "monthlyRevenue": [
    { "month": "2025-07", "revenue": 85000 },
    { "month": "2025-08", "revenue": 120000 },
    { "month": "2025-09", "revenue": 95000 },
    { "month": "...", "revenue": "..." }
  ]
}`}
              />

              <EndpointCard
                method="GET"
                path="/api/v1/clients"
                scope="read:clients"
                description="Returns a paginated list of registered clients with their contact and account details."
                params={[
                  { name: "limit", type: "integer", required: false, description: "Number of records per page (default: 20, max: 100)" },
                  { name: "page", type: "integer", required: false, description: "Page number, 1-indexed (default: 1)" },
                ]}
                curlExample={`curl https://kvlbusinesssolutions.com/api/v1/clients \\
  -H "Authorization: Bearer kvl_xxxx_your_key" \\
  -G \\
  -d limit=20 \\
  -d page=1`}
                responseExample={`{
  "data": [
    {
      "id": "clx3ghi...",
      "name": "Ravi Kumar",
      "email": "ravi@startup.in",
      "phone": "+91 99001 12233",
      "company": "Startup India",
      "city": "Bengaluru",
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "total": 94,
  "page": 1,
  "limit": 20
}`}
              />
            </Section>

            {/* 4. Error Codes */}
            <Section id="errors">
              <SectionHeading>Error Codes</SectionHeading>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                All errors return a JSON body with an <code className="text-[#C9A227] bg-[var(--color-bg-secondary)] px-1 py-0.5 rounded text-xs">error</code> field
                describing the problem.
              </p>
              <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-24">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-32">
                        Code
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        status: "401",
                        code: "Unauthorized",
                        meaning: "Missing or invalid API key. Ensure you are sending a valid key via Authorization: Bearer or X-Api-Key.",
                        color: "text-red-400",
                      },
                      {
                        status: "403",
                        code: "Forbidden",
                        meaning: "Your API key does not have the required scope for this endpoint. Update the key's scopes in the admin panel.",
                        color: "text-orange-400",
                      },
                      {
                        status: "429",
                        code: "Too Many Requests",
                        meaning: "You have exceeded the rate limit of 100 requests per minute. Wait until the next minute window before retrying.",
                        color: "text-amber-400",
                      },
                      {
                        status: "500",
                        code: "Server Error",
                        meaning: "An unexpected server-side error occurred. These are rare — if they persist, contact support.",
                        color: "text-gray-400",
                      },
                    ].map((row, i) => (
                      <tr
                        key={row.status}
                        className={`border-b border-[var(--color-border)] last:border-0 ${
                          i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-bg-secondary)]"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className={`font-bold font-mono text-sm ${row.color}`}>{row.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-[var(--color-text)]">{row.code}</code>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)]">{row.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">Error Response Format</h3>
                <CodeBlock
                  lang="json"
                  code={`{
  "error": "Insufficient scope. Required: read:orders"
}`}
                />
              </div>
            </Section>

            {/* 5. SDK */}
            <Section id="sdk">
              <SectionHeading>JavaScript / Node.js SDK</SectionHeading>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                No package needed — use this lightweight wrapper to interact with the API in any
                JavaScript or Node.js environment.
              </p>
              <CodeBlock
                lang="javascript"
                code={`// KVL TECH API — JavaScript SDK snippet
const kvl = {
  baseUrl: "https://kvlbusinesssolutions.com/api/v1",
  apiKey: "your_api_key_here",

  async get(path, params = {}) {
    const url = new URL(this.baseUrl + path)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url, {
      headers: { "Authorization": \`Bearer \${this.apiKey}\` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || \`HTTP \${res.status}\`)
    }
    return res.json()
  },

  orders:    { list: (p) => kvl.get("/orders",    p) },
  leads:     { list: (p) => kvl.get("/leads",     p) },
  analytics: { get:  ()  => kvl.get("/analytics")   },
  clients:   { list: (p) => kvl.get("/clients",   p) },
}

// Examples:
const { data: orders } = await kvl.orders.list({ limit: 10, page: 1 })
const { data: leads  } = await kvl.leads.list({ limit: 20 })
const analytics        = await kvl.analytics.get()
const { data: clients} = await kvl.clients.list({ limit: 50 })`}
              />

              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-3">
                <div className="flex items-center gap-2">
                  <Code2 size={15} className="text-[#C9A227]" />
                  <span className="text-sm font-semibold text-[var(--color-text)]">Node.js Example</span>
                </div>
                <CodeBlock
                  lang="javascript"
                  code={`import { kvl } from "./kvl-sdk.js"

// Fetch all orders this month
const result = await kvl.orders.list({ limit: 100, status: "ACTIVE" })
console.log(\`\${result.total} active orders\`)
result.data.forEach(order => {
  console.log(\`\${order.orderNumber} — \${order.client.name} — ₹\${order.amount}\`)
})`}
                />
              </div>
            </Section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
