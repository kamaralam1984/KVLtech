import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const policies = await db.sLAPolicy.findMany({
      orderBy: { priority: "asc" },
    });
    return NextResponse.json({ policies });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, priority, firstResponseMinutes, resolutionMinutes, escalationMinutes } = await req.json();
    if (!name || !priority || !firstResponseMinutes || !resolutionMinutes)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const policy = await db.sLAPolicy.create({
      data: {
        name,
        priority,
        firstResponseMinutes: Number(firstResponseMinutes),
        resolutionMinutes: Number(resolutionMinutes),
        escalationMinutes: escalationMinutes ? Number(escalationMinutes) : null,
        isActive: true,
      },
    });
    return NextResponse.json({ policy });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, name, priority, firstResponseMinutes, resolutionMinutes, escalationMinutes, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const policy = await db.sLAPolicy.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(priority !== undefined && { priority }),
        ...(firstResponseMinutes !== undefined && { firstResponseMinutes: Number(firstResponseMinutes) }),
        ...(resolutionMinutes !== undefined && { resolutionMinutes: Number(resolutionMinutes) }),
        ...(escalationMinutes !== undefined && { escalationMinutes: escalationMinutes ? Number(escalationMinutes) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json({ policy });
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

    await db.sLAPolicy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
