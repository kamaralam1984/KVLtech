/**
 * Prometheus-compatible in-memory metrics library.
 * All metrics reset on server restart — standard for short-lived scrapers.
 */

type Labels = Record<string, string>

function labelKey(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))
  return JSON.stringify(entries)
}

function labelStr(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) return ""
  return "{" + entries.map(([k, v]) => `${k}="${v}"`).join(",") + "}"
}

// ── Counter ──────────────────────────────────────────────────────────────────

class Counter {
  private values = new Map<string, { labels: Labels; value: number }>()

  inc(labels: Labels = {}, amount = 1): void {
    const key = labelKey(labels)
    const existing = this.values.get(key)
    if (existing) {
      existing.value += amount
    } else {
      this.values.set(key, { labels, value: amount })
    }
  }

  get(labels: Labels = {}): number {
    return this.values.get(labelKey(labels))?.value ?? 0
  }

  toPrometheusLines(name: string, help: string): string[] {
    const lines: string[] = [
      `# HELP ${name} ${help}`,
      `# TYPE ${name} counter`,
    ]
    for (const { labels, value } of this.values.values()) {
      lines.push(`${name}${labelStr(labels)} ${value}`)
    }
    if (this.values.size === 0) {
      lines.push(`${name} 0`)
    }
    return lines
  }
}

// ── Histogram ────────────────────────────────────────────────────────────────

class Histogram {
  private buckets: number[]
  // Map from label-key → bucket counts array (length = buckets.length + 1 for +Inf)
  private counts = new Map<string, { labels: Labels; bucketCounts: number[]; sum: number; total: number }>()

  constructor(buckets: number[]) {
    this.buckets = [...buckets].sort((a, b) => a - b)
  }

  observe(value: number, labels: Labels = {}): void {
    const key = labelKey(labels)
    let entry = this.counts.get(key)
    if (!entry) {
      entry = {
        labels,
        bucketCounts: new Array(this.buckets.length + 1).fill(0),
        sum: 0,
        total: 0,
      }
      this.counts.set(key, entry)
    }

    // Cumulative buckets
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        entry.bucketCounts[i]++
      }
    }
    entry.bucketCounts[this.buckets.length]++ // +Inf
    entry.sum += value
    entry.total++
  }

  toPrometheusLines(name: string, help: string): string[] {
    const lines: string[] = [
      `# HELP ${name} ${help}`,
      `# TYPE ${name} histogram`,
    ]

    for (const { labels, bucketCounts, sum, total } of this.counts.values()) {
      const base = labelStr(labels)
      const lStr = base === "" ? "" : base.slice(0, -1) // strip trailing }
      const sep = lStr === "" ? "{" : lStr + ","

      for (let i = 0; i < this.buckets.length; i++) {
        lines.push(`${name}_bucket${sep}le="${this.buckets[i]}"} ${bucketCounts[i]}`)
      }
      lines.push(`${name}_bucket${sep}le="+Inf"} ${bucketCounts[this.buckets.length]}`)
      lines.push(`${name}_sum${base} ${sum}`)
      lines.push(`${name}_count${base} ${total}`)
    }

    return lines
  }
}

// ── Gauge ────────────────────────────────────────────────────────────────────

class Gauge {
  private values = new Map<string, { labels: Labels; value: number }>()

  set(value: number, labels: Labels = {}): void {
    const key = labelKey(labels)
    this.values.set(key, { labels, value })
  }

  inc(labels: Labels = {}, amount = 1): void {
    const key = labelKey(labels)
    const existing = this.values.get(key)
    if (existing) {
      existing.value += amount
    } else {
      this.values.set(key, { labels, value: amount })
    }
  }

  dec(labels: Labels = {}, amount = 1): void {
    this.inc(labels, -amount)
  }

  get(labels: Labels = {}): number {
    return this.values.get(labelKey(labels))?.value ?? 0
  }

  toPrometheusLines(name: string, help: string): string[] {
    const lines: string[] = [
      `# HELP ${name} ${help}`,
      `# TYPE ${name} gauge`,
    ]
    for (const { labels, value } of this.values.values()) {
      lines.push(`${name}${labelStr(labels)} ${value}`)
    }
    if (this.values.size === 0) {
      lines.push(`${name} 0`)
    }
    return lines
  }
}

// ── Singleton Registry ────────────────────────────────────────────────────────

