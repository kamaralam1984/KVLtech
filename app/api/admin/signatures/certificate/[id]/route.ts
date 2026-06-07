import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { generateSignatureCertificate } from "@/lib/signature-pdf"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = requireAdmin(req)
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const pdf = await generateSignatureCertificate(id)

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="signature-certificate-${id}.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate certificate"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
