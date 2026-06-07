// Extended integrations library — Google Workspace, Meta Ads, Google Ads, LinkedIn, Zapier, Make, n8n

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  description?: string;
  htmlLink?: string;
}

export interface MetaAdStats {
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  ctr: number;
  cpc: number;
  conversions: number;
  roas: number;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget: number;
  spend: number;
}

export interface GoogleAdsStats {
  cost: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  avgCpc: number;
  roas: number;
}

export interface LinkedInStats {
  totalSpend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface LinkedInPost {
  id: string;
  text: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
}

export type KVLEventType =
  | "new_order"
  | "new_lead"
  | "order_delivered"
  | "payment_received"
  | "new_ticket"
  | "ticket_closed";

export interface KVLEvent {
  type: KVLEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface EnabledIntegration {
  slug: string;
  config: Record<string, string>;
  events: string[];
}

export interface DispatchResult {
  integration: string;
  success: boolean;
  error?: string;
}

export interface IntegrationConfig {
  slug: string;
  enabled: boolean;
  config: Record<string, string>;
  events: string[];
  lastSync?: Date;
  lastError?: string;
}

// In-memory config store (keyed by slug)
export const integrationConfigStore = new Map<string, IntegrationConfig>();

// ─── Google Workspace / Gmail ──────────────────────────────────────────────────

export async function sendGmailEmail(
  to: string,
  subject: string,
  body: string,
  accessToken: string
): Promise<boolean> {
  try {
    const raw = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      body,
    ].join("\r\n");

    const encoded = Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const resp = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encoded }),
      }
    );
    return resp.ok;
  } catch {
    return false;
  }
}

// ─── Google Calendar ───────────────────────────────────────────────────────────

export async function getGoogleCalendarEvents(
  accessToken: string,
  calendarId = "primary",
  maxResults = 10
): Promise<CalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      maxResults: String(maxResults),
      orderBy: "startTime",
      singleEvents: "true",
      timeMin: new Date().toISOString(),
    });
    const resp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!resp.ok) return [];
    const data = await resp.json() as { items?: Array<{ id?: string; summary?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string }; description?: string; htmlLink?: string }> };
    return (data.items || []).map((ev) => ({
      id: ev.id || "",
      summary: ev.summary || "",
      start: ev.start?.dateTime || ev.start?.date || "",
      end: ev.end?.dateTime || ev.end?.date || "",
      description: ev.description,
      htmlLink: ev.htmlLink,
    }));
  } catch {
    return [];
  }
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    attendees?: string[];
  }
): Promise<{ id: string; htmlLink: string }> {
  const resp = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start, timeZone: "Asia/Kolkata" },
        end: { dateTime: event.end, timeZone: "Asia/Kolkata" },
        attendees: (event.attendees || []).map((email) => ({ email })),
      }),
    }
  );
  if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`);
  const data = await resp.json() as { id: string; htmlLink: string };
  return { id: data.id, htmlLink: data.htmlLink };
}

// ─── Meta (Facebook/Instagram) Ads ────────────────────────────────────────────

export async function getMetaAdStats(
  accessToken: string,
  adAccountId: string,
  datePreset: "last_7d" | "last_30d" | "this_month" = "last_7d"
): Promise<MetaAdStats> {
  const fields =
    "spend,impressions,clicks,reach,ctr,cpc,actions,action_values";
  const params = new URLSearchParams({
    fields,
    date_preset: datePreset,
    access_token: accessToken,
  });
  const resp = await fetch(
    `https://graph.facebook.com/v18.0/${adAccountId}/insights?${params}`
  );
  if (!resp.ok) throw new Error(`Meta API error: ${resp.status}`);
  const json = await resp.json() as { data?: Array<{ spend?: string; impressions?: string; clicks?: string; reach?: string; ctr?: string; cpc?: string; actions?: Array<{ action_type: string; value: string }>; action_values?: Array<{ action_type: string; value: string }> }> };
  const d = json.data?.[0] || {};

  const conversions =
    (d.actions || [])
      .filter((a) => a.action_type === "offsite_conversion.fb_pixel_purchase")
      .reduce((s, a) => s + parseFloat(a.value || "0"), 0);
  const revenue =
    (d.action_values || [])
      .filter((a) => a.action_type === "offsite_conversion.fb_pixel_purchase")
      .reduce((s, a) => s + parseFloat(a.value || "0"), 0);
  const spend = parseFloat(d.spend || "0");

  return {
    spend,
    impressions: parseInt(d.impressions || "0"),
    clicks: parseInt(d.clicks || "0"),
    reach: parseInt(d.reach || "0"),
    ctr: parseFloat(d.ctr || "0"),
    cpc: parseFloat(d.cpc || "0"),
    conversions,
    roas: spend > 0 ? revenue / spend : 0,
  };
}