export const metrics = {
  // HTTP
  httpRequestsTotal: new Counter(),
  httpDuration: new Histogram([10, 50, 100, 250, 500, 1000, 2500, 5000]),

  // Business events (counters)
  ordersTotal: new Counter(),
  leadsTotal: new Counter(),
  ticketsTotal: new Counter(),
  aiCallsTotal: new Counter(),
  emailSentTotal: new Counter(),
  webhookDispatchedTotal: new Counter(),
  paymentTotal: new Counter(),

  // DB / AI durations
  dbQueryDuration: new Histogram([1, 5, 10, 25, 50, 100, 250, 500]),
  aiResponseDuration: new Histogram([500, 1000, 2000, 5000, 10000]),

  // Gauges — system
  activeConnections: new Gauge(),
  queueDepth: new Gauge(),
  cacheSize: new Gauge(),
  memoryHeapMb: new Gauge(),
  memoryRssMb: new Gauge(),

  // Gauges — business (refreshed from DB on scrape)
  revenueTotalInr: new Gauge(),
  ordersActiveCount: new Gauge(),
  clientsTotal: new Gauge(),
  leadsPendingCount: new Gauge(),
}

// ── Helper Functions ──────────────────────────────────────────────────────────

export function recordRequest(
  method: string,
  path: string,
  status: number,
  durationMs: number
): void {
  const labels = { method, path, status: String(status) }
  metrics.httpRequestsTotal.inc(labels)
  metrics.httpDuration.observe(durationMs, { method, path })
}

export function recordDbQuery(durationMs: number): void {
  metrics.dbQueryDuration.observe(durationMs)
}

export function recordAiCall(type: string, model: string, durationMs: number): void {
  metrics.aiCallsTotal.inc({ type, model })
  metrics.aiResponseDuration.observe(durationMs, { type })
}

// ── Prometheus Text Output ────────────────────────────────────────────────────

export function generatePrometheusOutput(): string {
  const sections: string[][] = [
    metrics.httpRequestsTotal.toPrometheusLines(
      "http_requests_total",
      "Total HTTP requests by method, path and status"
    ),
    metrics.httpDuration.toPrometheusLines(
      "http_request_duration_ms",
      "HTTP request duration in milliseconds"
    ),
    metrics.ordersTotal.toPrometheusLines(
      "orders_total",
      "Total orders created by status"
    ),
    metrics.leadsTotal.toPrometheusLines(
      "leads_total",
      "Total contact leads by source"
    ),
    metrics.ticketsTotal.toPrometheusLines(
      "tickets_total",
      "Total support tickets created by priority"
    ),
    metrics.aiCallsTotal.toPrometheusLines(
      "ai_calls_total",
      "Total AI API calls by type and model"
    ),
    metrics.emailSentTotal.toPrometheusLines(
      "email_sent_total",
      "Total emails sent by type"
    ),
    metrics.webhookDispatchedTotal.toPrometheusLines(
      "webhook_dispatched_total",
      "Total webhooks dispatched by status"
    ),
    metrics.paymentTotal.toPrometheusLines(
      "payment_total",
      "Total payments by gateway and status"
    ),
    metrics.dbQueryDuration.toPrometheusLines(
      "db_query_duration_ms",
      "DB query duration in milliseconds"
    ),
    metrics.aiResponseDuration.toPrometheusLines(
      "ai_response_duration_ms",
      "AI response duration in milliseconds by type"
    ),
    metrics.activeConnections.toPrometheusLines(
      "active_connections",
      "Currently active WebSocket connections"
    ),
    metrics.queueDepth.toPrometheusLines(
      "queue_depth",
      "Current job queue depth by priority"
    ),
    metrics.cacheSize.toPrometheusLines(
      "cache_size",
      "In-memory cache entry count"
    ),
    metrics.memoryHeapMb.toPrometheusLines(
      "memory_heap_used_mb",
      "Node.js heap used in MB"
    ),
    metrics.memoryRssMb.toPrometheusLines(
      "memory_rss_mb",
      "Node.js RSS memory in MB"
    ),
    metrics.revenueTotalInr.toPrometheusLines(
      "revenue_total_inr",
      "Total captured revenue in INR (from DB)"
    ),
    metrics.ordersActiveCount.toPrometheusLines(
      "orders_active_count",
      "Active orders (not delivered or cancelled)"
    ),
    metrics.clientsTotal.toPrometheusLines(
      "clients_total",
      "Total registered clients"
    ),
    metrics.leadsPendingCount.toPrometheusLines(
      "leads_pending_count",
      "Unprocessed / pending contact leads"
    ),
  ]

  return sections.map((lines) => lines.join("\n")).join("\n\n") + "\n"
}
