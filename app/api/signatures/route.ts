import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });

  const signatory = await db.signatory.findUnique({
    where: { token },
    include: {
      request: {
        include: { signatories: true },
      },
    },
  });

  if (!signatory) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });

  return NextResponse.json({
    signatory: {
      id: signatory.id,
      name: signatory.name,
      email: signatory.email,
      role: signatory.role,
      status: signatory.status,
      signedAt: signatory.signedAt,
    },
    request: {
      id: signatory.request.id,
      title: signatory.request.title,
      description: signatory.request.description,
      content: signatory.request.content,
      status: signatory.request.status,
      expiresAt: signatory.request.expiresAt,
      signatories: signatory.request.signatories.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        status: s.status,
        signedAt: s.signedAt,
      })),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, signatureData, ip } = body;

  if (!token || !signatureData) {
    return NextResponse.json({ error: "token and signatureData are required" }, { status: 400 });
  }

  const signatory = await db.signatory.findUnique({
    where: { token },
    include: { request: true },
  });

  if (!signatory) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (signatory.status === "SIGNED") {
    return NextResponse.json({ error: "Document already signed", signedAt: signatory.signedAt }, { status: 400 });
  }

  if (signatory.status === "DECLINED" || signatory.status === "EXPIRED") {
    return NextResponse.json({ error: `Cannot sign: status is ${signatory.status}` }, { status: 400 });
  }

  if (signatory.request.expiresAt && new Date() > signatory.request.expiresAt) {
    // Mark as expired
    await db.signatory.update({ where: { id: signatory.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "This signature request has expired" }, { status: 400 });
  }

  const ipAddress = ip || req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  await db.signatory.update({
    where: { id: signatory.id },
    data: {
      signatureData,
      signedAt: new Date(),
      status: "SIGNED",
      ipAddress,
    },
  });

  // Check if ALL signatories have signed
  const allSignatories = await db.signatory.findMany({
    where: { requestId: signatory.requestId },
  });

  const allSigned = allSignatories.every((s) => s.id === signatory.id ? true : s.status === "SIGNED");

  if (allSigned) {
    await db.signatureRequest.update({
      where: { id: signatory.requestId },
      data: { status: "SIGNED" },
    });
  }

  return NextResponse.json({ success: true, allSigned });
}
