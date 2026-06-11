"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Eye, ShoppingCart, Star, Loader2, CreditCard, Check } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

// ─── Template Data ────────────────────────────────────────────────────────────

type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  previewColor: string;
  tags: string[];
  popular: boolean;
};

const TEMPLATES: Template[] = [
  // Restaurant (6)
  {
    id: "spice-garden-restaurant",
    name: "Spice Garden",
    category: "Restaurant",
    description: "Full-featured restaurant website with online menu, table booking, and Razorpay food ordering.",
    price: 1499,
    previewColor: "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
    tags: ["Online Menu", "Table Booking", "WhatsApp Order"],
    popular: true,
  },
  {
    id: "biryani-house-restaurant",
    name: "Biryani House",
    category: "Restaurant",
    description: "Vibrant biryani restaurant template with photo gallery, delivery zones, and customer reviews.",
    price: 1299,
    previewColor: "linear-gradient(135deg, #E65C00 0%, #F9D423 100%)",
    tags: ["Menu Gallery", "Delivery Zones", "Reviews"],
    popular: false,
  },
  {
    id: "swad-dhaba-restaurant",
    name: "Swad Dhaba",
    category: "Restaurant",
    description: "Rustic dhaba-style template with daily thali menu, catering enquiry, and loyalty card system.",
    price: 999,
    previewColor: "linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)",
    tags: ["Daily Menu", "Catering", "Loyalty"],
    popular: false,
  },
  {
    id: "punjabi-tadka-restaurant",
    name: "Punjabi Tadka",
    category: "Restaurant",
    description: "Bold Punjabi restaurant template with live counter display, party booking, and social feeds.",
    price: 1799,
    previewColor: "linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)",
    tags: ["Party Booking", "Live Counter", "Social Feed"],
    popular: true,
  },
  {
    id: "south-spice-restaurant",
    name: "South Spice",
    category: "Restaurant",
    description: "South Indian cuisine template with filter-based menu, combo deals, and home delivery.",
    price: 1299,
    previewColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    tags: ["Filter Menu", "Combo Deals", "Home Delivery"],
    popular: false,
  },
  {
    id: "cafe-aroma-restaurant",
    name: "Cafe Aroma",
    category: "Restaurant",
    description: "Modern cafe template with coffee subscription, loyalty points, seasonal specials, and WiFi passcode.",
    price: 1499,
    previewColor: "linear-gradient(135deg, #6f4e37 0%, #c9956c 100%)",
    tags: ["Coffee Subs", "Loyalty Points", "Seasonal Menu"],
    popular: false,
  },

  // School (5)
  {
    id: "sunrise-school-school",
    name: "Sunrise School",
    category: "School",
    description: "Complete school website with admission forms, fee payment, result portal, and parent login.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #1a6b3c 0%, #2ecc71 100%)",
    tags: ["Admissions", "Fee Payment", "Parent Login"],
    popular: true,
  },
  {
    id: "gyandeep-academy-school",
    name: "Gyandeep Academy",
    category: "School",
    description: "CBSE school template with e-learning, homework portal, online PTM booking, and attendance tracker.",
    price: 3499,
    previewColor: "linear-gradient(135deg, #0052D4 0%, #65C7F7 100%)",
    tags: ["E-Learning", "PTM Booking", "Attendance"],
    popular: false,
  },
  {
    id: "bright-future-school-school",
    name: "Bright Future School",
    category: "School",
    description: "ICSE school template with syllabus upload, notice board, digital library, and transport tracking.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #1CB5E0 0%, #000046 100%)",
    tags: ["Notice Board", "Digital Library", "Transport"],
    popular: false,
  },
  {
    id: "saraswati-vidyalaya-school",
    name: "Saraswati Vidyalaya",
    category: "School",
    description: "Traditional school template with multilingual support, scholarship info, and alumni network.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
    tags: ["Multilingual", "Scholarship", "Alumni"],
    popular: false,
  },
  {
    id: "new-era-coaching-school",
    name: "New Era Coaching",
    category: "School",
    description: "Coaching institute template with batch management, test series, video classes, and rank list.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #373B44 0%, #4286f4 100%)",
    tags: ["Batch Mgmt", "Test Series", "Video Classes"],
    popular: true,
  },

  // Hospital (4)
  {
    id: "lifecare-hospital-hospital",
    name: "LifeCare Hospital",
    category: "Hospital",
    description: "Multi-speciality hospital website with OPD booking, doctor profiles, lab reports, and ambulance.",
    price: 4999,
    previewColor: "linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)",
    tags: ["OPD Booking", "Doctor Profiles", "Lab Reports"],
    popular: true,
  },
  {
    id: "healing-touch-clinic-hospital",
    name: "Healing Touch Clinic",
    category: "Hospital",
    description: "General clinic template with online appointment, prescription history, and insurance integration.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)",
    tags: ["Appointments", "Prescriptions", "Insurance"],
    popular: false,
  },
  {
    id: "disha-dental-hospital",
    name: "Disha Dental Care",
    category: "Hospital",
    description: "Dental clinic template with treatment gallery, before-after photos, EMI calculator, and booking.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
    tags: ["Before-After", "EMI Calc", "Booking"],
    popular: false,
  },
  {
    id: "maa-ayurveda-hospital",
    name: "Maa Ayurveda",
    category: "Hospital",
    description: "Ayurvedic wellness centre template with treatment packages, prakriti quiz, and retreat booking.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #4e8c2a 0%, #a8e6cf 100%)",
    tags: ["Prakriti Quiz", "Retreat Booking", "Packages"],
    popular: true,
  },

  // E-commerce (5)
  {
    id: "fashionwala-ecommerce",
    name: "FashionWala",
    category: "E-commerce",
    description: "Full-stack fashion store with size guide, wishlist, Razorpay checkout, and COD option.",
    price: 3999,
    previewColor: "linear-gradient(135deg, #6A3093 0%, #A044FF 100%)",
    tags: ["Size Guide", "Wishlist", "COD"],
    popular: true,
  },
  {
    id: "kirana-cart-ecommerce",
    name: "Kirana Cart",
    category: "E-commerce",
    description: "Grocery delivery platform with daily deals, slot-based delivery, and Paytm/UPI integration.",
    price: 3499,
    previewColor: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    tags: ["Slot Delivery", "Daily Deals", "UPI"],
    popular: false,
  },
  {
    id: "craftbazar-ecommerce",
    name: "CraftBazar",
    category: "E-commerce",
    description: "Handmade crafts marketplace with seller onboarding, custom orders, and shipping integration.",
    price: 4499,
    previewColor: "linear-gradient(135deg, #e96c4c 0%, #ffc371 100%)",
    tags: ["Marketplace", "Custom Orders", "Shipping"],
    popular: false,
  },
  {
    id: "jewels-of-india-ecommerce",
    name: "Jewels of India",
    category: "E-commerce",
    description: "Premium jewellery store with 360-degree view, gold rate widget, EMI checkout, and custom engraving.",
    price: 4999,
    previewColor: "linear-gradient(135deg, #B8860B 0%, #FFD700 100%)",
    tags: ["360° View", "Gold Rate", "Custom Engraving"],
    popular: true,
  },
  {
    id: "agrimart-ecommerce",
    name: "AgriMart",
    category: "E-commerce",
    description: "Farm-to-table store with freshness timer, bulk pricing, farmer profile, and state-wise delivery.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    tags: ["Freshness Timer", "Bulk Pricing", "Farm Profile"],
    popular: false,
  },

  // Real Estate (4)
  {
    id: "dream-homes-realestate",
    name: "Dream Homes",
    category: "Real Estate",
    description: "Property listing website with map view, EMI calculator, virtual tour, and lead capture forms.",
    price: 3499,
    previewColor: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
    tags: ["Map View", "EMI Calc", "Virtual Tour"],
    popular: true,
  },
  {
    id: "shree-properties-realestate",
    name: "Shree Properties",
    category: "Real Estate",
    description: "Builder website with project showcase, booking form, amenity list, and RERA compliance badge.",
    price: 3999,
    previewColor: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    tags: ["Project Showcase", "RERA Badge", "Booking"],
    popular: false,
  },
  {
    id: "urban-nests-realestate",
    name: "Urban Nests",
    category: "Real Estate",
    description: "Flat rental template with tenant verification portal, rent receipt generator, and maintenance tickets.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #1d4350 0%, #a43931 100%)",
    tags: ["Tenant Portal", "Rent Receipt", "Maintenance"],
    popular: false,
  },
  {
    id: "vastu-villas-realestate",
    name: "Vastu Villas",
    category: "Real Estate",
    description: "Villa/plot sales website with vastu score indicator, 3D floor plans, and site visit booking.",
    price: 4499,
    previewColor: "linear-gradient(135deg, #667db6 0%, #0082c8 50%, #0082c8 75%, #667db6 100%)",
    tags: ["Vastu Score", "3D Floor Plans", "Site Visit"],
    popular: true,
  },

  // Portfolio (4)
  {
    id: "creative-vibes-portfolio",
    name: "Creative Vibes",
    category: "Portfolio",
    description: "Designer portfolio with case studies, dribbble feed, client logos, and project inquiry form.",
    price: 999,
    previewColor: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
    tags: ["Case Studies", "Dribbble Feed", "Inquiry Form"],
    popular: false,
  },
  {
    id: "devfolio-portfolio",
    name: "DevFolio",
    category: "Portfolio",
    description: "Developer portfolio with GitHub stats, tech stack badges, live project demos, and resume download.",
    price: 1299,
    previewColor: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
    tags: ["GitHub Stats", "Live Demos", "Resume"],
    popular: true,
  },
  {
    id: "shutter-stories-portfolio",
    name: "Shutter Stories",
    category: "Portfolio",
    description: "Photographer portfolio with lightbox gallery, package comparison, client album login, and booking.",
    price: 1499,
    previewColor: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
    tags: ["Lightbox Gallery", "Albums", "Booking"],
    popular: false,
  },
  {
    id: "archi-studio-portfolio",
    name: "Archi Studio",
    category: "Portfolio",
    description: "Architect portfolio with project timeline, 3D render gallery, award badges, and consultation booking.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #373B44 0%, #4286f4 100%)",
    tags: ["3D Gallery", "Timeline", "Consultation"],
    popular: false,
  },

  // Gym (3)
  {
    id: "iron-nation-gym",
    name: "Iron Nation Gym",
    category: "Gym",
    description: "Gym website with membership plans, online payment, trainer profiles, BMI calculator, and class schedules.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #1a1a1a 0%, #b71c1c 100%)",
    tags: ["Membership", "BMI Calc", "Class Schedule"],
    popular: true,
  },
  {
    id: "zen-wellness-gym",
    name: "Zen Wellness",
    category: "Gym",
    description: "Yoga & wellness studio with session booking, retreat packages, instructor bios, and community blog.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #4ca1af 0%, #c4e0e5 100%)",
    tags: ["Session Booking", "Retreat Packages", "Blog"],
    popular: false,
  },
  {
    id: "fitzone-gym",
    name: "FitZone",
    category: "Gym",
    description: "CrossFit gym template with workout of the day, leaderboard, nutrition tracker, and progress photos.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #f79d00 0%, #64f38c 100%)",
    tags: ["WOD Board", "Leaderboard", "Nutrition"],
    popular: false,
  },

  // Hotel (4)
  {
    id: "royal-inn-hotel",
    name: "Royal Inn",
    category: "Hotel",
    description: "Boutique hotel website with real-time room booking, seasonal rates, spa packages, and photo tours.",
    price: 3999,
    previewColor: "linear-gradient(135deg, #C9A227 0%, #A07A10 100%)",
    tags: ["Room Booking", "Seasonal Rates", "Spa"],
    popular: true,
  },
  {
    id: "hillview-resort-hotel",
    name: "HillView Resort",
    category: "Hotel",
    description: "Hill station resort template with activity booking, weather widget, group packages, and feedback.",
    price: 3499,
    previewColor: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    tags: ["Activity Booking", "Group Packages", "Weather"],
    popular: false,
  },
  {
    id: "city-lodge-hotel",
    name: "City Lodge",
    category: "Hotel",
    description: "Budget hotel chain template with multi-property support, loyalty rewards, and OTA rate comparison.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    tags: ["Multi-Property", "Loyalty Rewards", "Rate Comp"],
    popular: false,
  },
  {
    id: "dharamshala-stay-hotel",
    name: "Dharamshala Stay",
    category: "Hotel",
    description: "Pilgrimage/religious stay template with puja booking, darshan schedule, prasad delivery, and donation.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    tags: ["Puja Booking", "Darshan", "Donation"],
    popular: true,
  },

  // Salon (3)
  {
    id: "glamour-touch-salon",
    name: "Glamour Touch",
    category: "Salon",
    description: "Unisex salon with appointment booking, stylist selection, loyalty rewards, and membership cards.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
    tags: ["Appointment", "Stylist Pick", "Membership"],
    popular: true,
  },
  {
    id: "urban-glow-salon",
    name: "Urban Glow",
    category: "Salon",
    description: "Premium beauty salon with service menu, before-after gallery, bridal packages, and gift vouchers.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #c79081 0%, #dfa579 100%)",
    tags: ["Bridal Pkgs", "Gift Vouchers", "Gallery"],
    popular: false,
  },
  {
    id: "barber-bros-salon",
    name: "Barber Bros",
    category: "Salon",
    description: "Men's grooming salon with walk-in queue display, barber selection, style lookbook, and combo deals.",
    price: 1299,
    previewColor: "linear-gradient(135deg, #373B44 0%, #4286f4 100%)",
    tags: ["Queue Display", "Barber Pick", "Lookbook"],
    popular: false,
  },

  // Medical (3)
  {
    id: "meditest-labs-medical",
    name: "MediTest Labs",
    category: "Medical",
    description: "Diagnostic lab website with home sample collection, online report download, and health packages.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    tags: ["Home Collection", "Online Reports", "Packages"],
    popular: true,
  },
  {
    id: "happy-smile-medical",
    name: "Happy Smile",
    category: "Medical",
    description: "Paediatric clinic template with growth tracker, vaccination schedule, parent handbook, and tele-consult.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    tags: ["Growth Tracker", "Vaccination", "Tele-Consult"],
    popular: false,
  },
  {
    id: "vision-plus-medical",
    name: "Vision Plus Eye Care",
    category: "Medical",
    description: "Eye care clinic with online eye test simulator, spectacle try-on, lens order, and appointment.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #0082c8 0%, #00b4db 100%)",
    tags: ["Eye Test", "Try-On", "Lens Order"],
    popular: false,
  },

  // NGO (3)
  {
    id: "green-earth-ngo",
    name: "Green Earth Foundation",
    category: "NGO",
    description: "Environmental NGO template with campaign pages, volunteer registration, donation gateway, and impact stats.",
    price: 1499,
    previewColor: "linear-gradient(135deg, #1a6b3c 0%, #2ecc71 100%)",
    tags: ["Campaigns", "Donations", "Volunteer Reg"],
    popular: true,
  },
  {
    id: "bal-vikas-ngo",
    name: "Bal Vikas Trust",
    category: "NGO",
    description: "Child welfare NGO with sponsor-a-child feature, success stories, 80G tax receipt, and event calendar.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    tags: ["Sponsor-a-Child", "80G Receipt", "Events"],
    popular: false,
  },
  {
    id: "prabhat-help-ngo",
    name: "Prabhat Help Society",
    category: "NGO",
    description: "Rural welfare NGO with multi-language support, project reports, donor dashboard, and transparency meter.",
    price: 1299,
    previewColor: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    tags: ["Multi-Language", "Donor Dashboard", "Reports"],
    popular: false,
  },

  // Lawyer (3)
  {
    id: "justice-law-lawyer",
    name: "Justice Law Firm",
    category: "Lawyer",
    description: "Law firm website with practice area pages, attorney profiles, case enquiry form, and blog section.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    tags: ["Practice Areas", "Attorney Profiles", "Blog"],
    popular: true,
  },
  {
    id: "counsel-first-lawyer",
    name: "Counsel First",
    category: "Lawyer",
    description: "Solo advocate template with free consultation booking, document checklist, testimonials, and video intro.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #4e4376 0%, #2b5876 100%)",
    tags: ["Free Consult", "Doc Checklist", "Video Intro"],
    popular: false,
  },
  {
    id: "lex-india-lawyer",
    name: "Lex India Associates",
    category: "Lawyer",
    description: "Corporate law firm with multilingual client portal, encrypted document vault, and billing dashboard.",
    price: 3999,
    previewColor: "linear-gradient(135deg, #1d4350 0%, #a43931 100%)",
    tags: ["Client Portal", "Doc Vault", "Billing"],
    popular: false,
  },

  // Additional mixed to reach 50
  {
    id: "event-wala-event",
    name: "EventWala",
    category: "Other",
    description: "Event management website with RSVP, seat selection, sponsor showcase, and photo album sharing.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
    tags: ["RSVP", "Seat Selection", "Sponsors"],
    popular: true,
  },
  {
    id: "travel-sutra-travel",
    name: "Travel Sutra",
    category: "Other",
    description: "Travel agency template with package browsing, itinerary builder, visa guidance, and trip reviews.",
    price: 2999,
    previewColor: "linear-gradient(135deg, #0575E6 0%, #021B79 100%)",
    tags: ["Packages", "Itinerary", "Visa Guide"],
    popular: false,
  },
  {
    id: "tutor-hub-education",
    name: "TutorHub",
    category: "Other",
    description: "Online tutoring platform with tutor listing, slot booking, live class link, and payment.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #0052D4 0%, #65C7F7 100%)",
    tags: ["Tutor Listing", "Slot Booking", "Live Class"],
    popular: false,
  },
  {
    id: "auto-workshop-auto",
    name: "AutoFix Workshop",
    category: "Other",
    description: "Car repair workshop with service booking, vehicle history, job card system, and spare parts store.",
    price: 1999,
    previewColor: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
    tags: ["Service Booking", "Job Card", "Parts Store"],
    popular: true,
  },
  {
    id: "pharma-store-pharmacy",
    name: "MedPlus Store",
    category: "Other",
    description: "Medical store website with prescription upload, medicine search, home delivery, and health blog.",
    price: 2499,
    previewColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    tags: ["Rx Upload", "Medicine Search", "Home Delivery"],
    popular: false,
  },
];

