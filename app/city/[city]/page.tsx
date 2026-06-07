import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// ISR: regenerate every 24 hours (city pages are mostly static)
export const revalidate = 86400

/* ─────────────────────────────────────────────
   City data
───────────────────────────────────────────── */
const CITY_DATA: Record<string, { name: string; state: string }> = {
  mumbai:     { name: "Mumbai",     state: "Maharashtra" },
  delhi:      { name: "Delhi",      state: "Delhi NCR" },
  bangalore:  { name: "Bangalore",  state: "Karnataka" },
  hyderabad:  { name: "Hyderabad",  state: "Telangana" },
  chennai:    { name: "Chennai",    state: "Tamil Nadu" },
  pune:       { name: "Pune",       state: "Maharashtra" },
  kolkata:    { name: "Kolkata",    state: "West Bengal" },
  ahmedabad:  { name: "Ahmedabad",  state: "Gujarat" },
  jaipur:     { name: "Jaipur",     state: "Rajasthan" },
  surat:      { name: "Surat",      state: "Gujarat" },
  lucknow:    { name: "Lucknow",    state: "Uttar Pradesh" },
  noida:      { name: "Noida",      state: "Uttar Pradesh" },
  gurgaon:    { name: "Gurgaon",    state: "Haryana" },
  chandigarh: { name: "Chandigarh", state: "Punjab" },
  indore:     { name: "Indore",     state: "Madhya Pradesh" },
};

const CITY_SLUGS = Object.keys(CITY_DATA);

/* ─────────────────────────────────────────────
   Static params
───────────────────────────────────────────── */
export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

/* ─────────────────────────────────────────────
   Metadata
───────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) return {};

  const { name, state } = data;
  const BASE = "https://kvlbusinesssolutions.com";

  return {
    title: `Website Design in ${name} — KVL TECH | ₹12,999 se shuru`,
    description: `${name} ke businesses ke liye professional website development. Restaurant, hospital, school, e-commerce — sab kuch ₹12,999 se shuru. 3-5 din mein delivery. ${state} ka #1 web design company.`,
    keywords: `website design ${name}, web development ${name}, website banwao ${name}, professional website ${name}, ${state} web design, KVL TECH ${name}`,
    openGraph: {
      title: `Website Design in ${name} — KVL TECH`,
      description: `${name} ke liye premium website development. ₹12,999 se shuru, 3-5 din delivery.`,
      url: `${BASE}/city/${city}`,
      siteName: "KVL TECH",
      type: "website",
      images: [
        {
          url: `${BASE}/kvl-tech-logo-tight.png`,
          width: 1200,
          height: 630,
          alt: `Website Design in ${name} — KVL TECH`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Website Design in ${name} — KVL TECH | ₹12,999 se shuru`,
      description: `${name} ke businesses ke liye affordable aur professional website design.`,
    },
    alternates: {
      canonical: `${BASE}/city/${city}`,
    },
  };
}

/* ─────────────────────────────────────────────
   Page pricing plans
───────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    price: "₹12,999",
    delivery: "3-5 din",
    support: "30 din",
    popular: false,
    features: [
      "5-page professional website",
      "Mobile responsive design",
      "WhatsApp button integration",
      "Google Maps embed",
      "Contact form",
      "Basic SEO setup",
      "Social media links",
      "30-day free support",
    ],
  },
  {
    name: "Business",
    price: "₹24,999",
    delivery: "2-3 din",
    support: "90 din",
    popular: true,
    features: [
      "Everything in Starter",
      "Admin dashboard",
      "Online payment (Razorpay/UPI)",
      "WhatsApp automation",
      "Advanced SEO (90+ score)",
      "Google Analytics setup",
      "Email notifications",
      "Photo/video gallery",
      "90-day free support",
      "Domain + 1yr hosting FREE",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    delivery: "7-15 din",
    support: "1 saal",
    popular: false,
    features: [
      "Everything in Business",
      "Custom features",
      "Mobile app (Android/iOS)",
      "Multi-location support",
      "ERP/CRM integration",
      "Annual maintenance plan",
      "Priority 24/7 support",
      "Dedicated project manager",
    ],
  },
];

/* ─────────────────────────────────────────────
   USPs per city (city-aware snippets)
───────────────────────────────────────────── */
function getCityUSPs(name: string, state: string) {
  return [
    {
      icon: "🚀",
      title: `${name} mein Fast Delivery`,
      desc: `${name} ke businesses ko 3-5 din mein live website milti hai. Koi wait nahi, koi delay nahi.`,
    },
    {
      icon: "💰",
      title: "Affordable Prices",
      desc: `${state} ke market ke hisaab se affordable pricing. ₹12,999 se shuru — no hidden charges.`,
    },
    {
      icon: "📱",
      title: "Mobile-First Design",
      desc: `${name} ke customers mobile pe browse karte hain. Humari websites 100% mobile-optimized hoti hain.`,
    },
    {
      icon: "🔍",
      title: `${name} Local SEO`,
      desc: `Google pe "${name} [aapka business]" search hone pe aapki website top mein aaye — guaranteed SEO setup.`,
    },
    {
      icon: "🛠️",
      title: "Full Support in Hindi",
      desc: `${name} mein aapko Hindi + English mein full technical support milta hai. 24/7 WhatsApp available.`,
    },
    {
      icon: "🏆",
      title: `${state} ka Trusted Partner`,
      desc: `5,000+ businesses ko hum already serve kar chuke hain. ${name} mein bhi aapka number add ho sakta hai.`,
    },
  ];
}

