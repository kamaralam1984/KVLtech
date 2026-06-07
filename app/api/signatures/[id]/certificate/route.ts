import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSignatureCertificate } from "@/lib/signature-pdf"

// Public endpoint — only works when all signatories have signed
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const request = await db.signatureRequest.findUnique({
    where: { id },
    include: { signatories: true },
  })

  if (!request) {
    return NextResponse.json({ error: "Signature request not found" }, { status: 404 })
  }

  // Only allow download when all signatories have signed
  const allSigned = request.signatories.every((s) => s.signedAt !== null)
  if (!allSigned) {
    return NextResponse.json(
      { error: "Certificate is only available after all parties have signed" },
      { status: 403 }
    )
  }

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