// ─── Category filter tabs ─────────────────────────────────────────────────────

const FILTER_CATEGORIES = [
  "All",
  "Restaurant",
  "School",
  "Hospital",
  "E-commerce",
  "Real Estate",
  "Portfolio",
  "Gym",
  "Hotel",
  "Salon",
  "Medical",
  "NGO",
  "Lawyer",
  "Other",
];

// ─── Buy Modal ────────────────────────────────────────────────────────────────

type BuyModalProps = {
  template: Template;
  onClose: () => void;
};

function BuyModal({ template, onClose }: BuyModalProps) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [success, setSuccess] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError("");
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setPayError("Please fill in all fields.");
      return;
    }
    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPayError("Payment gateway failed to load. Please refresh and try again.");
        setPaying(false);
        return;
      }

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: template.price,
          productSlug: template.id,
          plan: "Template",
          ...form,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setPayError(orderData.error || "Could not create order. Please try again.");
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "KVL TECH",
        description: `${template.name} Template`,
        image: "/kvl-tech-logo-tight.png",
        prefill: { name: form.name, contact: form.phone, email: form.email },
        theme: { color: "#C9A227" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              productSlug: template.id,
              plan: "Template",
              amount: template.price,
              ...form,
            }),
          });
          if (verifyRes.ok) {
            setSuccess(true);
          } else {
            setPayError("Payment could not be verified. Please contact support.");
          }
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch {
      setPayError("Something went wrong. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.22 }}
        className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--color-border)] flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
              Buy Template
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {template.name} — <span className="text-[var(--color-gold)] font-semibold">₹{template.price.toLocaleString("en-IN")}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview strip */}
        <div className="h-14 w-full" style={{ background: template.previewColor }} />

        {/* Body */}
        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-green-600" />
              </div>
              <h4 className="font-display font-bold text-lg text-[var(--color-text)] mb-2">Payment Successful!</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Thank you! Our team will contact you within 24 hours with the template files and setup instructions.
              </p>
              <button
                onClick={onClose}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Ramesh Kumar"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all"
                />
              </div>

              {payError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  {payError}
                </p>
              )}

              <button
                type="submit"
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-[var(--color-navy)] font-display font-bold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {paying ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={16} /> Pay ₹{template.price.toLocaleString("en-IN")} Securely</>
                )}
              </button>
              <p className="text-center text-[10px] text-[var(--color-text-muted)]">
                Secured by Razorpay · UPI, Cards, Net Banking, Wallets
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onBuy,
  index,
}: {
  template: Template;
  onBuy: (t: Template) => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.6) }}
      className="card overflow-hidden group flex flex-col"
    >
      {/* Preview area */}
      <div
        className="relative h-44 flex-shrink-0 flex items-end overflow-hidden"
        style={{ background: template.previewColor }}
      >
        {/* Decorative circles */}
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute top-10 right-10 w-8 h-8 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-black/10" />

        {/* Popular badge */}
        {template.popular && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold shadow-lg">
            <Star size={10} fill="currentColor" />
            Popular
          </div>
        )}

        {/* Template name overlay */}
        <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="font-display font-bold text-white text-base leading-tight drop-shadow">
            {template.name}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category + price row */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
            {template.category}
          </span>
          <span className="font-display font-bold text-[var(--color-gold)] text-base">
            ₹{template.price.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 flex-1">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[9px] font-medium bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/templates/${template.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            <Eye size={13} />
            Preview
          </Link>
          <button
            onClick={() => onBuy(template)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-navy)] dark:bg-[var(--color-gold)] text-white dark:text-[var(--color-navy)] text-xs font-bold hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] dark:hover:bg-[var(--color-gold-dark)] transition-all"
          >
            <ShoppingCart size={13} />
            Buy ₹{template.price.toLocaleString("en-IN")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [buyTarget, setBuyTarget] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (activeCategory !== "All") {
      list = list.filter(t => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">

        {/* ── Hero ── */}
        <section className="py-16 bg-[var(--color-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--color-navy)]/5 blur-[80px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/kvl-tech-logo-tight.png"
                alt="KVL TECH"
                className="h-10 w-auto object-contain dark:hidden"
              />
              <img
                src="/kvl-tech-logo-white.png"
                alt="KVL TECH"
                className="h-10 w-auto object-contain hidden dark:block"
              />
            </div>
            <div className="section-badge mx-auto mb-4">Ready-Made Templates</div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] mb-4 leading-tight">
              Website{" "}
              <span className="text-gold-gradient">Templates</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto mb-8">
              50+ professional templates for every Indian business — starting at just{" "}
              <span className="text-[var(--color-gold)] font-semibold">₹999</span>.
              Buy once, customise fully, launch fast.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
              {[
                { value: "50+", label: "Templates" },
                { value: "12 Categories", label: "Industries" },
                { value: "₹999–₹4,999", label: "Price Range" },
                { value: "1–2 Days", label: "Delivery" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Search bar */}
            <div className="max-w-xl mx-auto relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates by name, category, or feature..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/20 transition-all shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Filters + Grid ── */}
        <section className="py-12 bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Category filter tabs */}
            <div className="flex items-center gap-2 flex-wrap mb-10 overflow-x-auto pb-1 scrollbar-hide">
              {FILTER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-[var(--color-navy)] text-white dark:bg-[var(--color-gold)] dark:text-[var(--color-navy)]"
                      : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 text-[10px] opacity-60">
                      ({TEMPLATES.filter(t => t.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {filtered.length === 0
                  ? "No templates found"
                  : `Showing ${filtered.length} template${filtered.length !== 1 ? "s" : ""}${activeCategory !== "All" ? ` in ${activeCategory}` : ""}`}
              </p>
              {(search || activeCategory !== "All") && (
                <button
                  onClick={() => { setSearch(""); setActiveCategory("All"); }}
                  className="text-xs text-[var(--color-gold)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Template grid */}
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={`${activeCategory}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filtered.map((template, i) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onBuy={setBuyTarget}
                      index={i}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">
                    No templates found
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                    Try a different search term or category.
                  </p>
                  <button
                    onClick={() => { setSearch(""); setActiveCategory("All"); }}
                    className="px-6 py-2.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-semibold text-sm hover:bg-[var(--color-gold-dark)] transition-colors"
                  >
                    View All Templates
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-16 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="section-badge mx-auto mb-4">Need Something Custom?</div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--color-text)] mb-4">
              Don't see what you need?
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 text-lg">
              We build fully custom websites tailored to your exact requirements. Get a free quote in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-gold)] text-[var(--color-navy)] font-display font-bold text-sm hover:bg-[var(--color-gold-dark)] transition-all shadow-[var(--shadow-gold)]"
              >
                Get Custom Quote
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold text-sm hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
              >
                View Pricing Plans
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />

      {/* ── Buy Modal ── */}
      <AnimatePresence>
        {buyTarget && (
          <BuyModal
            template={buyTarget}
            onClose={() => setBuyTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
