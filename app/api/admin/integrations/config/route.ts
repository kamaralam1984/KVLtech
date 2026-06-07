import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { integrationConfigStore, IntegrationConfig } from "@/lib/integrations-extended";

function redactConfig(config: Record<string, string>): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (!value) {
      redacted[key] = "";
      continue;
    }
    // Show first 4 chars then *** for secrets/tokens
    const isSecret =
      /token|secret|key|pass|password/i.test(key) && value.length > 4;
    redacted[key] = isSecret ? value.slice(0, 4) + "***" : value;
  }
  return redacted;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configs: Record<string, unknown>[] = [];
  for (const [slug, cfg] of integrationConfigStore.entries()) {
    configs.push({
      slug: cfg.slug,
      enabled: cfg.enabled,
      config: redactConfig(cfg.config),
      events: cfg.events,
      lastSync: cfg.lastSync,
      lastError: cfg.lastError,
    });
  }

  return NextResponse.json({ configs });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      slug?: string;
      enabled?: boolean;
      config?: Record<string, string>;
      events?: string[];
    };
    const { slug, enabled, config, events } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const existing = integrationConfigStore.get(slug);

    // Merge config — if a value is "****" or ends with "***", keep existing value
    const mergedConfig: Record<string, string> = { ...(existing?.config || {}) };
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        if (value && !value.endsWith("***")) {
          mergedConfig[key] = value;
        }
      }
    }

    const updated: IntegrationConfig = {
      slug,
      enabled: enabled ?? existing?.enabled ?? false,
      config: mergedConfig,
      events: events ?? existing?.events ?? [],
      lastSync: existing?.lastSync,
      lastError: existing?.lastError,
    };

    integrationConfigStore.set(slug, updated);

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug query param is required" }, { status: 400 });
  }

  const existed = integrationConfigStore.delete(slug);
  return NextResponse.json({ success: true, deleted: existed });
}