export async function getMetaAdCampaigns(
  accessToken: string,
  adAccountId: string
): Promise<MetaCampaign[]> {
  const fields = "id,name,status,objective,daily_budget,insights{spend}";
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const resp = await fetch(
    `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?${params}`
  );
  if (!resp.ok) return [];
  const json = await resp.json() as { data?: Array<{ id: string; name: string; status: string; objective: string; daily_budget?: string; insights?: { data?: Array<{ spend?: string }> } }> };
  return (json.data || []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    objective: c.objective,
    dailyBudget: parseFloat(c.daily_budget || "0") / 100,
    spend: parseFloat(c.insights?.data?.[0]?.spend || "0"),
  }));
}

export function createMetaLeadAdWebhookUrl(siteUrl: string): string {
  return `${siteUrl}/api/webhooks/meta-leads`;
}

// ─── Google Ads ────────────────────────────────────────────────────────────────

export async function getGoogleAdsStats(
  customerId: string,
  developerToken: string,
  accessToken: string,
  dateRange = "LAST_7_DAYS"
): Promise<GoogleAdsStats> {
  const cleanId = customerId.replace(/-/g, "");
  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.all_conversions_value
    FROM campaign
    WHERE segments.date DURING ${dateRange}
  `;
  const resp = await fetch(
    `https://googleads.googleapis.com/v14/customers/${cleanId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query.trim() }),
    }
  );
  if (!resp.ok) throw new Error(`Google Ads API error: ${resp.status}`);
  const json = await resp.json() as { results?: Array<{ metrics?: { costMicros?: string | number; impressions?: string | number; clicks?: string | number; conversions?: string | number; ctr?: string | number; averageCpc?: string | number; allConversionsValue?: string | number } }> };
  const rows = json.results || [];

  let costMicros = 0, impressions = 0, clicks = 0, conversions = 0, revenue = 0;
  rows.forEach((r) => {
    const m = r.metrics || {};
    costMicros += Number(m.costMicros || 0);
    impressions += Number(m.impressions || 0);
    clicks += Number(m.clicks || 0);
    conversions += Number(m.conversions || 0);
    revenue += Number(m.allConversionsValue || 0);
  });

  const cost = costMicros / 1_000_000;
  return {
    cost,
    impressions,
    clicks,
    conversions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    avgCpc: clicks > 0 ? cost / clicks : 0,
    roas: cost > 0 ? revenue / cost : 0,
  };
}

// ─── LinkedIn ──────────────────────────────────────────────────────────────────

export async function getLinkedInAdStats(
  accessToken: string,
  accountId: string,
  dateRange?: { start: string; end: string }
): Promise<LinkedInStats> {
  const now = new Date();
  const start = dateRange?.start || new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const end = dateRange?.end || now.toISOString().slice(0, 10);

  const params = new URLSearchParams({
    q: "analytics",
    pivot: "CAMPAIGN",
    dateRange: JSON.stringify({
      start: { year: parseInt(start.slice(0, 4)), month: parseInt(start.slice(5, 7)), day: parseInt(start.slice(8, 10)) },
      end: { year: parseInt(end.slice(0, 4)), month: parseInt(end.slice(5, 7)), day: parseInt(end.slice(8, 10)) },
    }),
    fields: "costInUsd,impressions,clicks,externalWebsiteConversions,clickThroughRate,costInUsdPerClick",
    accounts: `urn:li:sponsoredAccount:${accountId}`,
  });

  const resp = await fetch(
    `https://api.linkedin.com/v2/adAnalyticsV2?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!resp.ok) throw new Error(`LinkedIn API error: ${resp.status}`);
  const json = await resp.json() as { elements?: Array<{ costInUsd?: number; impressions?: number; clicks?: number; externalWebsiteConversions?: number; clickThroughRate?: number; costInUsdPerClick?: number }> };
  const rows = json.elements || [];

  let totalSpend = 0, impressions = 0, clicks = 0, conversions = 0;
  rows.forEach((r) => {
    totalSpend += r.costInUsd || 0;
    impressions += r.impressions || 0;
    clicks += r.clicks || 0;
    conversions += r.externalWebsiteConversions || 0;
  });

  return {
    totalSpend,
    impressions,
    clicks,
    conversions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    cpc: clicks > 0 ? totalSpend / clicks : 0,
  };
}

export async function getLinkedInOrganizationFollowers(
  accessToken: string,
  orgId: string
): Promise<number> {
  try {
    const resp = await fetch(
      `https://api.linkedin.com/v2/networkSizes/urn:li:organization:${orgId}?edgeType=CompanyFollowedByMember`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!resp.ok) return 0;
    const json = await resp.json() as { firstDegreeSize?: number };
    return json.firstDegreeSize || 0;
  } catch {
    return 0;
  }
}

