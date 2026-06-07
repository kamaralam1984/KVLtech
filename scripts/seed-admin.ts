import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@kvlbusinesssolutions.com"
  const password = process.env.ADMIN_PASSWORD || "admin@kvl2024"

  const existing = await db.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin ${email} already exists`)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const admin = await db.admin.create({
    data: { email, password: hashedPassword, name: "KVL Admin", role: "SUPER_ADMIN" }
  })

  console.log(`Admin created: ${admin.email}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
