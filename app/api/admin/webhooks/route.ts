import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const endpoints = await db.webhookEndpoint.findMany({
      include: {
        deliveries: {
          select: { status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = endpoints.map((ep) => {
      const successCount = ep.deliveries.filter((d) => d.status === "SUCCESS").length;
      const failedCount = ep.deliveries.filter((d) => d.status === "FAILED").length;
      const lastDelivery = ep.deliveries[0]?.createdAt ?? null;
      return {
        id: ep.id,
        name: ep.name,
        url: ep.url,
        events: ep.events,
        isActive: ep.isActive,
        description: ep.description,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt,
        stats: { successCount, failedCount, total: ep.deliveries.length, lastDelivery },
      };
    });

    return NextResponse.json({ endpoints: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, url, secret, events, description } = await req.json();
    if (!name || !url || !events?.length)
      return NextResponse.json({ error: "name, url, and events are required" }, { status: 400 });

    if (!url.startsWith("https://"))
      return NextResponse.json({ error: "URL must start with https://" }, { status: 400 });

    const endpoint = await db.webhookEndpoint.create({
      data: {
        name,
        url,
        secret: secret || null,
        events,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, endpoint }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, isActive, name, url, secret, events, description } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const endpoint = await db.webhookEndpoint.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(name && { name }),
        ...(url && { url }),
        ...(secret !== undefined && { secret }),
        ...(events && { events }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json({ success: true, endpoint });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await db.webhookEndpoint.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
