import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await db.workflowTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, trigger, nodes, edges } = body;

  if (!name || !trigger) {
    return NextResponse.json({ error: "name and trigger are required" }, { status: 400 });
  }

  const template = await db.workflowTemplate.create({
    data: {
      name,
      description: description || "",
      trigger,
      nodes: typeof nodes === "string" ? nodes : JSON.stringify(nodes || []),
      edges: typeof edges === "string" ? edges : JSON.stringify(edges || []),
      createdBy: (admin as any).id || "admin",
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, nodes, edges, ...rest } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updateData: any = { ...rest };
  if (nodes !== undefined) updateData.nodes = typeof nodes === "string" ? nodes : JSON.stringify(nodes);
  if (edges !== undefined) updateData.edges = typeof edges === "string" ? edges : JSON.stringify(edges);

  const template = await db.workflowTemplate.update({ where: { id }, data: updateData });
  return NextResponse.json({ template });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.workflowTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
