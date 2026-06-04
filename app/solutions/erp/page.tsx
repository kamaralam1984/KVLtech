"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  Factory,
  BarChart3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Home,
  Ship,
  Shield,
  Clock,
  Calendar,
  Wrench,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as unknown as never } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const stats = [
  { value: "All", label: "Departments Unified" },
  { value: "60%", label: "Less Admin Time" },
  { value: "200+", label: "Integrations Available" },
  { value: "Real-time", label: "Dashboards & Reports" },
];

const modules = [
  {
    icon: DollarSign,
    title: "Finance & Accounting",
    description:
      "Take complete control of your financial operations with GST-ready invoicing that automatically calculates tax obligations, comprehensive expense tracking across every department, and detailed Profit & Loss reports that give you an accurate picture of your business health at any moment. Reconcile accounts in minutes, manage multiple bank accounts, and always be audit-ready with complete transaction trails and automated ledger entries.",
    features: ["GST-ready invoicing", "Expense tracking", "P&L reports", "Bank reconciliation"],
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Eliminate stockouts and overstock situations with intelligent inventory tracking that monitors real-time stock levels across multiple warehouses. Automate purchase orders when items fall below your defined reorder threshold, manage supplier relationships and pricing agreements, and receive instant alerts before critical stock positions cause business disruption. Track every item from receipt to delivery with full serial and batch number support.",
    features: ["Real-time stock levels", "Automated purchase orders", "Supplier management", "Low-stock alerts"],
  },
  {
    icon: Users,
    title: "HR & Payroll",
    description:
      "Manage your entire workforce from a single, intuitive platform. Maintain comprehensive employee records including qualifications, performance reviews, and document storage. Track attendance with biometric and digital check-in support, process payroll with all statutory deductions calculated automatically, and handle leave requests with manager approval workflows. Onboarding new employees becomes a streamlined, paperless process your HR team will appreciate.",
    features: ["Employee records", "Attendance tracking", "Salary processing", "Leave management"],
  },
  {
    icon: ShoppingBag,
    title: "Purchase & Sales",
    description:
      "Accelerate your entire sales cycle from initial quotation to final delivery. Create professional quotations in seconds, convert them to confirmed orders with one click, track fulfillment and delivery status in real time, and provide customers with a self-service portal where they can view their orders, invoices, and delivery updates without calling your team. Reduce sales cycle time, minimize order errors, and deliver a premium customer experience at every touchpoint.",
    features: ["Quotations & orders", "Delivery tracking", "Customer portal", "Sales analytics"],
  },
  {
    icon: Factory,
    title: "Manufacturing",
    description:
      "Streamline your production operations with end-to-end manufacturing management. Plan production schedules based on actual demand, define and manage Bills of Materials for every product, enforce multi-stage quality control checkpoints to maintain product standards, and track material wastage to identify inefficiencies that eat into your margins. Get complete visibility from raw material procurement to finished goods dispatch, enabling you to optimize capacity, reduce costs, and deliver on time consistently.",
    features: ["Production planning", "Bill of Materials (BOM)", "Quality control", "Wastage tracking"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Transform raw business data into actionable intelligence with a powerful reporting engine built for decision-makers. Choose from over 50 pre-built reports covering every business function, or build custom dashboards that surface the exact metrics your leadership team needs. Export any report to Excel or PDF with a single click for sharing in board meetings, investor presentations, or compliance submissions. Set up automated report delivery so critical insights land in your inbox every morning without manual effort.",
    features: ["50+ pre-built reports", "Custom dashboards", "Export to Excel/PDF", "Automated delivery"],
  },
];

const withoutErp = [
  "Data scattered across dozens of disconnected spreadsheets",
  "Departments operating in silos with no shared visibility",
  "Costly manual errors from repeated data re-entry",
  "Delayed reports that reflect last week, not today",
  "Hours wasted reconciling figures across multiple systems",
  "No single source of truth for business-critical decisions",
];

const withErp = [
  "One single source of truth for your entire organization",
  "Every department connected with real-time data sharing",
  "Automated workflows eliminate manual entry and human error",
  "Live dashboards reflect your business performance right now",
  "Hours of admin work compressed into automated processes",
  "60% reduction in administrative overhead from day one",
];

const timeline = [
  {
    icon: Wrench,
    week: "Week 1",
    title: "Requirements Gathering & Setup",
    description:
      "Our implementation team conducts in-depth discovery sessions with your department heads to document your exact business processes, workflows, and data requirements. We configure the ERP environment, set up user roles and access permissions, and establish your chart of accounts and organizational structure so the system reflects how your business actually operates.",
  },
  {
    icon: Package,
    week: "Week 2",
    title: "Data Migration & Configuration",
    description:
      "We handle the complete migration of your existing data — whether it lives in Excel spreadsheets, a legacy ERP system, or scattered across multiple platforms. Our team cleanses, validates, and imports your customer master data, supplier records, inventory lists, opening balances, and historical transactions. All modules are configured with your specific tax codes, approval hierarchies, and business rules.",
  },
  {
    icon: GraduationCap,
    week: "Week 3",
    title: "Training & Testing",
    description:
      "Your team receives comprehensive role-based training delivered by our certified ERP consultants in a dedicated training environment that mirrors your live system. We conduct parallel run testing using real business scenarios, validate all financial figures, test every workflow end-to-end, and make final adjustments based on user feedback before giving your team the confidence to go live.",
  },
  {
    icon: Rocket,
    week: "Week 4",
    title: "Go-Live & Ongoing Support",
    description:
      "On go-live day, our implementation team is on-site or available via screen share throughout your first full business day. We monitor system performance, support users handling real transactions for the first time, and resolve any questions that arise in real time. Post-launch, you have a dedicated account manager and 24/7 technical support to ensure your ERP continues to deliver value as your business grows.",
  },
];

const industries = [
  {
    icon: Factory,
    name: "Manufacturing",
    benefit: "End-to-end production visibility from raw material to finished goods, with BOM management, quality control, and wastage reduction built in.",
  },
  {
    icon: ShoppingCart,
    name: "Retail Chain",
    benefit: "Centralized inventory and POS management across all outlets, with real-time stock visibility and automated replenishment across your entire retail network.",
  },
  {
    icon: GraduationCap,
    name: "Educational Institution",
    benefit: "Manage fee collection, staff payroll, procurement, and statutory compliance in one system with role-based access for administrators, accounts, and management.",
  },
  {
    icon: HeartPulse,
    name: "Healthcare",
    benefit: "Track pharmaceutical inventory, manage staff attendance and payroll, handle vendor payments, and maintain complete financial records with full audit trails.",
  },
  {
    icon: Home,
    name: "Real Estate Developer",
    benefit: "Manage project budgets, track construction costs, handle broker commissions, process buyer collections, and maintain compliance documentation in one platform.",
  },
  {
    icon: Ship,
    name: "Export / Import Business",
    benefit: "Handle multi-currency transactions, manage shipment documentation, track landed costs, and maintain complete import-export compliance records effortlessly.",
  },
];

const pricingPlans = [
  {
    name: "SME Plan",
    price: "$499",
    period: "/month",
    users: "Up to 25 users",
    highlight: false,
    description: "Perfect for small and medium businesses ready to replace spreadsheets with a professional ERP system.",
    features: [
      "All 6 core ERP modules",
      "25 user licenses",
      "Cloud-hosted infrastructure",
      "GST & statutory compliance",
      "Email & chat support",
      "Standard reports library",
      "Data migration assistance",
      "Initial training (online)",
    ],
  },
  {
    name: "Business Plan",
    price: "$999",
    period: "/month",
    users: "Up to 100 users",
    highlight: true,
    description: "Built for growing businesses that need advanced features, more users, and priority implementation support.",
    features: [
      "Everything in SME Plan",
      "100 user licenses",
      "Custom dashboards",
      "Advanced analytics module",
      "Priority support (4-hr SLA)",
      "Dedicated account manager",
      "Custom workflow automation",
      "API access & integrations",
      "On-site training available",
    ],
  },
  {
    name: "Enterprise Plan",
    price: "Custom",
    period: "",
    users: "Unlimited users",
    highlight: false,
    description: "For large enterprises requiring a dedicated server, custom development, and white-glove implementation.",
    features: [
      "Everything in Business Plan",
      "Unlimited user licenses",
      "Dedicated private server",
      "Custom module development",
      "24/7 premium support",
      "On-site implementation team",
      "Multi-company / multi-branch",
      "SLA-backed uptime guarantee",
      "Quarterly business reviews",
    ],
  },
];

const faqs = [
  {
    question: "How long does ERP implementation take?",
    answer:
      "Most implementations are fully complete in 7 to 21 business days depending on your organization size, the number of modules being deployed, and the complexity of your data migration requirements. Simple single-location businesses with clean data can go live in as few as 7 days, while larger multi-branch organizations with complex workflows typically take 3 to 4 weeks. We provide a detailed implementation schedule during our initial discovery call so you always know exactly what to expect.",
  },
  {
    question: "How is our existing data migrated to the new ERP?",
    answer:
      "Our dedicated data migration team handles the complete process from start to finish. We collect your data from Excel spreadsheets, existing accounting software, or any legacy ERP system, then cleanse, validate, and map it to the new system structure. We run multiple validation passes to ensure accuracy before importing into your live environment. You never have to worry about losing historical records or starting from scratch — your complete business history moves with you.",
  },
  {
    question: "Is the ERP cloud-based or can we host it ourselves?",
    answer:
      "We offer complete flexibility in deployment. You can choose cloud-hosted on our secure infrastructure (included in all plans), on-premise installation on your own servers, or a hybrid approach that keeps sensitive data on-premise while leveraging cloud for specific modules. Cloud hosting includes automatic backups, security patches, and uptime monitoring. On-premise deployments are available for Enterprise Plan clients with specific data sovereignty or security requirements.",
  },
  {
    question: "Can non-technical staff use the system comfortably?",
    answer:
      "Absolutely. The system is designed with usability as a priority — your accountant, warehouse manager, and HR executive each see only the modules and data relevant to their role through our role-based access control. The interface uses plain business language rather than technical jargon, and every function includes contextual help guides. Our training program is specifically designed for non-technical users and focuses on daily tasks your team will actually perform rather than technical configuration.",
  },
  {
    question: "How are compliance updates like GST changes handled?",
    answer:
      "All regulatory updates — including GST rate changes, TDS amendments, new PF or ESI rules, and changes to filing formats — are pushed as automatic system updates included in your subscription at no additional cost. You never need to manually update tax rates or filing templates. Our compliance team monitors all regulatory announcements and deploys updates ahead of effective dates so you are always operating with current and accurate statutory requirements without any action required on your end.",
  },
  {
    question: "What level of support is included with the subscription?",
    answer:
      "All plans include access to our technical support team via email and live chat during business hours. Business Plan subscribers receive priority support with a guaranteed 4-hour response time and a dedicated account manager who understands your specific implementation. Enterprise Plan clients receive 24/7 technical support with phone escalation, a named senior account manager, and quarterly business reviews to ensure the system continues to serve your evolving needs. We also maintain a comprehensive knowledge base and video library for self-service support.",
  },
];

export default function ERPPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-[104px]">
        {/* Hero Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10 blur-3xl"
              style={{ background: "var(--color-gold)" }}
            />
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeUp} className="section-badge">
                ERP Systems
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="mt-6 text-4xl md:text-6xl font-bold leading-tight"
                style={{ color: "var(--color-text)" }}
              >
                One Platform to Run{" "}
                <span className="text-gold-gradient">Your Entire Business</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Connect every department — finance, inventory, HR, sales — in one
                powerful ERP system built for growing businesses. Replace
                scattered spreadsheets and disconnected tools with a single
                platform that gives everyone in your organization the real-time
                information they need to make faster, smarter decisions every day.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/contact" className="btn-gold inline-flex items-center gap-2">
                  Schedule Free ERP Demo
                  <ArrowRight size={16} />
                </Link>
                <Link href="/pricing" className="btn-outline">
                  View Pricing Plans
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="card text-center py-6 px-4"
                >
                  <p className="text-3xl font-bold text-gold-gradient">
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ERP Modules Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Core Modules
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Everything Your Business Needs, In One System
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Six fully integrated modules designed to work together seamlessly,
                giving you complete operational control from a single dashboard.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {modules.map((mod) => (
                <motion.div
                  key={mod.title}
                  variants={fadeUp}
                  className="card p-6 group hover:border-[var(--color-gold)] transition-colors duration-300 flex flex-col"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <mod.icon size={24} style={{ color: "var(--color-gold)" }} />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    {mod.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-4 flex-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {mod.description}
                  </p>
                  <ul className="space-y-1.5">
                    {mod.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{ color: "var(--color-gold)", flexShrink: 0 }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Without ERP vs With ERP Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                The Difference Is Clear
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Your Business Before and After KVL ERP
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every growing business eventually hits a wall with spreadsheets and
                disconnected software. Here is the reality on both sides of that wall.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Without ERP */}
              <motion.div variants={fadeUp} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.12)" }}
                  >
                    <XCircle size={20} className="text-red-500" />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    Without ERP
                  </h3>
                </div>
                <ul className="space-y-3">
                  {withoutErp.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <XCircle
                        size={16}
                        className="text-red-400 flex-shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* With KVL ERP */}
              <motion.div
                variants={fadeUp}
                className="card p-6 border-2"
                style={{ borderColor: "var(--color-gold)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(212,175,55,0.15)" }}
                  >
                    <CheckCircle2
                      size={20}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    With KVL ERP
                  </h3>
                </div>
                <ul className="space-y-3">
                  {withErp.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <CheckCircle2
                        size={16}
                        style={{ color: "var(--color-gold)", flexShrink: 0 }}
                        className="mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Implementation Timeline
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                From Kickoff to Go-Live in 4 Weeks
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Our proven implementation methodology has delivered successful ERP
                deployments for hundreds of businesses across multiple industries.
                Here is exactly what happens week by week.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {timeline.map((step, index) => (
                <motion.div
                  key={step.week}
                  variants={fadeUp}
                  className="card p-6 flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(212,175,55,0.12)" }}
                    >
                      <step.icon
                        size={22}
                        style={{ color: "var(--color-gold)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {step.week}
                    </span>
                    <h3
                      className="mt-1 text-lg font-bold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Industries We Serve
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                ERP Configured for Your Industry
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every industry has unique operational requirements and compliance
                obligations. Our ERP is pre-configured with industry-specific
                workflows so you spend less time customizing and more time growing.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {industries.map((industry) => (
                <motion.div
                  key={industry.name}
                  variants={fadeUp}
                  className="card p-6 flex gap-4 items-start hover:border-[var(--color-gold)] transition-colors duration-300"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(212,175,55,0.12)" }}
                  >
                    <industry.icon
                      size={22}
                      style={{ color: "var(--color-gold)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--color-text)" }}
                    >
                      {industry.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {industry.benefit}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Compliance Section */}
        <section className="bg-[var(--color-bg-secondary)] py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="card p-8 text-center border-2"
              style={{ borderColor: "var(--color-gold)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(212,175,55,0.12)" }}
              >
                <Shield size={28} style={{ color: "var(--color-gold)" }} />
              </div>
              <span className="section-badge">Compliance Built-In</span>
              <h2
                className="mt-4 text-2xl md:text-3xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Every Indian Statutory Requirement, Handled Automatically
              </h2>
              <p
                className="mt-4 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Stop worrying about regulatory compliance. KVL ERP has GST, TDS,
                PF, and ESI built directly into the system. Every transaction is
                automatically tagged with the correct tax treatment, statutory
                deductions are calculated without manual intervention, and filing
                reports are generated in the exact formats required by Indian tax
                and labor authorities. When regulations change, automatic system
                updates ensure you remain compliant without any action required
                from your team. We handle compliance so you can focus on running
                your business.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {["GST Compliance", "TDS Management", "PF Processing", "ESI Calculations", "E-invoicing", "GSTR Filing"].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="px-4 py-1.5 rounded-full text-sm font-semibold"
                      style={{
                        background: "rgba(212,175,55,0.12)",
                        color: "var(--color-gold)",
                        border: "1px solid rgba(212,175,55,0.25)",
                      }}
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-[var(--color-bg)] py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-14"
            >
              <motion.span variants={fadeUp} className="section-badge">
                Transparent Pricing
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Straightforward Plans, No Hidden Fees
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every plan includes implementation support, data migration,
                training, and ongoing compliance updates. Pick the plan that
                matches your team size and growth ambitions.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`card p-6 flex flex-col ${
                    plan.highlight ? "border-2" : ""
                  }`}
                  style={
                    plan.highlight
                      ? { borderColor: "var(--color-gold)" }
                      : undefined
                  }
                >
                  {plan.highlight && (
                    <div className="mb-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                        style={{
                          background: "rgba(212,175,55,0.15)",
                          color: "var(--color-gold)",
                        }}
                      >
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-4xl font-bold text-gold-gradient">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className="text-base mb-1"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1 text-sm font-medium"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {plan.users}
                  </p>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {plan.description}
                  </p>
                  <ul className="mt-5 space-y-2 flex-1">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <CheckCircle2
                          size={14}
                          style={{ color: "var(--color-gold)", flexShrink: 0 }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/contact"
                    className={`mt-6 block text-center ${
                      plan.highlight ? "btn-gold" : "btn-outline"
                    }`}
                  >
                    {plan.price === "Custom" ? "Request a Quote" : "Get Started"}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-[var(--color-bg-secondary)] py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-12"
            >
              <motion.span variants={fadeUp} className="section-badge">
                FAQ
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="mt-4 text-3xl md:text-4xl font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-lg"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Get clear answers to the questions businesses ask most before
                committing to an ERP investment.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left"
                    aria-expanded={openFaq === index}
                  >
                    <span
                      className="font-semibold pr-4"
                      style={{ color: "var(--color-text)" }}
                    >
                      {faq.question}
                    </span>
                    {openFaq === index ? (
                      <ChevronUp
                        size={18}
                        className="flex-shrink-0"
                        style={{ color: "var(--color-gold)" }}
                      />
                    ) : (
                      <ChevronDown
                        size={18}
                        className="flex-shrink-0"
                        style={{ color: "var(--color-text-secondary)" }}
                      />
                    )}
                  </button>
                  {openFaq === index && (
                    <div
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4" style={{ background: "var(--color-navy)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="flex justify-center mb-6">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                  style={{
                    background: "rgba(212,175,55,0.15)",
                    color: "var(--color-gold)",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  Book Your Free Demo
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl md:text-5xl font-bold text-white leading-tight"
              >
                Schedule Your Free ERP Demo —{" "}
                <span className="text-gold-gradient">
                  See Your Business Transformed in 30 Minutes
                </span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
              >
                In a 30-minute live demo, our ERP consultant will walk you through
                the exact modules your business needs, show you how your data
                would look inside the system, and answer every question you have
                before you make any commitment. No pressure, no obligation — just
                a clear picture of what running your business on one unified
                platform actually looks and feels like.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/contact"
                  className="btn-gold inline-flex items-center gap-2"
                >
                  Book My Free Demo
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-outline inline-flex items-center gap-2"
                  style={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  Compare All Plans
                </Link>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm"
              >
                {[
                  "No commitment required",
                  "Go live in as few as 7 days",
                  "Full data migration included",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      style={{ color: "var(--color-gold)" }}
                    />
                    {item}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
