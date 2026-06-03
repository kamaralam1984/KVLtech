"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User, Tag, ArrowRight, MessageCircle, CheckCircle2, TrendingUp, Star } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  photo: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  content: { heading?: string; body: string; list?: string[] }[];
  result?: { label: string; value: string; color: string }[];
}

const POSTS: BlogPost[] = [
  {
    slug: "restaurant-website-online-orders",
    title: "Restaurant Website Se 300% Zyada Online Orders Kaise Milein",
    excerpt: "Ek simple restaurant website se Rajesh ne apne online orders 3x kar liye. Jaanein kaunsi features sabse zyada convert karti hain.",
    category: "Website Tips",
    photo: "/photos/restaurant.jpg",
    author: "Kavya Mehta",
    authorRole: "Head of Design",
    date: "Dec 28, 2024",
    readTime: "5 min",
    result: [
      { label: "Online Orders", value: "+300%", color: "#FF6B35" },
      { label: "Revenue Growth", value: "2X", color: "#16A34A" },
      { label: "Table Bookings", value: "+150%", color: "#0891B2" },
    ],
    content: [
      { body: "Mumbai ke Rajesh Kumar ke paas ek popular dhaba tha — lekin online orders bilkul nahi aate the. Sirf walk-in customers par depend karna padta tha. Tab unhone KVL TECH se apni restaurant website banvayi, aur 3 mahine mein sab kuch badal gaya." },
      { heading: "Problem Kya Thi?", body: "Zomato aur Swiggy pe 30–35% commission dena padta tha. Direct orders ke liye koi system nahi tha. Customers ko menu WhatsApp par bhejna padta tha.", list: ["High commission on food aggregators", "No direct ordering system", "No online table booking", "No brand identity online"] },
      { heading: "Solution: Premium Restaurant Website", body: "Humne Rajesh ke liye ek complete restaurant website banaya jisme yeh sab features the:" },
      { body: "Online ordering system with Razorpay integration. Real-time order tracking for customers. Table booking with date and time selection. WhatsApp integration for instant order confirmation. SEO-optimized menu pages for Google visibility.", list: ["Direct ordering — zero commission", "Automated WhatsApp order confirmation", "Loyalty program integration", "Google My Business sync", "Mobile-first design"] },
      { heading: "Results: 3 Mahine Mein", body: "Pehle mahine mein hi unhe 47 direct online orders mile. Agle 3 mahine mein yeh 300% badh gaya. Zomato-Swiggy par dependency 80% kam ho gayi. Monthly savings: approximately ₹45,000 commission ka." },
      { heading: "Aapke Liye Key Takeaways", body: "Agar aap bhi restaurant business mein hain, toh yeh features zaroor consider karein:", list: ["Online ordering system is must-have in 2025", "WhatsApp integration converts 3x better than email", "Fast loading menu pages rank better on Google", "Mobile-optimized design is non-negotiable"] },
    ],
  },
  {
    slug: "school-management-system-benefits",
    title: "School Management System: 80% Kam Kaam, 95% Zyada Satisfaction",
    excerpt: "Manual attendance, fee collection, exam results — sab ek jagah. Jaanein kaise school management software ne GreenValley School ko transform kiya.",
    category: "Software",
    photo: "/photos/school.jpg",
    author: "Amit Verma",
    authorRole: "Head of Sales",
    date: "Dec 25, 2024",
    readTime: "7 min",
    result: [
      { label: "Workload Reduction", value: "80%", color: "#16A34A" },
      { label: "Parent Satisfaction", value: "95%", color: "#0891B2" },
      { label: "Fee Collection", value: "99%", color: "#C9A227" },
    ],
    content: [
      { body: "GreenValley School, Delhi mein 2,000+ students hain. Pehle sab kuch manual tha — attendance registers, fee collection slips, result cards. Staff ka 60% time sirf paperwork mein jaata tha." },
      { heading: "Before: Manual Chaos", body: "Principal Sharma ji ek common problem face kar rahe the jo India ke lakho schools mein hai:", list: ["Daily attendance manually mark karna", "Fee defaulters track karna mushkil", "Parents ko result card distribute karna slow", "Exam schedule manage karna complex", "Staff payroll manually calculate karna"] },
      { heading: "After: KVL TECH School ERP", body: "Humne unke liye ek complete School Management System deploy kiya. Parent app se lekar fee gateway tak — sab integrated." },
      { body: "Features jo sabse zyada impact kiye:", list: ["Biometric attendance — teachers ke liye 2 minutes per class", "Online fee payment with auto reminders", "Parent app: real-time updates, attendance, results", "Automated exam schedule and hall tickets", "Digital report cards with WhatsApp delivery"] },
      { heading: "ROI Calculation", body: "5 admin staff ka 80% time free hua — yani 4 full-time employees ka equivalent. School ne yeh time counseling, parent meetings, aur extracurricular activities mein lagaya. Parents ki satisfaction 95% ho gayi because they could track everything in real-time." },
      { heading: "Implementation Timeline", body: "Hamare school ERP ki deployment 7-10 working days mein complete hoti hai. Training included hoti hai. Data migration bhi hum karte hain.", list: ["Day 1-2: Installation and configuration", "Day 3-4: Data migration (students, staff, fee structure)", "Day 5-6: Staff training (easy 2-hour session)", "Day 7: Go live with support team on standby"] },
    ],
  },
  {
    slug: "seo-tips-small-business-india",
    title: "2025 Mein India Ke Small Businesses Ke Liye Top SEO Tips",
    excerpt: "Google pe pehle page pe aana ab sirf bade companies ka kaam nahi — jaanein kaise local SEO se aap bhi top par aa sakte hain.",
    category: "SEO",
    photo: "/photos/office-meeting.jpg",
    author: "Priya Singh",
    authorRole: "CTO",
    date: "Dec 22, 2024",
    readTime: "6 min",
    result: [
      { label: "Organic Traffic", value: "+180%", color: "#0891B2" },
      { label: "Local Search Rank", value: "Top 3", color: "#C9A227" },
      { label: "Lead Generation", value: "3X", color: "#16A34A" },
    ],
    content: [
      { body: "2025 mein Google ka algorithm aur bhi smart ho gaya hai. Lekin local businesses ke liye ek badi opportunity hai — local SEO. Sahi strategy se aap apne area mein guaranteed top results pa sakte hain." },
      { heading: "1. Google My Business — Priority #1", body: "Agar aapka Google My Business (GMB) profile complete nahi hai, toh sab kuch baad mein.", list: ["Complete profile with photos, hours, services", "Weekly posts on GMB", "Reply to every review (positive and negative)", "Add Q&A section with common questions"] },
      { heading: "2. Local Keywords Target Karein", body: "'Restaurant in Noida' ya 'hospital in Delhi' — aise location-specific keywords Google pe zyada searches hote hain. Apne website pages pe yeh keywords naturally use karein.", list: ["City + service keyword in page titles", "Area-specific landing pages", "Hindi + English mixed content (Indian users prefer this)", "Voice search optimization — 'near me' queries"] },
      { heading: "3. Website Speed = SEO Rank", body: "Google Core Web Vitals ab directly ranking factor hai. Hamare websites Next.js mein build hoti hain — average load time 0.8 seconds. Yeh ranking mein directly help karta hai." },
      { heading: "4. Mobile-First is Non-Negotiable", body: "India mein 78% searches mobile pe hote hain. Agar aapki website mobile pe achhi nahi dikhti, Google penalize karta hai.", list: ["Responsive design mandatory", "Touch-friendly buttons and menus", "Fast mobile load time (under 2 seconds)", "No pop-ups that block content on mobile"] },
      { heading: "5. Content Strategy for Indian Market", body: "English content achha hai, lekin Hindi + English mix better converts karein Indian audience ke liye. Blog posts, FAQs, local guides — sab SEO mein help karte hain." },
    ],
  },
  {
    slug: "ecommerce-whatsapp-automation",
    title: "WhatsApp Automation Se E-commerce Sales Kaise Badhayein",
    excerpt: "Abandoned cart recovery, order updates, customer follow-up — sab WhatsApp pe automatic. Apni sales 2x karein.",
    category: "Marketing",
    photo: "/photos/fashion.jpg",
    author: "Sneha Joshi",
    authorRole: "AI & Automation Lead",
    date: "Dec 20, 2024",
    readTime: "4 min",
    result: [
      { label: "Abandoned Cart Recovery", value: "45%", color: "#25D366" },
      { label: "Sales Increase", value: "2X", color: "#16A34A" },
      { label: "Customer Retention", value: "+60%", color: "#7C3AED" },
    ],
    content: [
      { body: "India mein WhatsApp penetration 90%+ hai. Email open rate 20% hai, WhatsApp open rate 98% hai. Ab sochiye — aapke e-commerce customers ko order updates, offers, aur reminders kahan milein toh best result milega?" },
      { heading: "Abandoned Cart Recovery", body: "Average e-commerce store mein 70% carts abandon hote hain. WhatsApp automation se aap 1 ghante ke andar ek friendly reminder bhej sakte hain:", list: ["Trigger: Cart abandoned for 30 minutes", "Message: Friendly reminder with product image", "Offer: 5% discount code for next 2 hours", "Result: 45% recovery rate (vs 8% email)"] },
      { heading: "Order Confirmation & Tracking", body: "Customers ko order confirm hote hi WhatsApp message milta hai — tracking link ke saath. Is se customer service calls 60% kam ho jaati hain." },
      { heading: "Post-Delivery Follow-up", body: "Delivery ke 3 din baad automatic message: 'Aapko product kaisa laga?' + review link. Yeh review collection strategy se hamare clients ke Google ratings average 4.2 se 4.7 ho gayi." },
      { heading: "How to Implement", body: "KVL TECH ke e-commerce solutions mein WhatsApp API already integrated hoti hai. Setup ek din mein complete ho jaata hai.", list: ["WhatsApp Business API setup", "Message templates (pre-approved by Meta)", "Automation triggers configuration", "Analytics dashboard for message performance"] },
    ],
  },
  {
    slug: "hospital-management-paperless",
    title: "Paperless Hospital: HMS Se Operations 70% Fast Karo",
    excerpt: "Patient registration se billing tak — sab digital. Jaanein kaise MediLife Hospital ne apni efficiency dramatically badhaayi.",
    category: "Software",
    photo: "/photos/hospital.jpg",
    author: "Rahul Sharma",
    authorRole: "CEO & Founder",
    date: "Dec 18, 2024",
    readTime: "8 min",
    result: [
      { label: "Faster Operations", value: "70%", color: "#0891B2" },
      { label: "Patient Satisfaction", value: "90%", color: "#16A34A" },
      { label: "Revenue Increase", value: "35%", color: "#C9A227" },
    ],
    content: [
      { body: "Bangalore ke MediLife Hospital mein roz 500+ patients aate hain. Pehle OPD queue 2+ ghante hoti thi. Doctors ka time data entry mein waste hota tha. Pharmacy stock management manual thi. Tab unhone KVL TECH HMS implement kiya." },
      { heading: "Core Modules Implemented", body: "Hamare Hospital Management System (HMS) mein yeh modules hain:", list: ["OPD Management — digital token, appointment booking", "IPD (Indoor Patient Department) — bed management, nursing notes", "Pharmacy — stock management, prescription integration", "Lab — test orders, reports, result delivery", "Billing — insurance integration, automated invoicing", "Doctor Portal — patient history, prescription writing"] },
      { heading: "Patient Journey: Before vs After", body: "Before: Patient aata hai → queue mein baith ta hai → manual registration → doctor ke paas jaata hai → prescription paper par likhi jaati hai → pharmacy queue → billing counter queue. Total time: 2-3 hours." },
      { body: "After: Patient app se appointment book karta hai → QR code scan on arrival → instant registration → digital token → doctor digital prescription bhejta hai pharmacy ko → medication ready hota hai → digital invoice WhatsApp pe. Total time: 45 minutes.", list: ["70% faster patient processing", "Zero prescription errors (digital system)", "Real-time bed availability", "Insurance claim processing automated"] },
      { heading: "ROI for Hospital", body: "MediLife Hospital ne implementation ke 6 mahine mein investment recover kar liya. Revenue 35% badha kyunki more patients served, less wastage, accurate billing." },
      { heading: "Implementation", body: "Hospital HMS deployment 2-3 weeks mein hoti hai including staff training. 24/7 support hamare team provide karta hai.", list: ["Week 1: Core modules installation", "Week 2: Data migration and staff training", "Week 3: Parallel run (old + new system)", "Week 4 onwards: Full HMS operation"] },
    ],
  },
  {
    slug: "ai-chatbot-website-leads",
    title: "AI Chatbot Se Website Leads 5X Kaise Karein",
    excerpt: "24/7 available, human-like conversation, automatic lead qualification — AI chatbot aapki sales team ka best member ban sakta hai.",
    category: "AI & Automation",
    photo: "/photos/office-meeting.jpg",
    author: "Sneha Joshi",
    authorRole: "AI & Automation Lead",
    date: "Dec 15, 2024",
    readTime: "5 min",
    result: [
      { label: "Lead Increase", value: "5X", color: "#7C3AED" },
      { label: "Response Time", value: "2 sec", color: "#0891B2" },
      { label: "Conversion Rate", value: "+180%", color: "#16A34A" },
    ],
    content: [
      { body: "Ek website pe average visitor 3-4 minutes ruke ke chala jaata hai. Agar koi guide karne wala nahi, toh potential client ka lead waste ho jaata hai. AI chatbot yahi kaam karta hai — 24/7, bina salary ke." },
      { heading: "Kyun AI Chatbot Game Changer Hai", body: "Traditional chat widgets mein koi reply karne wala nahi hota — especially after hours. AI chatbot instantly respond karta hai, visitor ko qualify karta hai, aur lead capture kar leta hai.", list: ["Available 24/7 — raat 2 baje bhi reply", "Instant response (2 seconds vs 4+ hours for human)", "Lead qualification automatic", "Multiple languages — Hindi, English, Hinglish", "Appointment booking integration"] },
      { heading: "How It Works on KVL TECH Websites", body: "Haara AI chatbot Claude API use karta hai — yeh wahi technology hai jo ChatGPT jaisi companies use karti hain. Lekin specifically aapke business ke liye trained hota hai:" },
      { body: "Visitor aata hai → chatbot greet karta hai → visitor ki requirement samajhta hai → relevant products/services suggest karta hai → contact details collect karta hai → sales team ko instant WhatsApp alert jaata hai.", list: ["Business context training (your products, prices, FAQs)", "Lead scoring (hot/warm/cold classification)", "CRM integration (automatic lead entry)", "Human handoff when needed"] },
      { heading: "Real Results", body: "Hamare ek client (B2B software company) ke website pe chatbot implement karne ke baad: monthly leads 45 se 230 ho gaye. Qualified leads percentage 35% se 62% ho gayi. Sales team ka screening time 70% kam hua." },
      { heading: "Cost vs ROI", body: "AI chatbot implementation cost ek junior sales executive ki monthly salary se kam hai — lekin yeh 30x zyada leads generate karta hai. ROI generally first month mein positive ho jaata hai." },
    ],
  },
];

