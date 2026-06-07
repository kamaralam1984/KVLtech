import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const DB_URL = process.env.DATABASE_URL || "postgresql://kvluser:kvltech2024@localhost:5432/kvltech";
const adapter = new PrismaPg({ connectionString: DB_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin
  const adminPass = await bcrypt.hash("K12345678", 12);
  await prisma.admin.upsert({
    where: { email: "kamaralamjdu@gmail.com" },
    update: { password: adminPass },
    create: {
      name: "Super Admin",
      email: "kamaralamjdu@gmail.com",
      password: adminPass,
      role: "SUPER_ADMIN",
    },
  });

  // Demo client
  const clientPass = await bcrypt.hash("client123", 12);
  const client = await prisma.client.upsert({
    where: { email: "demo@client.com" },
    update: {},
    create: {
      name: "Rajesh Kumar",
      email: "demo@client.com",
      phone: "+91 98765 12345",
      company: "Spice Heaven Restaurant",
      password: clientPass,
      city: "Mumbai",
      emailVerified: true,
    },
  });

  // Products
  const restaurant = await prisma.product.upsert({
    where: { slug: "restaurant-website" },
    update: {},
    create: {
      slug: "restaurant-website",
      name: "Restaurant Website",
      tagline: "Online orders, table booking, aur more",
      description: "Complete restaurant website with online ordering, table booking, WhatsApp integration, and admin dashboard.",
      category: "WEBSITE",
      photo: "/photos/restaurant.jpg",
      gallery: ["/photos/restaurant.jpg"],
      basicPrice: 12999,
      premiumPrice: 24999,
      techStack: ["Next.js", "Tailwind CSS", "Razorpay", "WhatsApp API"],
      deliverables: ["Source code", "Admin panel", "Mobile responsive", "1 year hosting support"],
      highlights: ["Online ordering", "Table booking", "WhatsApp integration", "Admin dashboard"],
      plans: {
        create: [
          { name: "BASIC", price: "₹12,999", delivery: "3-5 days", support: "30 days", features: ["5 pages", "Mobile responsive", "Contact form", "Basic SEO"] },
          { name: "PREMIUM", price: "₹24,999", delivery: "1-2 days", support: "90 days", features: ["Unlimited pages", "Online ordering", "Table booking", "WhatsApp integration", "Admin panel", "Advanced SEO"] },
          { name: "CUSTOM", price: "Quote", delivery: "7-15 days", support: "1 year", features: ["Everything in Premium", "Custom features", "API integrations", "Priority support"] },
        ],
      },
      faqs: {
        create: [
          { question: "Domain aur hosting include hai?", answer: "Domain aur hosting alag se lena padega. Hum setup mein help karenge." },
          { question: "After delivery kya support milega?", answer: "Basic mein 30 din, Premium mein 90 din free support milta hai." },
        ],
      },
    },
  });

  // Order
  const order = await prisma.order.upsert({
    where: { orderNumber: "KVL-2024-0891" },
    update: {},
    create: {
      orderNumber: "KVL-2024-0891",
      clientId: client.id,
      productId: restaurant.id,
      plan: "PREMIUM",
      status: "DEVELOPMENT",
      progress: 65,
      amount: 24999,
      deliveryEst: new Date("2025-01-03"),
      statusHistory: {
        create: [
          { status: "PAYMENT_CONFIRMED", note: "Payment received via Razorpay", changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { status: "DESIGN_STARTED", note: "Design phase shuru ho gayi", changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { status: "DEVELOPMENT", note: "Frontend development in progress", changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        ],
      },
    },
  });

  // Payment
  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      orderId: order.id,
      amount: 24999,
      status: "CAPTURED",
      gateway: "razorpay",
      gatewayPaymentId: "pay_demo_001",
      paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // Second order (delivered)
  const whatsappProd = await prisma.product.upsert({
    where: { slug: "whatsapp-marketing-tool" },
    update: {},
    create: {
      slug: "whatsapp-marketing-tool",
      name: "WhatsApp Marketing Tool",
      tagline: "Bulk messages, automation, aur leads",
      description: "Complete WhatsApp marketing solution with bulk messaging, automation, and lead management.",
      category: "SOFTWARE",
      photo: "/photos/office-meeting.jpg",
      gallery: ["/photos/office-meeting.jpg"],
      basicPrice: 8999,
      premiumPrice: 17999,
      techStack: ["Node.js", "WhatsApp Business API", "React"],
      deliverables: ["Web app", "WhatsApp integration", "Dashboard"],
      highlights: ["Bulk messaging", "Auto replies", "Lead tracking"],
      plans: {
        create: [
          { name: "BASIC", price: "₹8,999", delivery: "2-3 days", support: "30 days", features: ["500 msg/day", "Basic automation", "Dashboard"] },
          { name: "PREMIUM", price: "₹17,999", delivery: "1 day", support: "90 days", features: ["Unlimited messages", "Advanced automation", "CRM integration", "Analytics"] },
        ],
      },
    },
  });

  const order2 = await prisma.order.upsert({
    where: { orderNumber: "KVL-2024-0756" },
    update: {},
    create: {
      orderNumber: "KVL-2024-0756",
      clientId: client.id,
      productId: whatsappProd.id,
      plan: "BASIC",
      status: "DELIVERED",
      progress: 100,
      amount: 8999,
      deliveryEst: new Date("2024-12-20"),
      deliveredAt: new Date("2024-12-20"),
      liveUrl: "https://wa-tool.demo.kvltech.com",
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      { clientId: client.id, title: "Design phase completed!", body: "Restaurant Website ka design approve ho gaya. Development shuru ho gayi.", type: "ORDER_UPDATE", color: "#16A34A" },
      { clientId: client.id, title: "Branding details required", body: "Apni company branding details submit karein taaki kaam shuru ho sake.", type: "BRANDING", color: "#C9A227" },
      { clientId: client.id, title: "Payment confirmed", body: "Order #KVL-2024-0891 ka payment ₹24,999 successfully received.", type: "PAYMENT", color: "#0891B2", isRead: true },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
  console.log("📧 Demo client: demo@client.com / client123");
  console.log("🔑 Admin: admin@kvlbusinesssolutions.com / admin@kvl2024");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
