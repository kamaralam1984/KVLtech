import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://kvluser:kvltech2024@localhost:5432/kvltech" });
const db = new PrismaClient({ adapter });

async function main() {
  const campaigns = [
    {
      name: "New Year Offer — 20% Off", type: "EMAIL" as const,
      subject: "🎉 New Year Special: 20% Off on All Products!",
      message: "Namaskar! New Year ke upalakshya mein hum aapko 20% discount offer kar rahe hain. Offer limited time ke liye hai — aaj hi apni website ya software book karein!",
      recipients: "ALL_LEADS", status: "COMPLETED" as const,
      sentCount: 1842, openCount: 634, clickCount: 189,
      sentAt: new Date("2024-12-25"),
    },
    {
      name: "Restaurant Website Launch", type: "WHATSAPP" as const,
      message: "Hi! 🍽️ KVL TECH ka naya Restaurant Website package launch ho gaya hai. Online ordering, table booking, WhatsApp integration — sab kuch sirf ₹12,999 mein. Demo dekhne ke liye reply karein!",
      recipients: "ALL_LEADS", status: "COMPLETED" as const,
      sentCount: 520, openCount: 480, clickCount: 143,
      sentAt: new Date("2024-12-20"),
    },
    {
      name: "School Management Demo", type: "SMS" as const,
      message: "KVL TECH: Aapke school ke liye FREE demo ready hai. Attendance, fees, parent app — sab ek jagah. Call: +91 9942000413",
      recipients: "QUALIFIED", status: "ACTIVE" as const,
      sentCount: 300, openCount: 210, clickCount: 67,
      sentAt: new Date("2024-12-28"),
    },
    {
      name: "Follow-up Sequence — Jan 2025", type: "EMAIL" as const,
      subject: "Aapka project kab start karein?",
      message: "Namaskar! Pichle kuch dino se aapka koi jawab nahi aaya. Kya hum aapki project ke baare mein baat kar sakte hain? Free consultation ke liye call karein.",
      recipients: "CONTACTED", status: "DRAFT" as const,
      sentCount: 0, openCount: 0, clickCount: 0,
    },
  ];

  for (const c of campaigns) {
    await db.campaign.upsert({
      where: { id: c.name.toLowerCase().replace(/\s+/g, "-").slice(0, 10) },
      update: {},
      create: { id: c.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 20), ...c },
    }).catch(async () => {
      // If upsert fails, just create
      await db.campaign.create({ data: c });
    });
    console.log(`✅ ${c.name}`);
  }
  console.log("✅ Campaigns seeded!");
}

main().catch(console.error).finally(() => db.$disconnect());
