"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Download,
  Share2,
  Eye,
  Phone,
  MapPin,
  Type,
  Image as ImageIcon,
  ToggleLeft,
  ToggleRight,
  X,
  CreditCard,
  Check,
  Loader2,
  Palette,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: any;
  }
}

type FontOption = "modern" | "classic" | "bold";

interface CustomizationState {
  businessName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  font: FontOption;
  logoUrl: string | null;
  phone: string;
  address: string;
  showGallery: boolean;
  showTestimonials: boolean;
  showContactForm: boolean;
  showMap: boolean;
}

// ─── Template Data ────────────────────────────────────────────────────────────

const TEMPLATE_MAP: Record<string, { name: string; price: number; category: string }> = {
  "spice-garden-restaurant": { name: "Spice Garden", price: 1499, category: "Restaurant" },
  "biryani-house-restaurant": { name: "Biryani House", price: 1299, category: "Restaurant" },
  "swad-dhaba-restaurant": { name: "Swad Dhaba", price: 999, category: "Restaurant" },
  "punjabi-tadka-restaurant": { name: "Punjabi Tadka", price: 1799, category: "Restaurant" },
  "south-spice-restaurant": { name: "South Spice", price: 1299, category: "Restaurant" },
  "cafe-aroma-restaurant": { name: "Cafe Aroma", price: 1499, category: "Restaurant" },
  "sunrise-school-school": { name: "Sunrise School", price: 2999, category: "School" },
  "gyandeep-academy-school": { name: "Gyandeep Academy", price: 3499, category: "School" },
  "bright-future-school-school": { name: "Bright Future School", price: 2499, category: "School" },
  "saraswati-vidyalaya-school": { name: "Saraswati Vidyalaya", price: 1999, category: "School" },
  "new-era-coaching-school": { name: "New Era Coaching", price: 2999, category: "School" },
  "royal-inn-hotel": { name: "Royal Inn", price: 3999, category: "Hotel" },
  "hillview-resort-hotel": { name: "HillView Resort", price: 3499, category: "Hotel" },
  "city-lodge-hotel": { name: "City Lodge", price: 2999, category: "Hotel" },
};

const FONT_OPTIONS: { value: FontOption; label: string; preview: string }[] = [
  { value: "modern", label: "Modern", preview: "Inter, sans-serif" },
  { value: "classic", label: "Classic", preview: "Georgia, serif" },
  { value: "bold", label: "Bold", preview: "Impact, sans-serif" },
];

const FONT_CSS: Record<FontOption, string> = {
  modern: "font-family: 'Inter', Arial, sans-serif;",
  classic: "font-family: Georgia, 'Times New Roman', serif;",
  bold: "font-family: Impact, 'Arial Black', sans-serif;",
};

// ─── Razorpay Loader ──────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── HTML Generator ───────────────────────────────────────────────────────────

