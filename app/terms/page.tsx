import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | KVL TECH",
  description:
    "Read the Terms of Service for KVL TECH (KVL Business Solutions). These terms govern your use of our website development, software, SaaS, AI, and digital marketing services.",
};

export default function TermsOfServicePage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header
        style={{
          backgroundColor: "#0B1437",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginBottom: "24px",
              color: "#C9A227",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              border: "1px solid rgba(201,162,39,0.4)",
              padding: "6px 16px",
              borderRadius: "6px",
              transition: "background 0.2s",
            }}
          >
            ← Back to Home
          </Link>
          <h1
            style={{
              color: "#C9A227",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 800,
              margin: "0 0 12px",
              letterSpacing: "-0.01em",
            }}
          >
            Terms of Service
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
            KVL TECH &nbsp;·&nbsp; kvlbusinesssolutions.com &nbsp;·&nbsp; Last updated: June 2025
          </p>
        </div>
      </header>

      {/* Body */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Intro */}
        <p style={styles.intro}>
          Please read these Terms of Service (&ldquo;Terms&rdquo;, &ldquo;Agreement&rdquo;) carefully before engaging with or
          purchasing any services from <strong>KVL TECH</strong> (operating as KVL Business Solutions Private
          Limited, hereinafter referred to as &ldquo;KVL TECH&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By placing an
          order, signing a proposal, accessing our platform, or using any of our services, you
          (&ldquo;Client&rdquo;, &ldquo;you&rdquo;, or &ldquo;your&rdquo;) agree to be bound by these Terms in full.
        </p>

        {/* Section 1 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>1. Acceptance of Terms</h2>
          <p style={styles.p}>
            By accessing our website at <a href="https://kvlbusinesssolutions.com" style={styles.link}>kvlbusinesssolutions.com</a>,
            submitting an inquiry, placing an order, making a payment, or otherwise engaging our
            services, you confirm that you have read, understood, and agreed to be bound by these Terms
            of Service and our Privacy Policy.
          </p>
          <p style={styles.p}>
            If you are entering into this Agreement on behalf of a company or other legal entity, you
            represent that you have the authority to bind that entity to these Terms. If you do not
            agree with any part of these Terms, you must not use our services.
          </p>
          <p style={styles.p}>
            KVL TECH reserves the right to amend these Terms at any time. Updated Terms will be
            posted on this page with a revised &ldquo;Last updated&rdquo; date. Continued use of our services
            after any changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        {/* Section 2 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>2. Services</h2>
          <p style={styles.p}>
            KVL TECH provides a range of professional digital services, including but not limited to:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Website Development</strong> — Custom websites, landing pages, e-commerce stores, and web portals built using modern technologies (Next.js, React, Node.js, etc.).</li>
            <li style={styles.li}><strong>Software Development</strong> — Bespoke business software, desktop and mobile applications, CRM systems, ERP platforms, and client portals.</li>
            <li style={styles.li}><strong>SaaS Solutions</strong> — Ready-made and custom Software-as-a-Service products that clients may purchase, rent, or white-label for their own business use.</li>
            <li style={styles.li}><strong>AI Solutions</strong> — AI-powered chatbots, intelligent automation workflows, recommendation engines, and AI-integrated business tools.</li>
            <li style={styles.li}><strong>Marketing Automation</strong> — Email marketing systems, WhatsApp automation, CRM integrations, lead generation funnels, and digital advertising campaign management.</li>
            <li style={styles.li}><strong>Maintenance &amp; Support</strong> — Ongoing technical support, hosting management, software updates, and performance optimisation.</li>
          </ul>
          <p style={styles.p}>
            The specific scope, deliverables, timelines, and pricing for each engagement will be
            detailed in a project proposal, purchase order, or service agreement agreed upon between
            KVL TECH and the Client. These Terms apply to all such engagements unless expressly
            superseded in writing.
          </p>
        </section>

        {/* Section 3 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>3. Payment Terms</h2>
          <p style={styles.p}>
            All payments for KVL TECH services are subject to the following terms:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Currency:</strong> All prices are quoted and invoiced in Indian Rupees (INR) unless otherwise specified in a written proposal.</li>
            <li style={styles.li}><strong>GST:</strong> Goods and Services Tax (GST) at the applicable rate of 18% will be charged on all services in accordance with the Goods and Services Tax Act, 2017. KVL TECH&apos;s GSTIN is <strong>29AABCU9603R1ZM</strong> and PAN is <strong>AABCU9603R</strong>.</li>
            <li style={styles.li}><strong>Payment Gateway:</strong> Online payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. By making a payment, you also agree to Razorpay&apos;s terms of service.</li>
            <li style={styles.li}><strong>Payment Schedule:</strong> For standard project engagements, 100% of the agreed fee is due before commencement of work unless a milestone-based payment schedule is explicitly agreed upon in writing. For larger projects, a minimum advance of 50% of the total project value is required before work begins, with the remaining balance due upon project completion and prior to the final delivery or deployment.</li>
            <li style={styles.li}><strong>Payment Due Date:</strong> All invoices are due for payment within 3 business days of issuance unless otherwise stated. Delayed payments may result in project timelines being extended proportionally.</li>
            <li style={styles.li}><strong>Late Payment:</strong> KVL TECH reserves the right to charge interest at 2% per month on overdue balances and to suspend all active services until outstanding amounts are cleared.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>4. Refund Policy</h2>
          <p style={styles.p}>
            KVL TECH understands that circumstances can change. Our refund policy is as follows:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Full Refund — 48-Hour Window:</strong> If you wish to cancel your order, a full refund of any amounts paid will be issued provided the cancellation request is submitted within 48 hours of payment AND no work has yet commenced on your project. To request a cancellation, email <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a> with your order reference.</li>
            <li style={styles.li}><strong>No Refund Once Development Begins:</strong> Once development, design, or any billable work has commenced — even partially — no refund will be issued under any circumstances. This is because significant resources, time, and expertise are committed to your project from the moment work starts.</li>
            <li style={styles.li}><strong>Partial Delivery:</strong> If KVL TECH is unable to complete a project due to reasons entirely within our control (i.e., not caused by Client delays or scope changes), we will offer either a credit note for work not yet delivered or a partial refund proportional to the undelivered scope, at our discretion.</li>
            <li style={styles.li}><strong>SaaS Subscriptions:</strong> Monthly and annual subscription fees are non-refundable once a billing period has commenced. Annual subscriptions may be pro-rated for cancellations made after the first 30 days, subject to management approval.</li>
            <li style={styles.li}><strong>Third-Party Costs:</strong> Payments made to third parties on your behalf (domain registrations, hosting fees, API keys, stock assets, advertising budgets, etc.) are non-refundable.</li>
          </ul>
          <p style={styles.p}>
            All refund requests must be submitted in writing to <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a>.
            Approved refunds will be processed within 7–10 business days to the original payment method.
          </p>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>5. Project Delivery</h2>
          <p style={styles.p}>
            KVL TECH is committed to timely delivery of all projects. The following terms apply:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Estimated Timelines:</strong> All project delivery timelines communicated in proposals, quotes, or verbal discussions are estimates only and are not guaranteed. Actual delivery may vary depending on project complexity, revision cycles, and Client responsiveness.</li>
            <li style={styles.li}><strong>Client Responsibilities:</strong> The Client must provide all required content, branding assets (logos, brand colours, fonts), copy, images, product information, and any other project inputs within <strong>7 calendar days</strong> of project commencement. Failure to provide required inputs within this window will result in a corresponding extension of the delivery timeline, for which KVL TECH bears no responsibility.</li>
            <li style={styles.li}><strong>Revisions:</strong> Each project includes a defined number of revision rounds as specified in the proposal. Requests beyond the included revision allowance will be quoted and billed separately.</li>
            <li style={styles.li}><strong>Client Approval:</strong> Once a deliverable is presented for review, the Client must provide written approval or revision requests within 5 business days. Silence for more than 5 business days will be treated as tacit approval and the project will proceed to the next stage or be marked as complete.</li>
            <li style={styles.li}><strong>Force Majeure:</strong> KVL TECH will not be held liable for delivery delays caused by circumstances beyond our reasonable control, including natural disasters, government actions, internet service outages, or third-party service failures.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>6. Intellectual Property</h2>
          <p style={styles.p}>
            Intellectual property rights are allocated as follows:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Client Ownership Upon Full Payment:</strong> Upon receipt of full and final payment for a project, KVL TECH transfers all intellectual property rights in the final custom deliverable (designs, code, written content created specifically for the Client) to the Client. Ownership does not transfer until payment is received in full.</li>
            <li style={styles.li}><strong>KVL TECH Portfolio Rights:</strong> KVL TECH retains the irrevocable, perpetual right to display, reference, and showcase any completed work in our portfolio, case studies, social media, marketing materials, and proposals, unless the Client requests confidentiality in writing prior to project commencement.</li>
            <li style={styles.li}><strong>Pre-existing IP &amp; Tools:</strong> KVL TECH retains all rights to our proprietary tools, frameworks, libraries, code templates, development methodologies, processes, and pre-existing intellectual property incorporated into deliverables. The Client receives a licence to use these within the delivered product but does not acquire ownership of the underlying IP.</li>
            <li style={styles.li}><strong>Third-Party Assets:</strong> Open-source software, licensed fonts, stock photography, and other third-party components used in deliverables remain subject to their respective licences. KVL TECH will inform the Client of any such components.</li>
            <li style={styles.li}><strong>SaaS Products:</strong> For rented or subscription-based SaaS products, the Client receives a non-exclusive licence to use the software during the subscription period only. No ownership of the underlying software is transferred.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>7. Confidentiality</h2>
          <p style={styles.p}>
            Both parties acknowledge that during the course of the engagement, each may disclose
            confidential and proprietary information to the other. Both KVL TECH and the Client agree to:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Hold all confidential information received from the other party in strict confidence.</li>
            <li style={styles.li}>Not disclose such information to any third party without prior written consent, except as required by law or court order.</li>
            <li style={styles.li}>Use confidential information solely for the purpose of fulfilling obligations under the service engagement.</li>
            <li style={styles.li}>Take reasonable precautions to prevent unauthorised disclosure, no less rigorous than the measures each party uses to protect its own confidential information.</li>
          </ul>
          <p style={styles.p}>
            Confidential information does not include information that: (a) is or becomes publicly known
            through no breach of this Agreement; (b) was already known to the receiving party at the time
            of disclosure; (c) is independently developed by the receiving party without reference to the
            disclosing party&apos;s information; or (d) is disclosed with the prior written approval of the
            disclosing party.
          </p>
          <p style={styles.p}>
            These confidentiality obligations survive the termination of any service engagement for a
            period of two (2) years.
          </p>
        </section>

        {/* Section 8 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>8. Limitation of Liability</h2>
          <p style={styles.p}>
            To the fullest extent permitted by applicable Indian law:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Maximum Liability:</strong> KVL TECH&apos;s total aggregate liability to the Client arising out of or in connection with any service, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, shall not exceed the total amount paid by the Client to KVL TECH for the specific service giving rise to the claim during the twelve (12) months preceding the event.</li>
            <li style={styles.li}><strong>Exclusion of Consequential Loss:</strong> KVL TECH shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to loss of profits, loss of revenue, loss of data, loss of business opportunity, loss of goodwill, or business interruption, even if KVL TECH has been advised of the possibility of such damages.</li>
            <li style={styles.li}><strong>Service Availability:</strong> KVL TECH does not guarantee uninterrupted or error-free operation of any software, website, or platform we deliver or maintain. We will make commercially reasonable efforts to ensure availability and performance, but are not liable for outages caused by hosting providers, internet infrastructure, or third-party services.</li>
            <li style={styles.li}><strong>Client Responsibilities:</strong> The Client is solely responsible for the accuracy and legality of all content, data, and information provided to KVL TECH. KVL TECH is not liable for any legal claims arising from Client-provided content.</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>9. Governing Law &amp; Dispute Resolution</h2>
          <p style={styles.p}>
            These Terms of Service shall be governed by and construed in accordance with the laws of
            India, including but not limited to the Indian Contract Act, 1872, the Information Technology
            Act, 2000, and the Consumer Protection Act, 2019.
          </p>
          <p style={styles.p}>
            Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach,
            termination, or invalidity thereof, shall first be attempted to be resolved through good-faith
            negotiation between the parties. If negotiation fails, the parties agree to submit to the
            exclusive jurisdiction of the courts located in <strong>Noida, Uttar Pradesh, India</strong>.
          </p>
          <p style={styles.p}>
            For disputes involving amounts below ₹10,00,000 (Ten Lakh Rupees), either party may opt for
            resolution through a mutually agreed arbitration process conducted in accordance with the
            Arbitration and Conciliation Act, 1996, with the seat of arbitration in Noida, UP.
          </p>
        </section>

        {/* Section 10 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>10. Contact Us</h2>
          <p style={styles.p}>
            If you have any questions, concerns, or require clarification regarding these Terms of Service,
            please contact us through any of the following channels:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactLine}><strong>Company:</strong> KVL TECH (KVL Business Solutions)</p>
            <p style={styles.contactLine}><strong>Address:</strong> Sector 62, Noida, Uttar Pradesh 201309, India</p>
            <p style={styles.contactLine}><strong>Email:</strong> <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a></p>
            <p style={styles.contactLine}><strong>Phone:</strong> <a href="tel:+919942000413" style={styles.link}>+91 9942000413</a></p>
            <p style={styles.contactLine}><strong>Website:</strong> <a href="https://kvlbusinesssolutions.com" style={styles.link}>kvlbusinesssolutions.com</a></p>
          </div>
        </section>

        {/* Footer bar */}
        <div
          style={{
            marginTop: "56px",
            padding: "24px",
            backgroundColor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#64748b" }}>
            <strong style={{ color: "#0B1437" }}>KVL TECH</strong> &nbsp;·&nbsp; GST: 29AABCU9603R1ZM &nbsp;·&nbsp; PAN: AABCU9603R
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Sector 62, Noida, UP 201309 &nbsp;·&nbsp; Last updated: June 2025
          </p>
        </div>

      </main>
    </div>
  );
}

const styles = {
  intro: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#374151",
    marginBottom: "40px",
    padding: "20px 24px",
    backgroundColor: "#f0f4ff",
    borderLeft: "4px solid #0B1437",
    borderRadius: "0 8px 8px 0",
  } as React.CSSProperties,
  section: {
    marginBottom: "44px",
  } as React.CSSProperties,
  h2: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0B1437",
    marginBottom: "16px",
    paddingBottom: "10px",
    borderBottom: "2px solid #C9A227",
    letterSpacing: "-0.01em",
  } as React.CSSProperties,
  p: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#374151",
    marginBottom: "14px",
  } as React.CSSProperties,
  ul: {
    paddingLeft: "20px",
    marginBottom: "14px",
  } as React.CSSProperties,
  li: {
    fontSize: "15px",
    lineHeight: "1.8",
    color: "#374151",
    marginBottom: "10px",
  } as React.CSSProperties,
  link: {
    color: "#0B1437",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  } as React.CSSProperties,
  contactBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "20px 24px",
    marginTop: "16px",
  } as React.CSSProperties,
  contactLine: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#374151",
    margin: "0 0 6px",
  } as React.CSSProperties,
};
