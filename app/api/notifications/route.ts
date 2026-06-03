import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const unread = notifications.filter(n => !n.isRead).length;
    return NextResponse.json({ notifications, unread });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = requireAuth(req);
  if (!user || user.type !== "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { markAllRead, id } = await req.json();

    if (markAllRead) {
      await db.notification.updateMany({
        where: { clientId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await db.notification.update({ where: { id }, data: { isRead: true } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
