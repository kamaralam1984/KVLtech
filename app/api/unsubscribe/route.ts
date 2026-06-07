import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

function generateToken(email: string): string {
  return Buffer.from(email).toString("base64")
}

function verifyToken(email: string, token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    return decoded === email
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const token = searchParams.get("token")

  if (!email || !token) {
    return new NextResponse(unsubscribeHtml("Invalid unsubscribe link. Missing parameters.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  if (!verifyToken(email, token)) {
    return new NextResponse(unsubscribeHtml("Invalid or expired unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  try {
    const lead = await db.contactLead.findFirst({
      where: { email },
    })

    if (!lead) {
      return new NextResponse(unsubscribeHtml("Email address not found in our system.", false), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    }

    await db.contactLead.update({
      where: { id: lead.id },
      data: {
        status: "LOST",
        notes: lead.notes
          ? `${lead.notes}\n\nUnsubscribed via email link on ${new Date().toLocaleDateString("en-IN")}`
          : `Unsubscribed via email link on ${new Date().toLocaleDateString("en-IN")}`,
      },
    })

    return new NextResponse(unsubscribeHtml("You have been unsubscribed. We're sorry to see you go.", true), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch {
    return new NextResponse(unsubscribeHtml("Something went wrong. Please try again later.", false), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }
}

function unsubscribeHtml(message: string, success: boolean): string {
  const color = success ? "#16A34A" : "#EF4444"
  const icon = success ? "&#10003;" : "&#10007;"
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unsubscribe — KVL TECH</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 460px; width: 90%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .icon { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; background: ${color}18; color: ${color}; }
  h1 { color: #0B1437; font-size: 22px; margin-bottom: 12px; }
  p { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
  a { display: inline-block; background: #C9A227; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; }
  .brand { margin-top: 32px; color: #999; font-size: 12px; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">${icon}</div>
  <h1>KVL TECH</h1>
  <p>${message}</p>
  ${success ? '<p style="color:#999;font-size:13px">You will no longer receive marketing emails from us. If this was a mistake, please contact us at kvlbusinesssolution@gmail.com</p>' : ""}
  <a href="https://kvlbusinesssolutions.com">Return to Website</a>
  <p class="brand">KVL TECH Pvt. Ltd.</p>
</div>
</body>
</html>`
}

export { generateToken }