function generateHTML(state: CustomizationState, templateName: string): string {
  const fontFamily =
    state.font === "modern"
      ? "'Inter', Arial, sans-serif"
      : state.font === "classic"
      ? "Georgia, 'Times New Roman', serif"
      : "Impact, 'Arial Black', sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${state.businessName || "My Business"}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${fontFamily}; color: #1a1a2e; background: #fff; }
    a { text-decoration: none; color: inherit; }

    /* Navbar */
    nav {
      background: ${state.primaryColor};
      color: #fff;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }
    .nav-brand { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.5px; }
    .nav-links { display: flex; gap: 1.5rem; font-size: 0.95rem; opacity: 0.92; }
    .nav-links a:hover { opacity: 0.7; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, ${state.primaryColor} 0%, ${state.secondaryColor} 100%);
      color: #fff;
      padding: 6rem 2rem;
      text-align: center;
      min-height: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .hero h1 { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; }
    .hero p { font-size: 1.3rem; opacity: 0.9; max-width: 600px; margin: 0 auto 2rem; }
    .hero-btn {
      background: #fff;
      color: ${state.primaryColor};
      padding: 0.85rem 2rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1rem;
      display: inline-block;
      transition: transform 0.2s;
    }
    .hero-btn:hover { transform: translateY(-2px); }

    /* Services */
    .services { padding: 4rem 2rem; background: #f8f9fb; }
    .services h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: ${state.primaryColor}; }
    .services-sub { text-align: center; color: #666; margin-bottom: 2.5rem; }
    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; max-width: 960px; margin: 0 auto; }
    .service-card {
      background: #fff;
      border-radius: 12px;
      padding: 2rem 1.5rem;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      border-top: 4px solid ${state.primaryColor};
    }
    .service-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .service-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    .service-card p { font-size: 0.9rem; color: #666; }

    ${state.showGallery ? `
    /* Gallery */
    .gallery { padding: 4rem 2rem; }
    .gallery h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: ${state.primaryColor}; }
    .gallery-sub { text-align: center; color: #666; margin-bottom: 2.5rem; }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; max-width: 960px; margin: 0 auto; }
    .gallery-item {
      background: linear-gradient(135deg, ${state.primaryColor}22, ${state.secondaryColor}33);
      border-radius: 10px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: ${state.primaryColor};
    }
    ` : ""}

    ${state.showTestimonials ? `
    /* Testimonials */
    .testimonials { padding: 4rem 2rem; background: #f8f9fb; }
    .testimonials h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: ${state.primaryColor}; }
    .testimonials-sub { text-align: center; color: #666; margin-bottom: 2.5rem; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; max-width: 900px; margin: 0 auto; }
    .testimonial-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .stars { color: #f59e0b; margin-bottom: 0.75rem; font-size: 1.1rem; }
    .testimonial-card p { color: #444; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; }
    .testimonial-author { font-weight: 700; color: ${state.primaryColor}; font-size: 0.9rem; }
    ` : ""}

    ${state.showContactForm ? `
    /* Contact Form */
    .contact-form-section { padding: 4rem 2rem; }
    .contact-form-section h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: ${state.primaryColor}; }
    .contact-form-sub { text-align: center; color: #666; margin-bottom: 2.5rem; }
    form { max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
    input, textarea { width: 100%; padding: 0.85rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
    input:focus, textarea:focus { border-color: ${state.primaryColor}; }
    textarea { resize: vertical; min-height: 120px; }
    .submit-btn { background: ${state.primaryColor}; color: #fff; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; }
    .submit-btn:hover { opacity: 0.88; }
    ` : ""}

    /* Contact */
    .contact { padding: 4rem 2rem; background: linear-gradient(135deg, ${state.primaryColor}11, ${state.secondaryColor}11); }
    .contact h2 { text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; color: ${state.primaryColor}; }
    .contact-sub { text-align: center; color: #666; margin-bottom: 2.5rem; }
    .contact-info { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; max-width: 700px; margin: 0 auto; }
    .contact-item { background: #fff; border-radius: 10px; padding: 1.25rem 1.75rem; box-shadow: 0 2px 10px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 0.75rem; }
    .contact-icon { font-size: 1.3rem; }
    .contact-detail strong { display: block; font-size: 0.85rem; color: #888; margin-bottom: 0.2rem; }
    .contact-detail span { font-weight: 600; color: #1a1a2e; }

    ${state.showMap ? `
    /* Map Placeholder */
    .map-section { padding: 0 2rem 4rem; }
    .map-placeholder {
      max-width: 900px;
      margin: 0 auto;
      height: 280px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${state.primaryColor}22, ${state.secondaryColor}22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      color: ${state.primaryColor};
      font-weight: 600;
      border: 2px dashed ${state.primaryColor}44;
    }
    ` : ""}

    /* Footer */
    footer {
      background: ${state.primaryColor};
      color: #fff;
      text-align: center;
      padding: 2rem;
      font-size: 0.9rem;
      opacity: 0.95;
    }

    @media (max-width: 640px) {
      .hero h1 { font-size: 2rem; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <nav>
    <div class="nav-brand">${state.businessName || "My Business"}</div>
    <div class="nav-links">
      <a href="#services">Services</a>
      ${state.showGallery ? '<a href="#gallery">Gallery</a>' : ""}
      ${state.showTestimonials ? '<a href="#testimonials">Reviews</a>' : ""}
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <h1>${state.businessName || "Your Business Name"}</h1>
    <p>${state.tagline || "Your tagline goes here — make it memorable and compelling."}</p>
    <a href="#contact" class="hero-btn">Get In Touch</a>
  </section>

  <!-- Services -->
  <section class="services" id="services">
    <h2>Our Services</h2>
    <p class="services-sub">Everything you need, all in one place</p>
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon">⭐</div>
        <h3>Premium Quality</h3>
        <p>Top-tier products and services crafted with care and expertise.</p>
      </div>
      <div class="service-card">
        <div class="service-icon">⚡</div>
        <h3>Fast Delivery</h3>
        <p>Quick turnaround times without compromising on quality.</p>
      </div>
      <div class="service-card">
        <div class="service-icon">🤝</div>
        <h3>Trusted Support</h3>
        <p>Reliable customer support whenever you need assistance.</p>
      </div>
      <div class="service-card">
        <div class="service-icon">💎</div>
        <h3>Best Value</h3>
        <p>Competitive pricing with maximum value for your money.</p>
      </div>
    </div>
  </section>

  ${state.showGallery ? `
  <!-- Gallery -->
  <section class="gallery" id="gallery">
    <h2>Gallery</h2>
    <p class="gallery-sub">A glimpse of our work and products</p>
    <div class="gallery-grid">
      <div class="gallery-item">📷</div>
      <div class="gallery-item">🖼️</div>
      <div class="gallery-item">🎨</div>
      <div class="gallery-item">📸</div>
      <div class="gallery-item">🌟</div>
      <div class="gallery-item">✨</div>
    </div>
  </section>
  ` : ""}

  ${state.showTestimonials ? `
  <!-- Testimonials -->
  <section class="testimonials" id="testimonials">
    <h2>What Our Customers Say</h2>
    <p class="testimonials-sub">Trusted by hundreds of happy customers</p>
    <div class="testimonials-grid">
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"Absolutely fantastic service! Highly recommend to everyone."</p>
        <div class="testimonial-author">— Priya S.</div>
      </div>
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"Best in the business. Quick, reliable, and great quality."</p>
        <div class="testimonial-author">— Rahul M.</div>
      </div>
      <div class="testimonial-card">
        <div class="stars">★★★★★</div>
        <p>"I've been a customer for 2 years and never disappointed."</p>
        <div class="testimonial-author">— Anita K.</div>
      </div>
    </div>
  </section>
  ` : ""}

  ${state.showContactForm ? `
  <!-- Contact Form -->
  <section class="contact-form-section" id="contact-form">
    <h2>Send Us a Message</h2>
    <p class="contact-form-sub">We'll get back to you within 24 hours</p>
    <form onsubmit="event.preventDefault(); alert('Message sent! We will contact you soon.');">
      <input type="text" placeholder="Your Name" required />
      <input type="email" placeholder="Your Email" required />
      <input type="tel" placeholder="Your Phone Number" />
      <textarea placeholder="Your message..."></textarea>
      <button type="submit" class="submit-btn">Send Message</button>
    </form>
  </section>
  ` : ""}

  <!-- Contact -->
  <section class="contact" id="contact">
    <h2>Contact Us</h2>
    <p class="contact-sub">We'd love to hear from you</p>
    <div class="contact-info">
      ${state.phone ? `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <div class="contact-detail">
          <strong>Phone</strong>
          <span>${state.phone}</span>
        </div>
      </div>` : ""}
      ${state.address ? `
      <div class="contact-item">
        <span class="contact-icon">📍</span>
        <div class="contact-detail">
          <strong>Address</strong>
          <span>${state.address.replace(/\n/g, ", ")}</span>
        </div>
      </div>` : ""}
    </div>
  </section>

  ${state.showMap ? `
  <!-- Map -->
  <section class="map-section">
    <div class="map-placeholder">
      📍 Google Map — Embed your location here
    </div>
  </section>
  ` : ""}

  <!-- Footer -->
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${state.businessName || "My Business"}. All rights reserved.</p>
    <p style="margin-top:0.5rem;font-size:0.8rem;opacity:0.75;">Built with KVL TECH · kvlbusinesssolutions.com</p>
  </footer>

</body>
</html>`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border transition-all ${
        value
          ? "border-violet-500 bg-violet-500/10 text-violet-300"
          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <div
        className={`w-9 h-5 rounded-full relative transition-colors ${
          value ? "bg-violet-500" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

function LivePreview({ state, font }: { state: CustomizationState; font: string }) {
  const fontFamily =
    state.font === "modern"
      ? "Inter, Arial, sans-serif"
      : state.font === "classic"
      ? "Georgia, serif"
      : "Impact, sans-serif";

  return (
    <div
      className="w-full h-full overflow-y-auto rounded-xl border border-white/10 bg-white"
      style={{ fontFamily }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 shadow-md"
        style={{ background: state.primaryColor }}
      >
        <div className="text-white font-bold text-lg">
          {state.businessName || "Your Business"}
        </div>
        <div className="hidden sm:flex items-center gap-5 text-white/90 text-sm">
          <span>Services</span>
          {state.showGallery && <span>Gallery</span>}
          {state.showTestimonials && <span>Reviews</span>}
          <span>Contact</span>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-20 min-h-[280px]"
        style={{
          background: `linear-gradient(135deg, ${state.primaryColor} 0%, ${state.secondaryColor} 100%)`,
        }}
      >
        <h1 className="text-3xl font-extrabold text-white mb-3">
          {state.businessName || "Your Business Name"}
        </h1>
        <p className="text-white/90 text-base max-w-md mb-6">
          {state.tagline || "Your tagline goes here — compelling and memorable."}
        </p>
        <button
          className="px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: "#fff", color: state.primaryColor }}
        >
          Get In Touch
        </button>
      </section>

      {/* Services */}
      <section className="px-6 py-12 bg-gray-50">
        <h2
          className="text-center text-xl font-bold mb-1"
          style={{ color: state.primaryColor }}
        >
          Our Services
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">Everything you need in one place</p>
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {[
            { icon: "⭐", title: "Premium Quality", desc: "Top-tier products crafted with expertise." },
            { icon: "⚡", title: "Fast Delivery", desc: "Quick turnaround without compromising quality." },
            { icon: "🤝", title: "Trusted Support", desc: "Reliable support whenever you need it." },
            { icon: "💎", title: "Best Value", desc: "Competitive pricing, maximum value." },
          ].map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-xl p-4 shadow-sm text-center"
              style={{ borderTop: `3px solid ${state.primaryColor}` }}
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{s.title}</div>
              <div className="text-gray-500 text-xs mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <AnimatePresence>
        {state.showGallery && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-10"
          >
            <h2 className="text-center text-xl font-bold mb-1" style={{ color: state.primaryColor }}>
              Gallery
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">A glimpse of our work</p>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
              {["📷", "🖼️", "🎨", "📸", "🌟", "✨"].map((icon, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${state.primaryColor}22, ${state.secondaryColor}33)`,
                    border: `1px solid ${state.primaryColor}33`,
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Testimonials */}
      <AnimatePresence>
        {state.showTestimonials && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-10 bg-gray-50"
          >
            <h2 className="text-center text-xl font-bold mb-1" style={{ color: state.primaryColor }}>
              Customer Reviews
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">Trusted by hundreds</p>
            <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
              {[
                { text: "Absolutely fantastic service! Highly recommend.", author: "Priya S." },
                { text: "Best in the business. Quick, reliable, great quality.", author: "Rahul M." },
              ].map((t) => (
                <div key={t.author} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-2">"{t.text}"</p>
                  <div className="font-semibold text-sm" style={{ color: state.primaryColor }}>
                    — {t.author}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Contact Form */}
      <AnimatePresence>
        {state.showContactForm && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-10"
          >
            <h2 className="text-center text-xl font-bold mb-1" style={{ color: state.primaryColor }}>
              Send Us a Message
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">We reply within 24 hours</p>
            <div className="max-w-sm mx-auto space-y-3">
              <input
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"
                placeholder="Your Name"
                readOnly
              />
              <input
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none"
                placeholder="Your Email"
                readOnly
              />
              <textarea
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none resize-none"
                placeholder="Your message..."
                rows={3}
                readOnly
              />
              <button
                className="w-full py-2.5 rounded-lg text-white font-bold text-sm"
                style={{ background: state.primaryColor }}
              >
                Send Message
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Contact Info */}
      <section
        className="px-6 py-10"
        style={{
          background: `linear-gradient(135deg, ${state.primaryColor}11, ${state.secondaryColor}11)`,
        }}
      >
        <h2 className="text-center text-xl font-bold mb-1" style={{ color: state.primaryColor }}>
          Contact Us
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">We'd love to hear from you</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {state.phone && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-lg">📞</span>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-semibold text-gray-800 text-sm">{state.phone}</div>
              </div>
            </div>
          )}
          {state.address && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm">
              <span className="text-lg">📍</span>
              <div>
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-semibold text-gray-800 text-sm whitespace-pre-line">
                  {state.address}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <AnimatePresence>
        {state.showMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-10"
          >
            <div
              className="w-full h-32 rounded-xl flex items-center justify-center text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${state.primaryColor}22, ${state.secondaryColor}22)`,
                border: `2px dashed ${state.primaryColor}44`,
                color: state.primaryColor,
              }}
            >
              📍 Google Map Embed
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className="px-6 py-6 text-center text-white text-sm"
        style={{ background: state.primaryColor }}
      >
        <p className="font-medium">
          &copy; {new Date().getFullYear()} {state.businessName || "My Business"}
        </p>
        <p className="text-white/70 text-xs mt-1">Built with KVL TECH</p>
      </footer>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({
  templateName,
  price,
  onClose,
  onSuccess,
}: {
  templateName: string;
  price: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Payment system failed to load. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: price * 100,
        currency: "INR",
        name: "KVL TECH",
        description: `${templateName} Template`,
        image: "/logo.png",
        handler: function (response: any) {
          onSuccess();
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          template: templateName,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-sm bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <CreditCard size={20} className="text-violet-400" />
          </div>
          <div>
            <div className="font-bold text-white">Unlock This Template</div>
            <div className="text-gray-400 text-sm">{templateName}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Template License</span>
            <span className="text-white font-bold">₹{price.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>One-time payment</span>
            <span>Full source code included</span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {[
            "Complete HTML/CSS/JS source code",
            "All customizations included",
            "Lifetime access",
            "Free updates for 30 days",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <Check size={14} className="text-green-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-400 text-xs mb-4 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} />
              Pay ₹{price.toLocaleString("en-IN")} with Razorpay
            </>
          )}
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">
          Secured by Razorpay · SSL Encrypted
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TemplateBuilderPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? "");

  const templateInfo = TEMPLATE_MAP[id] ?? {
    name: id
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    price: 1999,
    category: "Business",
  };

  const [state, setState] = useState<CustomizationState>({
    businessName: templateInfo.name,
    tagline: `Premium ${templateInfo.category} Services — Excellence in Every Detail`,
    primaryColor: "#7c3aed",
    secondaryColor: "#4f46e5",
    font: "modern",
    logoUrl: null,
    phone: "+91 98765 43210",
    address: "123 Main Street\nMumbai, MH 400001",
    showGallery: true,
    showTestimonials: true,
    showContactForm: false,
    showMap: true,
  });

  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"export" | "download" | null>(null);
  const [hasPaid, setHasPaid] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const paid = JSON.parse(localStorage.getItem("kvl_paid_templates") || "{}");
      return !!paid[id];
    } catch {
      return false;
    }
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "brand" | "colors" | "content" | "sections"
  >("brand");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(<K extends keyof CustomizationState>(
    key: K,
    value: CustomizationState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const markPaid = () => {
    try {
      const paid = JSON.parse(localStorage.getItem("kvl_paid_templates") || "{}");
      paid[id] = true;
      localStorage.setItem("kvl_paid_templates", JSON.stringify(paid));
    } catch {}
    setHasPaid(true);
  };

  const handlePaymentSuccess = () => {
    markPaid();
    setShowPayModal(false);
    if (pendingAction === "download") {
      triggerDownload();
    } else if (pendingAction === "export") {
      triggerExport();
    }
    setPendingAction(null);
  };

  const triggerDownload = () => {
    const html = generateHTML(state, templateInfo.name);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}-kvltech.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerExport = () => {
    const html = generateHTML(state, templateInfo.name);
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleAction = (action: "export" | "download") => {
    if (hasPaid) {
      if (action === "download") triggerDownload();
      else triggerExport();
    } else {
      setPendingAction(action);
      setShowPayModal(true);
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(`kvl_draft_${id}`, JSON.stringify(state));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {}
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update("logoUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sectionTabs = [
    { key: "brand" as const, label: "Brand", icon: Type },
    { key: "colors" as const, label: "Colors", icon: Palette },
    { key: "content" as const, label: "Content", icon: MapPin },
    { key: "sections" as const, label: "Sections", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-[#070714] text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0a0a1a]/95 backdrop-blur border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10 shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-white truncate text-sm sm:text-base">
              {templateInfo.name}
            </div>
            <div className="text-gray-500 text-xs">{templateInfo.category} Template</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              saveSuccess
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
            }`}
          >
            {saveSuccess ? (
              <>
                <Check size={14} />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span className="hidden sm:inline">Save Draft</span>
              </>
            )}
          </button>

          {/* Export */}
          <button
            onClick={() => handleAction("export")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">
              {hasPaid ? "Export" : "Export"}
            </span>
            {!hasPaid && (
              <span className="text-xs bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full">
                Paid
              </span>
            )}
          </button>

          {/* Download */}
          <button
            onClick={() => handleAction("download")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white transition-all shadow-lg"
          >
            <Download size={14} />
            <span className="hidden sm:inline">
              {hasPaid ? "Download" : `₹${templateInfo.price.toLocaleString("en-IN")}`}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
        {/* LEFT PANEL — 30% */}
        <aside className="w-[30%] min-w-[240px] max-w-[340px] border-r border-white/10 bg-[#0a0a1a] flex flex-col overflow-hidden">
          {/* Section Tabs */}
          <div className="grid grid-cols-4 border-b border-white/10 shrink-0">
            {sectionTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${
                  activeSection === key
                    ? "text-violet-400 border-b-2 border-violet-500 bg-violet-500/5"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* BRAND */}
            {activeSection === "brand" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={state.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder="Enter your business name"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={state.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder="Your memorable tagline"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Font Style
                  </label>
                  <div className="space-y-2">
                    {FONT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => update("font", opt.value)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                          state.font === opt.value
                            ? "border-violet-500 bg-violet-500/10 text-violet-300"
                            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                        }`}
                      >
                        <span
                          className="font-medium text-sm"
                          style={{ fontFamily: opt.preview }}
                        >
                          {opt.label}
                        </span>
                        <span
                          className="text-xs opacity-60"
                          style={{ fontFamily: opt.preview }}
                        >
                          Aa Bb Cc
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Logo
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 rounded-lg border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-violet-500/50 transition-colors"
                  >
                    {state.logoUrl ? (
                      <img
                        src={state.logoUrl}
                        alt="Logo"
                        className="h-16 w-full object-contain rounded"
                      />
                    ) : (
                      <>
                        <ImageIcon size={18} className="text-gray-500" />
                        <span className="text-gray-600 text-xs">Click to upload logo</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  {state.logoUrl && (
                    <button
                      onClick={() => update("logoUrl", null)}
                      className="text-xs text-red-400 mt-1 hover:text-red-300"
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* COLORS */}
            {activeSection === "colors" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-white/20 shrink-0"
                      style={{ background: state.primaryColor }}
                    />
                    <input
                      type="color"
                      value={state.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{state.primaryColor}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-white/20 shrink-0"
                      style={{ background: state.secondaryColor }}
                    />
                    <input
                      type="color"
                      value={state.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{state.secondaryColor}</div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Quick Palettes
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { primary: "#7c3aed", secondary: "#4f46e5" },
                      { primary: "#0ea5e9", secondary: "#0284c7" },
                      { primary: "#10b981", secondary: "#059669" },
                      { primary: "#f59e0b", secondary: "#d97706" },
                      { primary: "#ef4444", secondary: "#dc2626" },
                      { primary: "#ec4899", secondary: "#db2777" },
                      { primary: "#1a1a2e", secondary: "#16213e" },
                      { primary: "#ff6b35", secondary: "#f7931e" },
                    ].map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          update("primaryColor", p.primary);
                          update("secondaryColor", p.secondary);
                        }}
                        className="aspect-square rounded-lg border-2 border-white/10 hover:border-white/40 transition-colors"
                        style={{
                          background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`,
                        }}
                        title={p.primary}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Preview
                  </label>
                  <div
                    className="w-full h-16 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${state.primaryColor} 0%, ${state.secondaryColor} 100%)`,
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* CONTENT */}
            {activeSection === "content" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="tel"
                      value={state.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin
                      size={14}
                      className="absolute left-3 top-3 text-gray-500"
                    />
                    <textarea
                      value={state.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="123 Main Street&#10;City, State 400001"
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                  <div className="text-xs text-gray-500 mb-2 font-medium">Preview</div>
                  {state.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Phone size={12} className="text-violet-400" />
                      {state.phone}
                    </div>
                  )}
                  {state.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <MapPin size={12} className="text-violet-400 mt-0.5 shrink-0" />
                      <span className="whitespace-pre-line">{state.address}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTIONS */}
            {activeSection === "sections" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div className="text-xs text-gray-500 mb-3">
                  Toggle sections to show or hide them in the preview and final output.
                </div>

                {/* Always-on sections */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Always Visible
                  </div>
                  {["Navigation Bar", "Hero Section", "Services", "Contact Info", "Footer"].map(
                    (s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 border border-white/5 text-gray-500 text-sm"
                      >
                        <span>{s}</span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          On
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Optional sections */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                    Optional Sections
                  </div>
                  <SectionToggle
                    label="Photo Gallery"
                    value={state.showGallery}
                    onChange={(v) => update("showGallery", v)}
                  />
                  <SectionToggle
                    label="Testimonials"
                    value={state.showTestimonials}
                    onChange={(v) => update("showTestimonials", v)}
                  />
                  <SectionToggle
                    label="Contact Form"
                    value={state.showContactForm}
                    onChange={(v) => update("showContactForm", v)}
                  />
                  <SectionToggle
                    label="Location Map"
                    value={state.showMap}
                    onChange={(v) => update("showMap", v)}
                  />
                </div>

                <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <div className="text-xs text-violet-300 font-medium mb-1">
                    Active Sections
                  </div>
                  <div className="text-2xl font-bold text-violet-400">
                    {5 +
                      (state.showGallery ? 1 : 0) +
                      (state.showTestimonials ? 1 : 0) +
                      (state.showContactForm ? 1 : 0) +
                      (state.showMap ? 1 : 0)}
                  </div>
                  <div className="text-xs text-gray-500">sections in your website</div>
                </div>
              </motion.div>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL — 70% */}
        <main className="flex-1 bg-[#070714] flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a0a1a] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="ml-3 bg-white/5 border border-white/10 rounded-md px-3 py-1 text-xs text-gray-500 hidden sm:block">
                {state.businessName ? state.businessName.toLowerCase().replace(/\s+/g, "") : "mybusiness"}.com
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live Preview
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 overflow-hidden p-3">
            <LivePreview state={state} font={state.font} />
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayModal && (
          <PaymentModal
            templateName={templateInfo.name}
            price={templateInfo.price}
            onClose={() => {
              setShowPayModal(false);
              setPendingAction(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
