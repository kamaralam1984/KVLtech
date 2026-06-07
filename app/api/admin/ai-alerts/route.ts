import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get("severity");
    // Support both ?unread=true and ?unreadOnly=true for backwards compat
    const unreadOnly =
      searchParams.get("unread") === "true" ||
      searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = { isDismissed: false };
    if (severity) {
      // Support comma-separated: severity=HIGH,CRITICAL
      const severities = severity.split(",").map((s) => s.trim().toUpperCase());
      if (severities.length === 1) {
        where.severity = severities[0];
      } else {
        where.severity = { in: severities };
      }
    }
    if (unreadOnly) where.isRead = false;

    const [alerts, unreadCount] = await Promise.all([
      db.aIAlert.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        take: limit,
      }),
      db.aIAlert.count({ where: { isDismissed: false, isRead: false } }),
    ]);

    return NextResponse.json({ alerts, unreadCount });
  } catch (err) {
    console.error("[ai-alerts GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, action, markAllRead } = body;

    // Support {markAllRead: true} body style (Task 5 page uses this)
    if (action === "readAll" || markAllRead === true) {
      await db.aIAlert.updateMany({
        where: { isDismissed: false, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    if (action === "read") {
      await db.aIAlert.update({
        where: { id },
        data: { isRead: true },
      });
    } else if (action === "dismiss") {
      await db.aIAlert.update({
        where: { id },
        data: { isDismissed: true, isRead: true },
      });
    } else {
      // Default: mark as read when just {id} passed
      await db.aIAlert.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ai-alerts PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await db.aIAlert.update({
      where: { id },
      data: { isDismissed: true, isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ai-alerts DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