export async function getLinkedInRecentPosts(
  accessToken: string,
  orgId: string
): Promise<LinkedInPost[]> {
  try {
    const resp = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:organization:${orgId})&sortBy=LAST_MODIFIED&count=10`,
      { headers: { Authorization: `Bearer ${accessToken}`, "X-Restli-Protocol-Version": "2.0.0" } }
    );
    if (!resp.ok) return [];
    const json = await resp.json() as { elements?: Array<{ id?: string; specificContent?: { "com.linkedin.ugc.ShareContent"?: { shareCommentary?: { text?: string } } }; firstPublishedAt?: number; likesSummary?: { totalLikes?: number }; commentsSummary?: { totalFirstLevelComments?: number } }> };
    return (json.elements || []).map((p) => ({
      id: p.id || "",
      text: p.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text || "",
      publishedAt: p.firstPublishedAt ? new Date(p.firstPublishedAt).toISOString() : "",
      likeCount: p.likesSummary?.totalLikes || 0,
      commentCount: p.commentsSummary?.totalFirstLevelComments || 0,
    }));
  } catch {
    return [];
  }
}

// ─── Zapier Webhook ────────────────────────────────────────────────────────────

export async function triggerZapierWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ─── Make (Integromat) Webhook ─────────────────────────────────────────────────

export async function triggerMakeWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<boolean> {
  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ─── n8n Webhook ───────────────────────────────────────────────────────────────

export async function triggerN8nWebhook(
  webhookUrl: string,
  payload: Record<string, unknown>,
  basicAuth?: { user: string; pass: string }
): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (basicAuth) {
      headers["Authorization"] =
        "Basic " + Buffer.from(`${basicAuth.user}:${basicAuth.pass}`).toString("base64");
    }
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// ─── Unified Event Dispatcher ──────────────────────────────────────────────────

export async function dispatchIntegrationEvent(
  event: KVLEvent,
  enabledIntegrations: EnabledIntegration[]
): Promise<DispatchResult[]> {
  const results = await Promise.all(
    enabledIntegrations
      .filter((i) => i.events.includes(event.type))
      .map(async (integration): Promise<DispatchResult> => {
        const { slug, config } = integration;
        try {
          let success = false;
          switch (slug) {
            case "zapier": {
              const url = config.ZAPIER_WEBHOOK_URL;
              if (url) success = await triggerZapierWebhook(url, { event });
              break;
            }
            case "make": {
              const url = config.MAKE_WEBHOOK_URL;
              if (url) success = await triggerMakeWebhook(url, { event });
              break;
            }
            case "n8n": {
              const url = config.N8N_WEBHOOK_URL;
              if (url) {
                const auth =
                  config.N8N_BASIC_AUTH_USER && config.N8N_BASIC_AUTH_PASS
                    ? { user: config.N8N_BASIC_AUTH_USER, pass: config.N8N_BASIC_AUTH_PASS }
                    : undefined;
                success = await triggerN8nWebhook(url, { event }, auth);
              }
              break;
            }
            case "slack": {
              const { sendSlackNotification } = await import("@/lib/integrations");
              const text = `[KVL TECH] ${event.type}: ${JSON.stringify(event.data)}`;
              success = await sendSlackNotification(text);
              break;
            }
            case "telegram": {
              const { sendTelegramMessage } = await import("@/lib/integrations");
              const text = `[KVL TECH] ${event.type}: ${JSON.stringify(event.data)}`;
              success = await sendTelegramMessage(text);
              break;
            }
            default:
              return { integration: slug, success: false, error: "Unsupported dispatch target" };
          }
          return { integration: slug, success };
        } catch (err) {
          return { integration: slug, success: false, error: String(err) };
        }
      })
  );
  return results;
}
