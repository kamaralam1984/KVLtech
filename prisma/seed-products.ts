import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || "postgresql://kvluser:kvltech2024@localhost:5432/kvltech" });
const db = new PrismaClient({ adapter });

const PRODUCTS = [
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
    tagline: "Sell anything online with zero commission",
    description: "Complete online store: product catalog, cart, payments, order management, inventory.",
    category: "WEBSITE" as const, photo: "/photos/fashion.jpg", gallery: ["/photos/fashion.jpg"],
    basicPrice: 19999, premiumPrice: 39999, tag: "New", sortOrder: 4,
    techStack: ["Next.js", "Stripe", "Razorpay", "MongoDB"],
    highlights: ["250% sales increase", "Zero commission"],
    deliverables: ["Full source code", "Admin panel", "Payment gateway", "Inventory system"],
    plans: [
      { name: "BASIC" as const, price: "₹19,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["100 products", "Shopping cart", "Razorpay", "Order management"] },
      { name: "PREMIUM" as const, price: "₹39,999", delivery: "1-3 days", support: "90 days", sortOrder: 1, features: ["Unlimited products", "Coupon system", "Analytics", "WhatsApp"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-20 days", support: "1 year", sortOrder: 2, features: ["Multi-vendor", "Subscription", "Mobile app"] },
    ],
    faqs: [{ question: "Kitne products?", answer: "Basic 100, Premium unlimited.", sortOrder: 0 }],
  },
  {
    slug: "hotel-booking-website", name: "Hotel Booking Website",
    tagline: "Direct bookings, zero OTA commission",
    description: "Premium hotel website with room showcase, real-time availability, booking engine.",
    category: "WEBSITE" as const, photo: "/photos/restaurant.jpg", gallery: ["/photos/restaurant.jpg"],
    basicPrice: 24999, premiumPrice: 49999, tag: "Popular", sortOrder: 5,
    techStack: ["Next.js", "Node.js", "MongoDB", "Razorpay"],
    highlights: ["Direct bookings +180%", "Zero OTA fees"],
    deliverables: ["Full source code", "Booking engine", "Admin panel", "Room management"],
    plans: [
      { name: "BASIC" as const, price: "₹24,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["Room showcase", "Booking form", "Gallery", "WhatsApp"] },
      { name: "PREMIUM" as const, price: "₹49,999", delivery: "2-3 days", support: "90 days", sortOrder: 1, features: ["Real-time booking", "Razorpay", "Admin dashboard", "Analytics"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Channel manager", "OTA integration", "Multi-property"] },
    ],
    faqs: [{ question: "Extra monthly fees?", answer: "Nahi! Lifetime free.", sortOrder: 0 }],
  },
  {
    slug: "real-estate-website", name: "Real Estate Website",
    tagline: "Showcase properties, close deals faster",
    description: "Premium property listing: advanced search, virtual tours, EMI calculator, lead management.",
    category: "WEBSITE" as const, photo: "/photos/office-meeting.jpg", gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 22999, premiumPrice: 44999, tag: "Premium", sortOrder: 6,
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Google Maps API"],
    highlights: ["3X more leads", "Advanced search", "Virtual tour"],
    deliverables: ["Full source code", "Property management", "Lead dashboard", "Agent portal"],
    plans: [
      { name: "BASIC" as const, price: "₹22,999", delivery: "3-5 days", support: "30 days", sortOrder: 0, features: ["50 listings", "Search & filters", "Contact forms", "Gallery"] },
      { name: "PREMIUM" as const, price: "₹44,999", delivery: "2-3 days", support: "90 days", sortOrder: 1, features: ["Unlimited listings", "Lead CRM", "EMI calculator", "Agent dashboard"] },
      { name: "CUSTOM" as const, price: "Quote", delivery: "10-15 days", support: "1 year", sortOrder: 2, features: ["Multi-agent", "Commission tracking", "Video walkthrough"] },
    ],
    faqs: [{ question: "Kitni properties?", answer: "Basic 50, Premium unlimited.", sortOrder: 0 }],
  },
];

async function main() {
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
  console.log("✅ All products seeded!");
}

main().catch(console.error).finally(() => db.$disconnect());