const OTHER_POSTS = (currentSlug: string) => POSTS.filter(p => p.slug !== currentSlug).slice(0, 3);

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-6xl mb-4">📄</p>
            <h1 className="font-display font-bold text-2xl text-[var(--color-text)] mb-3">Article Not Found</h1>
            <p className="text-[var(--color-text-secondary)] mb-6">Yeh article abhi available nahi hai.</p>
            <Link href="/blog" className="btn-gold inline-flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative bg-[var(--color-bg-secondary)]">
          <div className="h-64 sm:h-80 lg:h-96 relative overflow-hidden">
            <Image src={post.photo} alt={post.title} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 pb-0 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="bg-[var(--color-bg)] rounded-2xl p-7 shadow-[var(--shadow-luxury)]">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Link href="/blog" className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <ArrowLeft size={13} /> Blog
                </Link>
                <span className="text-[var(--color-text-muted)]">/</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)]">
                  <Tag size={11} /> {post.category}
                </span>
              </div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--color-text)] mb-4 leading-tight">{post.title}</h1>
              <div className="flex items-center gap-5 text-xs text-[var(--color-text-muted)] flex-wrap">
                <span className="flex items-center gap-1.5"><User size={12} /> <span className="font-medium text-[var(--color-text-secondary)]">{post.author}</span> · {post.authorRole}</span>
                <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime} read</span>
                <span>{post.date}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 bg-[var(--color-bg)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Main article */}
              <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 prose-custom">
                {/* Result stats if available */}
                {post.result && (
                  <div className="grid grid-cols-3 gap-3 mb-8 p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    {post.result.map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className="font-display font-bold text-xl sm:text-2xl" style={{ color }}>{value}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {post.content.map((block, i) => (
                  <div key={i} className="mb-6">
                    {block.heading && (
                      <h2 className="font-display font-bold text-xl text-[var(--color-text)] mb-3 mt-6">{block.heading}</h2>
                    )}
                    <p className="text-[var(--color-text-secondary)] text-sm sm:text-base leading-relaxed">{block.body}</p>
                    {block.list && (
                      <ul className="mt-3 space-y-2">
                        {block.list.map((item, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm text-[var(--color-text-secondary)]">
                            <CheckCircle2 size={16} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Author box */}
                <div className="mt-10 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {post.author[0]}
                  </div>
                  <div>
                    <p className="font-display font-bold text-base text-[var(--color-text)]">{post.author}</p>
                    <p className="text-xs text-[var(--color-gold)] font-semibold mb-1.5 flex items-center gap-1">
                      {post.authorRole},&nbsp;
                      <img src="/kvl-tech-logo-tight.png" alt="KVL TECH" className="h-5 w-auto object-contain dark:hidden inline-block" />
                      <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-5 w-auto object-contain hidden dark:inline-block" />
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      KVL TECH team ke expert members India ke businesses ko digital transformation mein help karte hain.
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-6 p-4 rounded-xl border border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm font-semibold text-[var(--color-text)]">Was this article helpful?</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} size={22} fill="#C9A227" className="text-[var(--color-gold)] cursor-pointer hover:scale-110 transition-transform" />)}
                  </div>
                </div>
              </motion.article>

              {/* Sidebar */}
              <motion.aside initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-5">
                {/* CTA card */}
                <div className="card p-6 bg-[var(--color-navy)]">
                  <TrendingUp size={28} className="text-[var(--color-gold)] mb-3" />
                  <h3 className="font-display font-bold text-lg text-white mb-2">Apna Project Shuru Karein</h3>
                  <p className="text-white/60 text-xs mb-4">Free consultation — 30 min mein aapki requirement samjhein.</p>
                  <Link href="/contact" className="btn-gold w-full justify-center text-sm">
                    Free Consultation <ArrowRight size={14} />
                  </Link>
                  <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/80 hover:text-white text-xs font-medium transition-colors">
                    <MessageCircle size={14} style={{ color: "#25D366" }} /> WhatsApp Karein
                  </a>
                </div>

                {/* Related posts */}
                <div className="card p-5">
                  <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {OTHER_POSTS(post.slug).map(related => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}
                        className="flex gap-3 group">
                        <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 relative">
                          <Image src={related.photo} alt={related.title} fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="64px" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text)] leading-snug group-hover:text-[var(--color-gold)] transition-colors line-clamp-2">{related.title}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1 flex items-center gap-1"><Clock size={9} /> {related.readTime}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/blog" className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] hover:underline">
                    View All Articles <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-14 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <div className="max-w-xl mx-auto text-center px-4">
            <h2 className="font-display font-bold text-2xl text-[var(--color-text)] mb-2">Aur Articles Miss Mat Karein</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">Weekly business growth tips — bilkul free.</p>
            <div className="flex gap-3">
              <input type="email" placeholder="aap@example.com"
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all" />
              <button className="btn-gold shrink-0">Subscribe</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
