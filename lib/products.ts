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
  demoUrl?: string;  // Real demo website link — paste here
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
    demoUrl: "",
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
      { q: "Can I update my menu myself?", a: "Yes! You can update menu items, prices, and photos on your own from the admin panel — no technical knowledge required." },
      { q: "Which payment gateway is included?", a: "Razorpay (UPI, cards, netbanking) is included in the Premium plan. Stripe can also be added for international payments." },
      { q: "What support is provided after delivery?", a: "Basic includes 30 days and Premium includes 90 days of free support. After that, an AMC plan is available at ₹2,999/year." },
      { q: "Is domain and hosting included?", a: "Domain registration and first-year hosting are free with the Premium plan. The Basic plan includes setup guidance." },
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
    demoUrl: "",
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
      { q: "How many students can it handle?", a: "The Basic plan handles up to 500 students efficiently, Premium handles 5,000+, and Custom supports unlimited students." },
      { q: "Can parents view their child's data?", a: "Yes! Premium includes a dedicated mobile app for parents — attendance, results, and fees all in one place." },
      { q: "Is the data secure?", a: "Absolutely! Bank-grade encryption, daily backups, and private server deployment are all available." },
      { q: "Will training be provided?", a: "Yes! At the time of delivery we provide a 2-hour video training session and documentation. On-site training is also available with the Premium plan." },
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
    demoUrl: "",
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
      { q: "Is the system HIPAA compliant?", a: "Yes, full data security, encryption, and audit trails are included in the Premium and Custom plans." },
      { q: "Can multiple departments be managed?", a: "Absolutely! Cardiology, orthopaedics, gynaecology — all departments can be managed independently from a single dashboard." },
      { q: "Can existing data be imported?", a: "Yes, existing patient records can be imported from Excel/CSV format." },
      { q: "Is 24/7 support available?", a: "Premium includes 90 days and Custom includes 1 year of 24/7 support. Emergency support is also available for hospitals." },
    ],
  },
  {
    slug: "e-commerce-platform",
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
    demoUrl: "",
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
      { q: "How many products can be added?", a: "Basic supports 100 products and Premium supports unlimited. A multi-vendor setup is also possible with the Custom plan." },
      { q: "Which payment methods are supported?", a: "UPI, debit/credit cards, netbanking, EMI, and wallets — everything through Razorpay." },
      { q: "Is inventory updated automatically?", a: "Yes! Inventory is auto-deducted after every order. Low stock alerts are also included." },
      { q: "Is a mobile app available?", a: "Android + iOS app is included in the Custom plan. Basic and Premium include a PWA (Progressive Web App)." },
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
    demoUrl: "",
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
      { q: "Are there extra monthly fees for the booking engine?", a: "No! Pay once and the booking engine is yours for life. Zero commission, zero monthly fees." },
      { q: "Will it sync with MakeMyTrip/OYO?", a: "A channel manager integration is available in the Custom plan that syncs with OTA platforms." },
      { q: "Can guests modify or cancel bookings themselves?", a: "Yes! Premium includes a guest portal where guests can manage their bookings." },
      { q: "Is multi-property support available?", a: "With the Custom plan, multiple properties can be managed from a single dashboard." },
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
    demoUrl: "https://www.aapkaplot.com",
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
      { q: "How many properties can I add?", a: "Basic supports 50 properties and Premium supports unlimited. Multi-city listings are also possible with the Custom plan." },
      { q: "How does the virtual tour work?", a: "Premium includes the ability to embed 360° virtual tour iframes. Matterport and YouTube 360 videos are both supported." },
      { q: "How are leads tracked?", a: "Premium includes a built-in CRM — all inquiries in one place, with follow-up reminders." },
      { q: "Is there Google Ads integration?", a: "Yes, Google Ads conversion tracking and Analytics 4 integration are included." },
    ],
  },
  {
    slug: "gym-fitness-website",
    name: "Gym & Fitness Website",
    tagline: "Turn visitors into members with a powerful gym website",
    description: "A high-energy gym and fitness center website with online membership plans, class schedules, trainer profiles, diet consultation booking, and WhatsApp integration.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/person-laptop.jpg",
    gallery: ["/photos/person-laptop.jpg"],
    basicPrice: 11999,
    premiumPrice: 21999,
    tag: "Popular",
    demoUrl: "",
    highlights: ["2X membership growth", "Online fee collection", "Class booking system", "Mobile-first design"],
    techStack: ["Next.js", "Tailwind CSS", "Node.js", "Razorpay"],
    deliverables: ["Full source code", "Membership management", "Class scheduler", "Trainer profiles", "Online payment", "WhatsApp integration"],
    plans: [
      {
        name: "Basic",
        price: "₹11,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["5-page website", "Membership plans display", "Class schedule", "Trainer profiles", "Contact & location", "WhatsApp button", "Google Maps", "Mobile responsive"],
      },
      {
        name: "Premium",
        price: "₹21,999",
        delivery: "2-3 days",
        support: "90 days",
        features: ["Everything in Basic", "Online membership purchase", "Diet consultation booking", "Member login portal", "Razorpay payment", "BMI calculator", "Photo & video gallery", "SEO optimization", "Email notifications", "WhatsApp automation"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "7-12 days",
        support: "1 year",
        features: ["Everything in Premium", "Mobile app (Android/iOS)", "Attendance tracking", "POS integration", "Loyalty rewards", "Multi-branch support", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Can members purchase membership online?", a: "Yes! Premium supports online payment via UPI, cards, and netbanking." },
      { q: "How does class booking work?", a: "Members can book their preferred class and time slot. The trainer also receives a notification." },
      { q: "Is a mobile app available?", a: "A dedicated Android/iOS app is developed as part of the Custom plan." },
      { q: "Can multiple trainers be managed?", a: "Yes! Each trainer gets a separate profile, availability calendar, and booking management." },
    ],
  },
  {
    slug: "portfolio-website",
    name: "Portfolio Website",
    tagline: "Showcase your work and land more clients",
    description: "A stunning personal or agency portfolio website with animated project showcases, client testimonials, skills display, contact form, and social media integration.",
    category: "websites",
    categoryLabel: "Website",
    photo: "/photos/office-meeting.jpg",
    gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 7999,
    premiumPrice: 14999,
    tag: "Fast Delivery",
    demoUrl: "",
    highlights: ["1-day delivery", "Animated showcases", "SEO optimized", "Client testimonials"],
    techStack: ["Next.js", "Framer Motion", "Tailwind CSS", "EmailJS"],
    deliverables: ["Full source code", "Project showcase", "Contact form", "Blog section", "SEO setup", "Social media links"],
    plans: [
      {
        name: "Basic",
        price: "₹7,999",
        delivery: "1-2 days",
        support: "30 days",
        features: ["5-page portfolio", "Project gallery (10)", "Skills section", "Contact form", "Social media links", "Mobile responsive", "Basic SEO", "WhatsApp button"],
      },
      {
        name: "Premium",
        price: "₹14,999",
        delivery: "1 day",
        support: "90 days",
        features: ["Everything in Basic", "Unlimited projects", "Framer Motion animations", "Blog section", "Client testimonials", "Case study pages", "Custom domain setup", "Google Analytics", "Advanced SEO", "Dark/Light mode"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "3-5 days",
        support: "1 year",
        features: ["Everything in Premium", "3D animations (Three.js)", "Video background", "Interactive resume", "Custom CMS", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Can I update my own content?", a: "Yes! Premium includes a simple content management system." },
      { q: "How do I connect a custom domain?", a: "We will provide you with a step-by-step guide. You can purchase a domain from GoDaddy or Namecheap." },
      { q: "Will there be a blog section?", a: "Yes! A blog section is included in Premium — for writing articles, tutorials, and updates." },
      { q: "How fast will the site load?", a: "We guarantee a 90+ Lighthouse score through Next.js and image optimization." },
    ],
  },
  {
    slug: "inventory-management",
    name: "Inventory Management System",
    tagline: "Never run out of stock — manage smarter",
    description: "A complete inventory management system with real-time stock tracking, purchase orders, supplier management, low-stock alerts, barcode support, and detailed reports.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/person-laptop.jpg",
    gallery: ["/photos/person-laptop.jpg"],
    basicPrice: 24999,
    premiumPrice: 49999,
    tag: "Best Value",
    demoUrl: "",
    highlights: ["80% less stockouts", "Real-time tracking", "Barcode scanner", "Auto reorder alerts"],
    techStack: ["React", "Node.js", "PostgreSQL", "Redis"],
    deliverables: ["Full source code", "Admin dashboard", "Mobile app", "Barcode integration", "Reports", "Multi-warehouse support"],
    plans: [
      {
        name: "Basic",
        price: "₹24,999",
        delivery: "5-7 days",
        support: "30 days",
        features: ["Product catalog", "Stock tracking", "Purchase orders", "Supplier management", "Low-stock alerts", "Sales tracking", "Basic reports", "User management"],
      },
      {
        name: "Premium",
        price: "₹49,999",
        delivery: "3-5 days",
        support: "90 days",
        features: ["Everything in Basic", "Barcode/QR scanner", "Multi-warehouse", "Mobile app", "Automatic reorders", "Batch tracking", "Expiry alerts", "Advanced analytics", "GST reports", "API access"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-15 days",
        support: "1 year",
        features: ["Everything in Premium", "ERP integration", "RFID support", "Custom workflows", "Third-party integrations", "White-label option", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Is barcode scanner support available?", a: "Yes! Both USB barcode scanners and mobile camera scanners are supported in the Premium plan." },
      { q: "Can multiple warehouses be managed?", a: "The Premium plan supports unlimited warehouses/locations managed from a single dashboard." },
      { q: "Are GST-compliant reports available?", a: "Yes! Ready-to-file reports for GSTR-1 and GSTR-3B are automatically generated." },
      { q: "Can existing data be imported?", a: "Yes! Bulk import from Excel/CSV is supported. Migration support is also available." },
    ],
  },
  {
    slug: "hr-payroll-software",
    name: "HR & Payroll Software",
    tagline: "Automate HR — from hiring to salary",
    description: "A complete HR management system covering employee records, attendance, leave management, payroll processing, salary slips, performance reviews, and compliance reports.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/office-meeting.jpg",
    gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 34999,
    premiumPrice: 69999,
    tag: "Enterprise",
    demoUrl: "",
    highlights: ["90% payroll automation", "Biometric integration", "PF/ESI compliance", "One-click salary slips"],
    techStack: ["React", "Node.js", "PostgreSQL", "Biometric API"],
    deliverables: ["Full source code", "Employee portal", "Payroll engine", "Attendance system", "Leave management", "Compliance reports"],
    plans: [
      {
        name: "Basic",
        price: "₹34,999",
        delivery: "5-7 days",
        support: "30 days",
        features: ["Employee records", "Attendance tracking", "Leave management", "Basic payroll", "Salary slip PDF", "Department management", "Role-based access", "Basic reports"],
      },
      {
        name: "Premium",
        price: "₹69,999",
        delivery: "3-5 days",
        support: "90 days",
        features: ["Everything in Basic", "Biometric integration", "PF/ESI/TDS auto-calculation", "Employee self-service portal", "Performance reviews", "Recruitment module", "Training management", "Advanced analytics", "Mobile app", "Compliance dashboard"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "10-20 days",
        support: "1 year",
        features: ["Everything in Premium", "Custom approval workflows", "HRMS ERP integration", "Chatbot for HR queries", "AI performance insights", "Multi-company support", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Are PF and ESI calculated automatically?", a: "Yes! In Premium, statutory deductions — PF, ESI, TDS — are auto-calculated according to current rules." },
      { q: "Can it connect to a biometric machine?", a: "Yes! Integration with popular biometric devices like ZKTeco and eSSL is available." },
      { q: "How does an employee receive their salary slip?", a: "A PDF salary slip is generated in one click. Employees can also download it themselves from the employee portal." },
      { q: "How many employees can it handle?", a: "Basic handles up to 100 employees and Premium handles 1,000+ employees efficiently." },
    ],
  },
  {
    slug: "crm-software",
    name: "CRM Software",
    tagline: "Never lose a lead — close more deals",
    description: "A powerful Customer Relationship Management system with lead pipeline, automated follow-ups, email/WhatsApp campaigns, sales analytics, and team performance tracking.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/person-laptop.jpg",
    gallery: ["/photos/person-laptop.jpg"],
    basicPrice: 19999,
    premiumPrice: 39999,
    tag: "Sales Booster",
    demoUrl: "",
    highlights: ["3X lead conversion", "Auto follow-ups", "WhatsApp integration", "Team performance reports"],
    techStack: ["React", "Node.js", "PostgreSQL", "WhatsApp API"],
    deliverables: ["Full source code", "Lead pipeline", "Email campaigns", "WhatsApp automation", "Analytics dashboard", "Mobile app"],
    plans: [
      {
        name: "Basic",
        price: "₹19,999",
        delivery: "3-5 days",
        support: "30 days",
        features: ["Lead management", "Contact database", "Deal pipeline", "Task reminders", "Email integration", "Notes & activity log", "Basic reports", "Team management"],
      },
      {
        name: "Premium",
        price: "₹39,999",
        delivery: "2-3 days",
        support: "90 days",
        features: ["Everything in Basic", "WhatsApp automation", "Email campaigns", "Lead scoring", "Sales forecasting", "Custom pipeline stages", "Document management", "Mobile app", "Advanced analytics", "API integration"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "7-14 days",
        support: "1 year",
        features: ["Everything in Premium", "AI lead scoring", "Custom integrations", "Multi-team support", "White-label option", "Tally/ERP sync", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Can leads be automatically followed up via WhatsApp?", a: "Yes! In Premium, auto-messages can be scheduled using the WhatsApp Business API." },
      { q: "Can leads be imported from Excel?", a: "Yes! Bulk import from CSV/Excel is done in under a minute." },
      { q: "Does it work on mobile?", a: "Premium includes an Android/iOS app — perfect for field sales teams." },
      { q: "How many users can use it?", a: "Basic supports 5 users, Premium supports 25 users, and Custom supports unlimited users." },
    ],
  },
  {
    slug: "billing-software",
    name: "Billing & Invoice Software",
    tagline: "Create GST bills in seconds",
    description: "A fast, GST-compliant billing and invoice software for shops, services, and businesses — with inventory sync, customer management, payment tracking, and mobile access.",
    category: "software",
    categoryLabel: "Software",
    photo: "/photos/office-meeting.jpg",
    gallery: ["/photos/office-meeting.jpg"],
    basicPrice: 9999,
    premiumPrice: 19999,
    tag: "GST Ready",
    demoUrl: "",
    highlights: ["GST compliant", "30-second invoices", "Payment tracking", "Inventory sync"],
    techStack: ["React", "Node.js", "PostgreSQL", "Razorpay"],
    deliverables: ["Full source code", "GST billing engine", "Customer management", "Inventory sync", "Reports", "Mobile app"],
    plans: [
      {
        name: "Basic",
        price: "₹9,999",
        delivery: "2-3 days",
        support: "30 days",
        features: ["GST invoice creation", "Customer database", "Product/service catalog", "Payment tracking", "PDF invoices", "Basic reports", "WhatsApp invoice share", "Mobile responsive"],
      },
      {
        name: "Premium",
        price: "₹19,999",
        delivery: "1-2 days",
        support: "90 days",
        features: ["Everything in Basic", "Inventory sync", "Recurring invoices", "Payment reminders", "GSTR reports", "E-invoice support", "Mobile app", "Multi-user access", "Bulk invoicing", "Bank reconciliation"],
      },
      {
        name: "Custom",
        price: "Quote",
        delivery: "5-10 days",
        support: "1 year",
        features: ["Everything in Premium", "Tally integration", "ERP sync", "Custom approval workflow", "Multi-branch", "White-label", "Annual maintenance"],
      },
    ],
    faqs: [
      { q: "Will I get help filing GST returns?", a: "Yes! Ready reports for GSTR-1 and GSTR-3B are available that can be directly uploaded." },
      { q: "Can old Tally data be imported?", a: "Tally migration support is included in the Custom plan." },
      { q: "Can invoices be sent via WhatsApp?", a: "Yes! A PDF invoice can be shared on WhatsApp in one click." },
      { q: "Does it work without internet?", a: "An offline mode is available in the Custom plan — data syncs automatically once back online." },
    ],
  },
];

export interface Addon {
  id: string;
  icon: string;
  name: string;
  description: string;
  monthlyPrice: number;   // base monthly / one-time price
  isRecurring: boolean;   // true = monthly subscription (yearly gives 50% off)
}

// Yearly price = monthlyPrice × 12 × 0.5 (50% off) for recurring
// One-time add-ons: same price regardless of billing cycle
export const ADDONS: Addon[] = [
  { id: "annual-maintenance",  icon: "🔧", name: "Annual Maintenance",     description: "Bug fixes, updates, minor changes",      monthlyPrice: 3,   isRecurring: true  },
  { id: "extended-support",    icon: "🎯", name: "Extended Support",        description: "Priority support + same-day response",   monthlyPrice: 5,   isRecurring: true  },
  { id: "google-ads-setup",    icon: "📢", name: "Google Ads Setup",        description: "Campaign setup + $24 ad credit",          monthlyPrice: 48,  isRecurring: false },
  { id: "whatsapp-marketing",  icon: "💬", name: "WhatsApp Marketing",      description: "Bulk messages to 1,000 contacts",         monthlyPrice: 24,  isRecurring: true  },
  { id: "extra-language",      icon: "🌐", name: "Extra Language",          description: "Add Hindi / Arabic / regional language",  monthlyPrice: 60,  isRecurring: false },
  { id: "mobile-app-basic",    icon: "📱", name: "Mobile App (Basic)",      description: "Android APK for your website",            monthlyPrice: 180, isRecurring: false },
  { id: "social-media-kit",    icon: "📸", name: "Social Media Kit",        description: "20 branded posts + templates",            monthlyPrice: 30,  isRecurring: false },
  { id: "logo-design",         icon: "🎨", name: "Logo Design",             description: "Professional logo + 3 revisions",         monthlyPrice: 24,  isRecurring: false },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getRelated(slug: string, category: Category): Product[] {
  return PRODUCTS.filter(p => p.slug !== slug && p.category === category).slice(0, 3);
}
