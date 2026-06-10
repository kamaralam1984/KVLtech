import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://kvluser:kvltech2024@localhost:5432/kvltech" });
const db = new PrismaClient({ adapter });

const PRODUCTS = [
  {
    slug: "restaurant-website", name: "Restaurant Website",
    tagline: "Grow your restaurant business online",
    description: "Professional restaurant website with menu, reservations, online ordering, and delivery tracking.",
    category: "WEBSITE" as const, photo: "/photos/restaurant.jpg", gallery: ["/photos/restaurant.jpg"],
    basicPrice: 14999, premiumPrice: 29999, tag: "Popular", sortOrder: 1,
    techStack: ["Next.js", "React", "PostgreSQL"],
    highlights: ["Online ordering", "Table reservation", "+300% orders"],
    deliverables: ["Full website", "Admin panel", "Menu management", "1 year hosting support"],
    plans: [
      { name: "BASIC" as const, price: "₹14,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["5 pages", "Menu display", "Contact form", "WhatsApp integration"] },
      { name: "PREMIUM" as const, price: "₹29,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Online ordering", "Payment gateway", "Table reservation", "Admin panel"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Custom features", "Delivery app", "Multi-branch", "POS integration"] },
    ],
    faqs: [{ question: "Kya online payment support hoga?", answer: "Haan, Premium aur Custom mein Razorpay included hai.", sortOrder: 0 }],
  },
  {
    slug: "school-management-system", name: "School Management System",
    tagline: "Complete digital transformation for your school",
    description: "All-in-one school management: admissions, attendance, fees, exams, results, staff, parent communication.",
    category: "SOFTWARE" as const, photo: "/photos/school.jpg", gallery: ["/photos/school.jpg"],
    basicPrice: 29999, premiumPrice: 59999, tag: "Best Seller", sortOrder: 2,
    techStack: ["React", "Node.js", "PostgreSQL", "Redis"],
    highlights: ["80% workload reduction", "95% parent satisfaction"],
    deliverables: ["Full source code", "Admin panel", "Parent app", "Teacher portal"],
    plans: [
      { name: "BASIC" as const, price: "₹29,999", delivery: "5-7 days", support: "30 days", sortOrder: 0, features: ["Student management", "Attendance", "Fee management", "Basic reports"] },
      { name: "PREMIUM" as const, price: "₹59,999", delivery: "3-5 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Parent app", "SMS alerts", "Online fee payment"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-20 days", support: "1 year", sortOrder: 2, features: ["Custom modules", "ERP integration", "Biometric"] },
    ],
    faqs: [{ question: "Kitne students?", answer: "Basic 500, Premium 5000+.", sortOrder: 0 }],
  },
  {
    slug: "hospital-management-system", name: "Hospital Management System",
    tagline: "Streamline patient care with smart automation",
    description: "Complete hospital: OPD/IPD, appointments, billing, pharmacy, lab, doctor modules.",
    category: "SOFTWARE" as const, photo: "/photos/hospital.jpg", gallery: ["/photos/hospital.jpg"],
    basicPrice: 49999, premiumPrice: 99999, tag: "Enterprise", sortOrder: 3,
    techStack: ["React", "Node.js", "PostgreSQL", "HL7 FHIR"],
    highlights: ["70% faster operations", "90% patient satisfaction"],
    deliverables: ["Full source code", "Doctor portal", "Patient portal", "Pharmacy module"],
    plans: [
      { name: "BASIC" as const, price: "₹49,999", delivery: "7-10 days", support: "30 days", sortOrder: 0, features: ["Patient registration", "OPD", "Billing", "Prescriptions"] },
      { name: "PREMIUM" as const, price: "₹99,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Pharmacy", "Lab management", "Patient portal", "Analytics"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "15-30 days", support: "1 year", sortOrder: 2, features: ["NABH compliance", "Telemedicine", "EMR/EHR"] },
    ],
    faqs: [{ question: "HIPAA compliant?", answer: "Haan, Premium aur Custom mein full security.", sortOrder: 0 }],
  },
  {
    slug: "ecommerce-platform", name: "E-commerce Platform",
    tagline: "Launch your online store in days",
    description: "Full-featured e-commerce: product catalog, cart, payment gateway, order tracking, admin dashboard.",
    category: "WEBSITE" as const, photo: "/photos/fashion.jpg", gallery: ["/photos/fashion.jpg"],
    basicPrice: 24999, premiumPrice: 49999, tag: "Hot", sortOrder: 4,
    techStack: ["Next.js", "React", "PostgreSQL", "Razorpay"],
    highlights: ["250% sales increase", "Razorpay integration", "Inventory management"],
    deliverables: ["E-commerce website", "Admin dashboard", "Mobile responsive", "Payment gateway"],
    plans: [
      { name: "BASIC" as const, price: "₹24,999", delivery: "5-7 days", support: "30 days", sortOrder: 0, features: ["Up to 100 products", "Cart & checkout", "Razorpay integration", "Order management"] },
      { name: "PREMIUM" as const, price: "₹49,999", delivery: "7-10 days", support: "90 days", sortOrder: 1, features: ["Unlimited products", "Multi-payment gateway", "Coupon system", "Analytics", "WhatsApp notifications"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "15-25 days", support: "1 year", sortOrder: 2, features: ["Mobile app", "Multi-vendor", "Dropshipping", "ERP integration"] },
    ],
    faqs: [{ question: "Kitne products?", answer: "Basic 100, Premium unlimited.", sortOrder: 0 }],
  },
  {
    slug: "hotel-booking-website", name: "Hotel Booking Website",
    tagline: "Boost direct bookings, cut OTA commissions",
    description: "Hotel website with room booking, availability calendar, payment, reviews, and admin panel.",
    category: "WEBSITE" as const, photo: "/photos/restaurant.jpg", gallery: ["/photos/restaurant.jpg"],
    basicPrice: 19999, premiumPrice: 39999, tag: "Popular", sortOrder: 5,
    techStack: ["Next.js", "React", "PostgreSQL"],
    highlights: ["Direct bookings +180%", "No OTA commission"],
    deliverables: ["Hotel website", "Booking system", "Admin panel", "Channel manager"],
    plans: [
      { name: "BASIC" as const, price: "₹19,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["Room showcase", "Booking form", "WhatsApp integration", "Gallery"] },
      { name: "PREMIUM" as const, price: "₹39,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Online booking", "Payment gateway", "Availability calendar", "Admin panel", "Review system"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Channel manager", "PMS integration", "Mobile app", "Multi-property"] },
    ],
    faqs: [{ question: "Extra monthly fees?", answer: "Nahi! Lifetime free.", sortOrder: 0 }],
  },
  {
    slug: "real-estate-website", name: "Real Estate Website",
    tagline: "Showcase properties, generate quality leads",
    description: "Property listing website with search filters, virtual tours, lead capture, and CRM integration.",
    category: "WEBSITE" as const, photo: "/photos/office-meeting.jpg", gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 17999, premiumPrice: 34999, sortOrder: 6,
    techStack: ["Next.js", "React", "PostgreSQL"],
    highlights: ["3X more leads", "Property search", "Virtual tour"],
    deliverables: ["Property website", "Admin panel", "Lead CRM", "WhatsApp integration"],
    plans: [
      { name: "BASIC" as const, price: "₹17,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["Property listings", "Search & filters", "Contact form", "WhatsApp integration"] },
      { name: "PREMIUM" as const, price: "₹34,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Unlimited listings", "Virtual tour", "Lead management", "EMI calculator", "Map integration"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Mobile app", "CRM integration", "Auction module", "Multi-city"] },
    ],
    faqs: [{ question: "Kitni properties?", answer: "Basic 50, Premium unlimited.", sortOrder: 0 }],
  },
  {
    slug: "gym-fitness-website", name: "Gym & Fitness Website",
    tagline: "Grow your fitness business online",
    description: "Gym website with membership plans, class schedules, online payments, and member portal.",
    category: "WEBSITE" as const, photo: "/photos/gym.jpg", gallery: ["/photos/gym.jpg"],
    basicPrice: 12999, premiumPrice: 24999, sortOrder: 7,
    techStack: ["Next.js", "React", "PostgreSQL"],
    highlights: ["Membership management", "Class booking"],
    deliverables: ["Gym website", "Member portal", "Class scheduler", "Payment integration"],
    plans: [
      { name: "BASIC" as const, price: "₹12,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["Membership plans", "Class schedule", "Contact form", "Gallery"] },
      { name: "PREMIUM" as const, price: "₹24,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Online membership", "Class booking", "Payment gateway", "Member portal", "Trainer profiles"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Mobile app", "Attendance system", "Diet tracking", "Multi-branch"] },
    ],
    faqs: [{ question: "Member portal included?", answer: "Haan, Premium mein included hai.", sortOrder: 0 }],
  },
  {
    slug: "portfolio-website", name: "Portfolio Website",
    tagline: "Stand out with a stunning portfolio",
    description: "Professional portfolio for designers, photographers, architects, freelancers with contact and booking.",
    category: "WEBSITE" as const, photo: "/photos/portfolio.jpg", gallery: ["/photos/portfolio.jpg"],
    basicPrice: 7999, premiumPrice: 14999, sortOrder: 8,
    techStack: ["Next.js", "React"],
    highlights: ["Stunning design", "Fast loading", "SEO optimized"],
    deliverables: ["Portfolio website", "CMS admin", "Contact form", "SEO optimized"],
    plans: [
      { name: "BASIC" as const, price: "₹7,999", delivery: "2-3 days", support: "30 days", sortOrder: 0, features: ["5 pages", "Project gallery", "Contact form", "Mobile responsive"] },
      { name: "PREMIUM" as const, price: "₹14,999", delivery: "3-5 days", support: "60 days", sortOrder: 1, features: ["Unlimited projects", "Blog", "Booking system", "CMS admin", "Analytics"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "7-10 days", support: "6 months", sortOrder: 2, features: ["Custom animations", "Video integration", "E-commerce", "Multi-language"] },
    ],
    faqs: [{ question: "Konsi industry ke liye?", answer: "Designers, photographers, architects, freelancers — sab ke liye.", sortOrder: 0 }],
  },
  {
    slug: "inventory-management", name: "Inventory Management System",
    tagline: "Track stock, reduce waste, boost profits",
    description: "Complete inventory management with purchase orders, stock alerts, barcode scanning, and reports.",
    category: "SOFTWARE" as const, photo: "/photos/inventory.jpg", gallery: ["/photos/inventory.jpg"],
    basicPrice: 19999, premiumPrice: 39999, sortOrder: 9,
    techStack: ["React", "Node.js", "PostgreSQL"],
    highlights: ["Barcode scanning", "Real-time alerts", "Multi-warehouse"],
    deliverables: ["Inventory software", "Admin panel", "Barcode module", "Reports"],
    plans: [
      { name: "BASIC" as const, price: "₹19,999", delivery: "5-7 days", support: "30 days", sortOrder: 0, features: ["Product catalog", "Stock tracking", "Purchase orders", "Basic reports"] },
      { name: "PREMIUM" as const, price: "₹39,999", delivery: "7-10 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Barcode scanning", "Stock alerts", "Supplier management", "Advanced reports"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Multi-warehouse", "POS integration", "Mobile app", "ERP integration"] },
    ],
    faqs: [{ question: "Barcode scanner support?", answer: "Haan, Premium mein barcode scanning included hai.", sortOrder: 0 }],
  },
  {
    slug: "hr-payroll-software", name: "HR & Payroll Software",
    tagline: "Automate HR, save hours every month",
    description: "HR management with attendance, leave, payroll, tax calculation, payslips, and employee portal.",
    category: "SOFTWARE" as const, photo: "/photos/hr.jpg", gallery: ["/photos/hr.jpg"],
    basicPrice: 24999, premiumPrice: 49999, sortOrder: 10,
    techStack: ["React", "Node.js", "PostgreSQL"],
    highlights: ["Payroll automation", "Tax compliance", "Employee portal"],
    deliverables: ["HR software", "Employee portal", "Payroll module", "Reports"],
    plans: [
      { name: "BASIC" as const, price: "₹24,999", delivery: "5-7 days", support: "30 days", sortOrder: 0, features: ["Employee records", "Attendance", "Leave management", "Basic payroll"] },
      { name: "PREMIUM" as const, price: "₹49,999", delivery: "7-10 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Tax calculation", "Payslip generation", "Employee portal", "Analytics"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Biometric integration", "Mobile app", "Multi-company", "Compliance reports"] },
    ],
    faqs: [{ question: "GST/TDS calculation automatic?", answer: "Haan, Premium mein automatic tax calculation hai.", sortOrder: 0 }],
  },
  {
    slug: "crm-software", name: "CRM Software",
    tagline: "Convert more leads, retain more clients",
    description: "Customer relationship management with lead tracking, follow-up automation, deals pipeline, and reports.",
    category: "SOFTWARE" as const, photo: "/photos/crm.jpg", gallery: ["/photos/crm.jpg"],
    basicPrice: 22999, premiumPrice: 44999, sortOrder: 11,
    techStack: ["React", "Node.js", "PostgreSQL"],
    highlights: ["Lead pipeline", "Follow-up automation", "WhatsApp integration"],
    deliverables: ["CRM software", "Lead module", "Sales pipeline", "Analytics"],
    plans: [
      { name: "BASIC" as const, price: "₹22,999", delivery: "5-7 days", support: "30 days", sortOrder: 0, features: ["Lead management", "Contact database", "Basic pipeline", "Email follow-up"] },
      { name: "PREMIUM" as const, price: "₹44,999", delivery: "7-10 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Sales automation", "WhatsApp integration", "Advanced reports", "Team collaboration"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Custom workflows", "Mobile app", "API integrations", "AI lead scoring"] },
    ],
    faqs: [{ question: "WhatsApp se lead capture?", answer: "Haan, Premium mein WhatsApp integration included hai.", sortOrder: 0 }],
  },
  {
    slug: "billing-software", name: "Billing & Invoice Software",
    tagline: "Professional invoices, faster payments",
    description: "GST-compliant billing software with invoices, quotations, payment tracking, and financial reports.",
    category: "SOFTWARE" as const, photo: "/photos/billing.jpg", gallery: ["/photos/billing.jpg"],
    basicPrice: 14999, premiumPrice: 29999, sortOrder: 12,
    techStack: ["React", "Node.js", "PostgreSQL"],
    highlights: ["GST compliant", "Auto payment reminders", "Multi-currency"],
    deliverables: ["Billing software", "Invoice module", "GST reports", "Payment tracking"],
    plans: [
      { name: "BASIC" as const, price: "₹14,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["Invoice generation", "GST billing", "Payment tracking", "Basic reports"] },
      { name: "PREMIUM" as const, price: "₹29,999", delivery: "5-7 days", support: "90 days", sortOrder: 1, features: ["Everything in Basic", "Quotation module", "Payment reminders", "Financial reports", "Multi-currency"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "7-10 days", support: "1 year", sortOrder: 2, features: ["Inventory integration", "Bank reconciliation", "Mobile app", "Tally sync"] },
    ],
    faqs: [{ question: "GST returns file?", answer: "Haan, GSTR-1, GSTR-3B reports generate hote hain.", sortOrder: 0 }],
  },
];

async function main() {
  console.log("🌱 Seeding products...");
  for (const p of PRODUCTS) {
    const { plans, faqs, ...data } = p;
    try {
      await db.product.upsert({
        where: { slug: p.slug },
        update: {
          ...data,
          plans: { deleteMany: {}, create: plans },
          faqs: { deleteMany: {}, create: faqs },
        },
        create: {
          ...data,
          plans: { create: plans },
          faqs: { create: faqs },
        },
      });
      console.log(`✅ ${p.name}`);
    } catch (e) {
      console.error(`❌ ${p.name}:`, e);
    }
  }
  console.log(`✅ Done! ${PRODUCTS.length} products seeded.`);
}

main().catch(console.error).finally(() => db.$disconnect());