/* ─────────────────────────────────────────────
   Services grid
───────────────────────────────────────────── */
const SERVICES = [
  { name: "Restaurant Website",    slug: "restaurant-website",   price: "₹12,999", icon: "🍽️" },
  { name: "School Management",     slug: "school-management-system", price: "₹29,999", icon: "🏫" },
  { name: "Hospital Management",   slug: "hospital-management-system", price: "₹49,999", icon: "🏥" },
  { name: "E-commerce Store",      slug: "ecommerce-platform",   price: "₹19,999", icon: "🛒" },
  { name: "Hotel Booking Website", slug: "hotel-booking-website", price: "₹24,999", icon: "🏨" },
  { name: "Real Estate Website",   slug: "real-estate-website",  price: "₹22,999", icon: "🏠" },
  { name: "Gym & Fitness Website", slug: "gym-fitness-website",  price: "₹11,999", icon: "💪" },
  { name: "Portfolio Website",     slug: "portfolio-website",    price: "₹7,999",  icon: "🎨" },
];

/* ─────────────────────────────────────────────
   FAQs
───────────────────────────────────────────── */
function getCityFAQs(name: string) {
  return [
    {
      q: `Kya aap ${name} mein on-site visit kar sakte hain?`,
      a: `Haan! ${name} aur surrounding areas ke liye on-site consultation available hai. WhatsApp pe contact karein — hum schedule fix karenge.`,
    },
    {
      q: "Website delivery mein kitna time lagta hai?",
      a: "Starter plan mein 3-5 din, Business plan mein 2-3 din. Emergency delivery bhi possible hai — extra charges apply.",
    },
    {
      q: "Kya main apna content khud update kar sakta hoon?",
      a: "Bilkul! Business aur Enterprise plans mein easy-to-use admin panel milta hai. Koi coding knowledge nahi chahiye.",
    },
    {
      q: "Domain aur hosting ka kya hoga?",
      a: "Business plan mein domain registration aur 1 saal ki hosting FREE milti hai. Starter plan mein guidance dete hain.",
    },
    {
      q: "Payment kaise karein?",
      a: "UPI, bank transfer, Razorpay — sab methods accepted hain. 50% advance, 50% delivery pe.",
    },
    {
      q: "Delivery ke baad support milega?",
      a: "Haan! Starter mein 30 din, Business mein 90 din free support. Uske baad annual maintenance plan ₹2,999/year.",
    },
  ];
}

