export type Category = "websites" | "software" | "saas" | "mobile";

export interface Plan {
  name: "Basic" | "Premium" | "Custom";
  price: string;
  delivery: string;
  support: string;
  features: string[];
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  categoryLabel: string;
  photo: string;
  gallery: string[];
  basicPrice: number;
  premiumPrice: number;
  tag?: string;
  plans: Plan[];
  highlights: string[];
  techStack: string[];
  deliverables: string[];
  faqs: { q: string; a: string }[];
}

export const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All Products" },
  { value: "websites", label: "Websites" },
  { value: "software", label: "Software" },
  { value: "saas", label: "SaaS" },
  { value: "mobile", label: "Mobile Apps" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "restaurant-website",
    name: "Restaurant Website",
    tagline: "Beautiful website that fills your tables",
    description: "A stunning, mobile-first restaurant website with online menu, table booking, order system, and WhatsApp integration — fully branded with your restaurant name.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/restaurant.jpg",
    gallery: ["/photos/restaurant.jpg"],
    basicPrice: 12999,
    premiumPrice: 24999,
    tag: "Most Popular",
    highlights: ["+300% online orders", "2X revenue growth", "SEO 90+ score", "Mobile first"],
    techStack: ["Next.js", "Tailwind CSS", "Node.js", "MongoDB"],
    deliverables: ["Full source code", "Admin panel", "Menu management", "Booking system", "WhatsApp integration", "Google Maps embed"],
    plans: [
      {
        name: "Basic",
        price: "₹12,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["5-page website", "Online menu display", "Contact & location", "WhatsApp button", "Mobile responsive", "Basic SEO", "Google Maps", "Social media links"],
      },
      {
        name: "Premium",
        price: "₹24,999",
        delivery: "1-2 days",
        support: "90 days",
        features: ["Everything in Basic", "Online table booking", "Order management system", "Admin dashboard", "Payment gateway", "Customer reviews", "Photo gallery", "SEO optimization (90+)", "Email notifications", "WhatsApp automation"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "7-15 days",
        support: "1 year",
        features: ["Everything in Premium", "Custom features", "Loyalty program", "Multi-location support", "POS integration", "App development", "Annual maintenance", "Priority support"],
      },
    ],
    faqs: [
      { q: "Kya main apna menu khud update kar sakta hoon?", a: "Haan! Admin panel se aap menu items, prices aur photos akele update kar sakte hain — koi technical knowledge nahi chahiye." },
      { q: "Payment gateway kaunsa milta hai?", a: "Premium plan mein Razorpay (UPI, cards, netbanking) included hai. International ke liye Stripe bhi add kar sakte hain." },
      { q: "Delivery ke baad kya support milta hai?", a: "Basic mein 30 days, Premium mein 90 days free support milta hai. Uske baad AMC plan ₹2,999/year mein available hai." },
      { q: "Kya domain aur hosting included hai?", a: "Domain registration aur first year hosting Premium plan mein free hai. Basic mein setup guidance milti hai." },
    ],
  },
  {
    slug: "school-management-system",
    name: "School Management System",
    tagline: "Complete digital transformation for your school",
    description: "An all-in-one school management platform covering admissions, attendance, fees, exams, results, staff management, and parent communication — all in one dashboard.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/school.jpg",
    gallery: ["/photos/school.jpg"],
    basicPrice: 29999,
    premiumPrice: 59999,
    tag: "Best Seller",
    highlights: ["80% workload reduction", "95% parent satisfaction", "Auto fee reminders", "Real-time reports"],
    techStack: ["React", "Node.js", "PostgreSQL", "Redis"],
    deliverables: ["Full source code", "Admin panel", "Parent app", "Teacher portal", "Student portal", "SMS integration"],
    plans: [
      {
        name: "Basic",
        price: "₹29,999",
        delivery: "5-7 days",
        support: "30 days",
        features: ["Student management", "Attendance tracking", "Fee management", "Basic reports", "Notice board", "Staff management", "Exam scheduling", "Result management"],
      },
      {
        name: "Premium",
        price: "₹59,999",
        delivery: "3-5 days",
        support: "90 days",
        features: ["Everything in Basic", "Parent mobile app", "SMS/WhatsApp alerts", "Online fee payment", "Live attendance", "Performance analytics", "Library management", "Transport tracking", "ID card generator", "Multi-branch support"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-20 days",
        support: "1 year",
        features: ["Everything in Premium", "Custom modules", "ERP integration", "Biometric integration", "CBT exam module", "Video classes", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Kitne students handle kar sakta hai?", a: "Basic plan 500 students tak, Premium 5000+ students efficiently handle karta hai. Custom mein unlimited." },
      { q: "Kya parents apne bachche ka data dekh sakte hain?", a: "Haan! Premium mein parents ka dedicated mobile app milta hai — attendance, results, fees sab ek jagah." },
      { q: "Data secure hai?", a: "Bilkul! Bank-grade encryption, daily backups, aur private server deployment available hai." },
      { q: "Training milegi kya?", a: "Haan! Delivery ke time 2-hour video training aur documentation provide karte hain. Premium mein on-site training bhi available hai." },
    ],
  },
  {
    slug: "hospital-management-system",
    name: "Hospital Management System",
    tagline: "Streamline patient care with smart automation",
    description: "Complete hospital management covering OPD/IPD, appointments, billing, pharmacy, lab management, doctor modules, and reports — HIPAA-compliant and fully branded.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/hospital.jpg",
    gallery: ["/photos/hospital.jpg"],
    basicPrice: 49999,
    premiumPrice: 99999,
    tag: "Enterprise",
    highlights: ["70% faster operations", "90% patient satisfaction", "Paperless workflow", "Real-time bed tracking"],
    techStack: ["React", "Node.js", "PostgreSQL", "HL7 FHIR"],
    deliverables: ["Full source code", "Doctor portal", "Patient portal", "Pharmacy module", "Lab module", "Billing system"],
    plans: [
      {
        name: "Basic",
        price: "₹49,999",
        delivery: "7-10 days",
        support: "30 days",
        features: ["Patient registration", "OPD management", "Appointment booking", "Basic billing", "Prescription module", "IPD management", "Doctor management", "Basic reports"],
      },
      {
        name: "Premium",
        price: "₹99,999",
        delivery: "5-7 days",
        support: "90 days",
        features: ["Everything in Basic", "Pharmacy management", "Lab management", "Insurance billing", "Patient portal", "Doctor mobile app", "Bed management", "Inventory tracking", "Advanced analytics", "WhatsApp notifications"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "15-30 days",
        support: "1 year",
        features: ["Everything in Premium", "NABH compliance", "EMR/EHR integration", "Telemedicine module", "Blood bank module", "Custom workflows", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Kya system HIPAA compliant hai?", a: "Haan, Premium aur Custom plans mein full data security, encryption, aur audit trails included hain." },
      { q: "Multiple departments handle ho sakte hain?", a: "Bilkul! Cardiology, ortho, gynae — sab departments independently manage ho sakte hain ek dashboard se." },
      { q: "Existing data import ho sakta hai?", a: "Haan, Excel/CSV format se existing patient records import karne ki facility milti hai." },
      { q: "24/7 support milta hai?", a: "Premium mein 90 days, Custom mein 1 year 24/7 support. Hospital ke liye emergency support bhi available hai." },
    ],
  },
  {
    slug: "ecommerce-platform",
    name: "E-commerce Platform",
    tagline: "Sell anything online with zero commission",
    description: "A complete online store with product catalog, cart, payments, order management, inventory tracking, and marketing tools — your brand, your revenue.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/fashion.jpg",
    gallery: ["/photos/fashion.jpg"],
    basicPrice: 19999,
    premiumPrice: 39999,
    tag: "New",
    highlights: ["250% sales increase", "Zero commission", "Multi-payment support", "Auto inventory"],
    techStack: ["Next.js", "Stripe", "Razorpay", "MongoDB"],
    deliverables: ["Full source code", "Admin panel", "Product management", "Order dashboard", "Payment gateway", "Inventory system"],
    plans: [
      {
        name: "Basic",
        price: "₹19,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["Product catalog (100 items)", "Shopping cart", "Razorpay payment", "Order management", "Customer accounts", "Mobile responsive", "Basic SEO", "Email notifications"],
      },
      {
        name: "Premium",
        price: "₹39,999",
        delivery: "1-3 days",
        support: "90 days",
        features: ["Everything in Basic", "Unlimited products", "Coupon & discount system", "Abandoned cart recovery", "Product reviews", "Wishlist", "Advanced SEO", "WhatsApp notifications", "Sales analytics", "Multi-category management"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-20 days",
        support: "1 year",
        features: ["Everything in Premium", "Multi-vendor marketplace", "Subscription products", "B2B pricing", "Custom integrations", "Mobile app", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Kitne products add kar sakte hain?", a: "Basic mein 100 products, Premium mein unlimited. Custom mein multi-vendor bhi possible hai." },
      { q: "Kaunse payment methods supported hain?", a: "UPI, debit/credit cards, netbanking, EMI, wallets — Razorpay ke through sab kuch." },
      { q: "Inventory automatically update hoti hai?", a: "Haan! Har order ke baad inventory auto-deduct hoti hai. Low stock alerts bhi milte hain." },
      { q: "Kya mobile app bhi milegi?", a: "Custom plan mein Android + iOS app included hai. Basic/Premium mein PWA (progressive web app) milti hai." },
    ],
  },
  {
    slug: "hotel-booking-website",
    name: "Hotel Booking Website",
    tagline: "Direct bookings, zero OTA commission",
    description: "A premium hotel website with room showcase, real-time availability, direct booking engine, payment processing, and review management — fully branded for your property.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/restaurant.jpg",
    gallery: ["/photos/restaurant.jpg"],
    basicPrice: 24999,
    premiumPrice: 49999,
    tag: "Popular",
    highlights: ["Direct bookings +180%", "Zero OTA fees", "Real-time availability", "Auto confirmations"],
    techStack: ["Next.js", "Node.js", "MongoDB", "Razorpay"],
    deliverables: ["Full source code", "Booking engine", "Admin panel", "Room management", "Payment gateway", "Review system"],
    plans: [
      {
        name: "Basic",
        price: "₹24,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["Room showcase", "Online booking form", "WhatsApp inquiry", "Photo gallery", "Contact page", "Mobile responsive", "Google Maps", "Basic SEO"],
      },
      {
        name: "Premium",
        price: "₹49,999",
        delivery: "2-3 days",
        support: "90 days",
        features: ["Everything in Basic", "Real-time booking engine", "Razorpay payment", "Room availability calendar", "Admin dashboard", "Guest management", "Review management", "Email/SMS confirmations", "Discount management", "Analytics"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-15 days",
        support: "1 year",
        features: ["Everything in Premium", "Channel manager", "OTA integration", "Multi-property", "POS integration", "Housekeeping module", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Booking engine ke liye extra monthly fees hain?", a: "Nahi! Ek baar payment karo aur booking engine lifetime aapka. Zero commission, zero monthly fees." },
      { q: "MakeMyTrip/OYO se sync hoga?", a: "Custom plan mein channel manager integration available hai jo OTA platforms se sync karta hai." },
      { q: "Kya guest khud booking modify/cancel kar sakte hain?", a: "Haan! Premium mein guest portal milta hai jahan woh booking manage kar sakte hain." },
      { q: "Multi-property support hai?", a: "Custom plan mein multiple properties ek dashboard se manage ho sakti hain." },
    ],
  },
  {
    slug: "real-estate-website",
    name: "Real Estate Website",
    tagline: "Showcase properties, close deals faster",
    description: "A premium property listing website with advanced search, virtual tours, EMI calculator, lead management, and agent dashboard — built to convert visitors into buyers.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/office-meeting.jpg",
    gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 22999,
    premiumPrice: 44999,
    tag: "Premium",
    highlights: ["3X more leads", "Advanced search filters", "Virtual tour ready", "EMI calculator"],
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Google Maps API"],
    deliverables: ["Full source code", "Property management", "Lead dashboard", "Agent portal", "Search engine", "Map integration"],
    plans: [
      {
        name: "Basic",
        price: "₹22,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["Property listing (50)", "Search & filters", "Property detail pages", "Contact forms", "Photo galleries", "WhatsApp inquiry", "Google Maps", "Mobile responsive"],
      },
      {
        name: "Premium",
        price: "₹44,999",
        delivery: "2-3 days",
        support: "90 days",
        features: ["Everything in Basic", "Unlimited listings", "Lead management CRM", "EMI calculator", "Agent dashboard", "Virtual tour support", "Featured listings", "SEO optimization", "Email/SMS leads", "Analytics"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-15 days",
        support: "1 year",
        features: ["Everything in Premium", "Multi-agent portal", "Commission tracking", "Video walkthrough", "Custom search algorithms", "Mortgage integration", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Kitni properties add kar sakta hoon?", a: "Basic mein 50 properties, Premium mein unlimited. Custom mein multi-city bhi." },
      { q: "Virtual tour kaise kaam karta hai?", a: "Premium mein 360° virtual tour iframe embed karne ki facility hai. Matterport/YouTube 360 videos support hote hain." },
      { q: "Leads kaise track hote hain?", a: "Premium mein built-in CRM milta hai — sab inquiries ek jagah, follow-up reminders ke saath." },
      { q: "Google Ads se integration hoti hai?", a: "Haan, Google Ads conversion tracking aur Analytics 4 integration included hai." },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getRelated(slug: string, category: Category): Product[] {
  return PRODUCTS.filter(p => p.slug !== slug && p.category === category).slice(0, 3);
}