/* ─────────────────────────────────────────────
   Page Component
───────────────────────────────────────────── */
export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const data = CITY_DATA[city];

  if (!data) notFound();

  const { name, state } = data;
  const usps = getCityUSPs(name, state);
  const faqs = getCityFAQs(name);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "64px" }}>

        {/* ── Hero ── */}
        <section
          style={{
            background: "linear-gradient(135deg, var(--color-navy) 0%, #1a2744 60%, #0F172A 100%)",
            position: "relative",
            overflow: "hidden",
          }}
          className="py-20 md:py-28"
        >
          {/* Decorative gold orb */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              <Link href="/" style={{ color: "rgba(255,255,255,0.5)" }} className="hover:text-white transition-colors">Home</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <Link href="/city/mumbai" style={{ color: "rgba(255,255,255,0.5)" }} className="hover:text-white transition-colors">Cities</Link>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
              <span style={{ color: "var(--color-gold)" }}>{name}</span>
            </nav>

            {/* Badge */}
            <div className="section-badge mb-6" style={{ background: "rgba(201,162,39,0.12)", borderColor: "rgba(201,162,39,0.4)", color: "var(--color-gold)" }}>
              📍 {name}, {state}
            </div>

            <h1
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              style={{ color: "#fff" }}
            >
              {name} ke liye{" "}
              <span className="text-gold-gradient">Premium Website</span>
              <br />
              Development
            </h1>

            <p className="text-lg md:text-xl mb-8 max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {name} ke businesses ke liye professional, fast-loading aur SEO-optimized websites.{" "}
              <strong style={{ color: "var(--color-gold)" }}>₹12,999 se shuru</strong> — 3-5 din mein delivery.
              Aapka business online lao, aaj hi.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`https://wa.me/919942000413?text=Namaste! Mujhe ${name} mein website chahiye. Please quote karein.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-base px-7 py-3.5 font-bold"
              >
                WhatsApp pe Quote Lein
              </Link>
              <Link href="/contact" className="btn-outline text-base px-7 py-3.5" style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>
                Free Consultation
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { label: "5,000+", sub: "Happy Clients" },
                { label: "3-5 din", sub: "Delivery Guarantee" },
                { label: "90+", sub: "Lighthouse Score" },
                { label: "24/7", sub: "WhatsApp Support" },
              ].map(({ label, sub }) => (
                <div key={sub}>
                  <div className="text-2xl font-bold font-display" style={{ color: "var(--color-gold)" }}>{label}</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── USPs ── */}
        <section className="py-16 md:py-20" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge">Kyun KVL TECH?</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {name} mein <span className="text-gold-gradient">Website Design</span> ke liye
                <br />
                Hum Kyun Best Hain?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {usps.map((usp) => (
                <div key={usp.title} className="card p-6">
                  <div
                    className="text-3xl mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.15)" }}
                  >
                    {usp.icon}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--color-text)" }}>
                    {usp.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {usp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="py-16 md:py-20" style={{ background: "var(--color-bg)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge">Our Services</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {name} ke liye <span className="text-gold-gradient">Website Solutions</span>
              </h2>
              <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Aapke business type ke hisaab se ready-made aur customized website solutions — {name} mein.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SERVICES.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/products/${svc.slug}`}
                  className="card p-5 flex flex-col gap-3 group"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="text-2xl w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.15)" }}
                  >
                    {svc.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{svc.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>in {name}</p>
                  </div>
                  <div
                    className="text-sm font-bold mt-auto"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {svc.price} se shuru
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-16 md:py-20" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge">Pricing</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {name} ke liye <span className="text-gold-gradient">Transparent Pricing</span>
              </h2>
              <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
                Koi hidden charges nahi. Ek baar payment, lifetime ownership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="card p-7 flex flex-col relative"
                  style={
                    plan.popular
                      ? {
                          border: "2px solid var(--color-gold)",
                          boxShadow: "var(--shadow-gold)",
                        }
                      : {}
                  }
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2"
                      style={{
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #C9A227, #E8C547)",
                        color: "#000",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        padding: "4px 14px",
                        borderRadius: "100px",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display font-bold text-xl mb-1" style={{ color: "var(--color-text)" }}>
                      {plan.name}
                    </h3>
                    <div className="flex items-end gap-1 mt-3">
                      <span className="font-display font-bold text-3xl" style={{ color: plan.popular ? "var(--color-gold)" : "var(--color-text)" }}>
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>/website</span>
                      )}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      <span>⏱ {plan.delivery}</span>
                      <span>🛡 {plan.support}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        <span style={{ color: "var(--color-gold)", flexShrink: 0, marginTop: "2px" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`https://wa.me/919942000413?text=Namaste! Mujhe ${name} mein ${plan.name} plan chahiye. Please details share karein.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={plan.popular ? "btn-gold text-center text-sm font-bold" : "btn-outline text-center text-sm"}
                  >
                    {plan.price === "Custom" ? "Quote Lein" : "Abhi Start Karein"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Process ── */}
        <section className="py-16 md:py-20" style={{ background: "var(--color-bg)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge">Humara Process</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                Website banwana hai? <span className="text-gold-gradient">Itna simple hai</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Contact Karein", desc: `WhatsApp ya call se ${name} team se baat karein. Free consultation milegi.` },
                { step: "02", title: "Design Approve Karein", desc: "Hum aapko 2-3 design options denge. Aap select karein, changes batayein." },
                { step: "03", title: "Development", desc: "Approved design ke baad 3-5 din mein aapki website ready ho jaayegi." },
                { step: "04", title: "Launch & Support", desc: "Website live! Aur hum 30-90 din tak free support denge." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl mx-auto mb-4"
                    style={{
                      background: "linear-gradient(135deg, rgba(201,162,39,0.15), rgba(201,162,39,0.05))",
                      border: "1px solid rgba(201,162,39,0.3)",
                      color: "var(--color-gold)",
                    }}
                  >
                    {step}
                  </div>
                  <h3 className="font-display font-bold text-base mb-2" style={{ color: "var(--color-text)" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-20" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="section-badge">FAQ</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {name} ke clients ke <span className="text-gold-gradient">common sawaal</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="card p-6"
                >
                  <h3 className="font-semibold text-base mb-2" style={{ color: "var(--color-text)" }}>
                    {q}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Other Cities ── */}
        <section className="py-14 md:py-16" style={{ background: "var(--color-bg)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold mb-5" style={{ color: "var(--color-text-muted)" }}>
              Hum in cities mein bhi serve karte hain:
            </p>
            <div className="flex flex-wrap gap-2">
              {CITY_SLUGS.filter((c) => c !== city).map((c) => (
                <Link
                  key={c}
                  href={`/city/${c}`}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                  }}
                >
                  {CITY_DATA[c].name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-20 md:py-24"
          style={{
            background: "linear-gradient(135deg, var(--color-navy) 0%, #1a2744 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-60px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="section-badge mb-6" style={{ background: "rgba(201,162,39,0.12)", borderColor: "rgba(201,162,39,0.4)", color: "var(--color-gold)" }}>
              {name} mein Ready?
            </div>

            <h2
              className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight"
              style={{ color: "#fff" }}
            >
              Apna {name} Business{" "}
              <span className="text-gold-gradient">Online Lao Aaj</span>
            </h2>

            <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              Free consultation lo. {name} ke liye best website plan samjho.
              Koi commitment nahi — sirf ek WhatsApp message.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`https://wa.me/919942000413?text=Namaste! Mujhe ${name} mein ek professional website chahiye. Aapka quote aur process samjhna hai.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-base px-8 py-4 font-bold"
              >
                WhatsApp pe Message Karein
              </Link>
              <Link
                href="tel:+919942000413"
                className="btn-outline text-base px-8 py-4"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                📞 +91 9942000413
              </Link>
            </div>

            <p className="mt-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              Monday – Saturday, 9am – 7pm IST &nbsp;|&nbsp; {name}, {state}
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
