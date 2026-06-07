import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | KVL TECH",
  description:
    "KVL TECH's Privacy Policy explains how we collect, use, store, and protect your personal data in compliance with the Indian IT Act 2000 and GDPR.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
          KVL TECH (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting and respecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your personal
          information when you visit <a href="https://kvlbusinesssolutions.com" style={styles.link}>kvlbusinesssolutions.com</a> or
          engage with our services. This policy is compliant with the <strong>Information Technology
          Act, 2000</strong> and the <strong>IT (Reasonable Security Practices and Procedures and Sensitive
          Personal Data or Information) Rules, 2011</strong>, and follows the principles of the
          European Union&apos;s <strong>General Data Protection Regulation (GDPR)</strong> to the extent applicable
          to Indian businesses serving international users.
        </p>

        {/* Section 1 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>1. Introduction</h2>
          <p style={styles.p}>
            KVL TECH (operating as KVL Business Solutions) is a digital technology company
            headquartered at Sector 62, Noida, Uttar Pradesh 201309, India. We provide website
            development, custom software, SaaS products, AI solutions, and marketing automation
            services to clients across India and globally.
          </p>
          <p style={styles.p}>
            This Privacy Policy applies to all personal data collected through our website, client
            portal, contact forms, payment flows, support channels, and any other touchpoint where
            you interact with KVL TECH. By using our website or services, you consent to the data
            practices described in this policy.
          </p>
          <p style={styles.p}>
            We only collect information that is necessary for legitimate business purposes, and we
            handle it with care, transparency, and respect for your rights.
          </p>
        </section>

        {/* Section 2 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>2. Information We Collect</h2>
          <p style={styles.p}>
            We collect information from you in the following ways:
          </p>

          <h3 style={styles.h3}>a) Information You Provide Directly</h3>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Contact &amp; Inquiry Forms:</strong> When you submit a contact, inquiry, or quote request form, we collect your name, email address, phone number, company name, and the message you write.</li>
            <li style={styles.li}><strong>Account Registration:</strong> When you create a client portal account, we collect your name, email address, phone number, and a securely hashed password. We never store passwords in plain text.</li>
            <li style={styles.li}><strong>Support Tickets:</strong> When you raise a support ticket, we collect your name, email, order reference, and the description of your issue.</li>
            <li style={styles.li}><strong>Project Briefings:</strong> During project onboarding, you may provide us with business details, branding assets, and content. This information is used solely to deliver your project.</li>
          </ul>

          <h3 style={styles.h3}>b) Payment Information</h3>
          <p style={styles.p}>
            All payments are processed by <strong>Razorpay</strong>, a PCI-DSS Level 1 certified payment
            gateway. KVL TECH <strong>does not collect, store, or have access to your credit card number,
            debit card number, CVV, bank account details, or UPI PIN</strong>. This sensitive payment
            information is entered directly on Razorpay&apos;s secure interface and transmitted directly
            to them. KVL TECH only receives a payment confirmation reference and the amount paid.
          </p>

          <h3 style={styles.h3}>c) Automatically Collected Information</h3>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>IP Address:</strong> Your IP address is collected automatically when you visit our website and may be used for security monitoring, fraud prevention, and geographic analytics.</li>
            <li style={styles.li}><strong>Cookies:</strong> We use cookies to maintain session state, remember your preferences, and track website usage. See Section 5 (Cookies Policy) for full details.</li>
            <li style={styles.li}><strong>UTM Parameters:</strong> If you arrive at our website via a marketing campaign link containing UTM parameters (e.g., utm_source, utm_medium, utm_campaign), these are stored to help us understand the effectiveness of our marketing efforts. This data is anonymous at the campaign level.</li>
            <li style={styles.li}><strong>Device &amp; Browser Information:</strong> We may collect information about the device and browser you use to access our website, including browser type, operating system, screen resolution, and referral URL, for analytics and compatibility purposes.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>3. How We Use Your Information</h2>
          <p style={styles.p}>
            KVL TECH uses the information we collect for the following purposes:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Order Processing &amp; Service Delivery:</strong> To process your payments, manage your orders, deliver purchased products and services, and communicate project updates and delivery confirmations.</li>
            <li style={styles.li}><strong>Customer Support:</strong> To respond to your inquiries, resolve support tickets, troubleshoot issues, and provide technical assistance related to your account or projects.</li>
            <li style={styles.li}><strong>Account Management:</strong> To create and manage your client portal account, authenticate your identity, and ensure secure access to your account and order history.</li>
            <li style={styles.li}><strong>Marketing Communications (with consent):</strong> To send you newsletters, product announcements, promotional offers, and updates about KVL TECH services — but only if you have opted in to receive such communications. You may unsubscribe at any time via the unsubscribe link in any email or by contacting us directly.</li>
            <li style={styles.li}><strong>Service Improvement:</strong> To analyse usage patterns, understand which features are most valuable, identify bugs and performance issues, and improve our website and services over time.</li>
            <li style={styles.li}><strong>Legal &amp; Compliance:</strong> To comply with applicable Indian laws, respond to lawful requests from government authorities, enforce our Terms of Service, and protect the legal rights of KVL TECH and our clients.</li>
            <li style={styles.li}><strong>Fraud Prevention &amp; Security:</strong> To detect, investigate, and prevent fraudulent transactions, unauthorised access, and other illegal activities.</li>
          </ul>
          <p style={styles.p}>
            We do not sell, rent, or trade your personal information to any third parties for their
            own marketing purposes.
          </p>
        </section>

        {/* Section 4 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>4. Third-Party Services</h2>
          <p style={styles.p}>
            To operate our business effectively, KVL TECH uses a small set of trusted third-party
            service providers. In each case, only the minimum data necessary is shared, and all
            providers are bound by their own privacy and security obligations:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <strong>Razorpay (Payment Processing):</strong> We use Razorpay to process all online payments.
              When you make a payment, you interact directly with Razorpay&apos;s secure checkout interface.
              KVL TECH shares only your name, email, phone number, and order amount with Razorpay
              for payment processing. Card details are never shared with or stored by KVL TECH.
              Razorpay&apos;s privacy policy is available at <a href="https://razorpay.com/privacy/" style={styles.link} target="_blank" rel="noopener noreferrer">razorpay.com/privacy</a>.
            </li>
            <li style={styles.li}>
              <strong>Resend (Transactional Emails):</strong> We use Resend to send transactional emails such
              as order confirmations, password reset links, support ticket notifications, and invoice
              copies. Resend receives your email address and the content of the email only. We do not
              share unnecessary personal data with Resend beyond what is required to deliver the email.
            </li>
            <li style={styles.li}>
              <strong>Groq AI (Chatbot):</strong> Our website features an AI-powered chatbot for answering
              questions about our services. This chatbot is powered by Groq&apos;s language model API.
              Messages you send to the chatbot are processed by Groq&apos;s servers. We do not associate
              chatbot conversations with your personal account unless you explicitly identify yourself.
              We recommend you avoid sharing sensitive personal or financial information via the chatbot.
              Minimal session data is shared with Groq for the sole purpose of generating a response.
            </li>
          </ul>
          <p style={styles.p}>
            We do not use Google Analytics, Meta Pixel, or other advertising trackers. We do not
            share your data with advertisers.
          </p>
        </section>

        {/* Section 5 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>5. Cookies Policy</h2>
          <p style={styles.p}>
            Our website uses cookies — small text files stored on your device — to deliver a better
            user experience. We use the following categories of cookies:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>
              <strong>Essential Cookies:</strong> These cookies are strictly necessary for the website to
              function. They include session cookies for authentication (keeping you logged in), CSRF
              protection tokens, and shopping cart state. You cannot opt out of essential cookies
              without affecting core website functionality.
            </li>
            <li style={styles.li}>
              <strong>Analytics Cookies:</strong> We use lightweight, privacy-respecting analytics to
              understand how visitors interact with our website — which pages are most visited, how
              long users stay, and where they come from. This data is aggregated and anonymised.
              You may opt out of analytics cookies through your browser settings or a cookie consent
              prompt.
            </li>
            <li style={styles.li}>
              <strong>UTM Tracking Cookies:</strong> When you arrive at our website via a marketing campaign
              link, UTM parameters (source, medium, campaign name) are stored in a session cookie
              to attribute conversions to the correct marketing channel. This is for internal
              marketing analytics only and does not involve third-party ad networks.
            </li>
            <li style={styles.li}>
              <strong>Preference Cookies:</strong> These cookies remember your preferences such as language
              selection and theme (light/dark mode) to personalise your experience on return visits.
            </li>
          </ul>
          <p style={styles.p}>
            You can control and manage cookies through your browser settings. Most browsers allow you
            to refuse or delete cookies. Note that disabling essential cookies may prevent certain
            parts of our website from functioning correctly.
          </p>
        </section>

        {/* Section 6 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>6. Data Security</h2>
          <p style={styles.p}>
            KVL TECH implements commercially reasonable technical and organisational security measures
            to protect your personal data from unauthorised access, alteration, disclosure, or
            destruction:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security). Our website enforces HTTPS on all pages.</li>
            <li style={styles.li}><strong>Password Hashing:</strong> User passwords are never stored in plain text. We use industry-standard cryptographic hashing algorithms (bcrypt) with salt to store password hashes securely.</li>
            <li style={styles.li}><strong>Access Controls:</strong> Access to personal data is restricted to KVL TECH personnel who require it to perform their job functions. We enforce role-based access controls on all internal systems.</li>
            <li style={styles.li}><strong>Secure Infrastructure:</strong> Our servers and databases are hosted on reputable cloud providers with industry-standard security certifications, physical security controls, and regular security audits.</li>
            <li style={styles.li}><strong>Payment Security:</strong> We do not store any payment card data. All payment processing is handled entirely by Razorpay, which is PCI-DSS Level 1 compliant.</li>
          </ul>
          <p style={styles.p}>
            While we take every reasonable precaution, no method of data transmission over the internet
            or electronic storage is 100% secure. In the event of a data breach that affects your
            rights and freedoms, we will notify you as required under applicable law within 72 hours
            of becoming aware of the breach.
          </p>
        </section>

        {/* Section 7 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>7. Your Rights</h2>
          <p style={styles.p}>
            You have the following rights with respect to your personal data held by KVL TECH. To
            exercise any of these rights, please email us at{" "}
            <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a>{" "}
            with the subject line &ldquo;Data Rights Request&rdquo;. We will respond to all requests within
            <strong> 30 calendar days</strong>.
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Right to Access:</strong> You may request a copy of the personal data we hold about you, including information about how it is being used.</li>
            <li style={styles.li}><strong>Right to Correction:</strong> If any personal data we hold about you is inaccurate or incomplete, you have the right to request that we correct or update it.</li>
            <li style={styles.li}><strong>Right to Deletion:</strong> You may request that we delete your personal data. We will comply with deletion requests unless we are required to retain the data for legal, tax, or contractual reasons (e.g., financial records required under Indian tax law).</li>
            <li style={styles.li}><strong>Right to Restrict Processing:</strong> You may request that we restrict the processing of your personal data in certain circumstances — for example, while we verify the accuracy of data you have contested.</li>
            <li style={styles.li}><strong>Right to Data Portability:</strong> You may request a copy of your personal data in a structured, commonly used, machine-readable format (such as JSON or CSV) so that you can transfer it to another service.</li>
            <li style={styles.li}><strong>Right to Withdraw Consent:</strong> Where we process your data on the basis of your consent (e.g., marketing emails), you may withdraw that consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.</li>
            <li style={styles.li}><strong>Right to Object:</strong> You may object to our processing of your personal data for direct marketing purposes at any time.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>8. Data Retention</h2>
          <p style={styles.p}>
            We retain personal data only for as long as it is necessary to fulfil the purposes for
            which it was collected, or as required by applicable law:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}><strong>Active Accounts:</strong> Personal data associated with an active client account is retained for the duration of the account being active.</li>
            <li style={styles.li}><strong>Account Closure:</strong> Upon receipt of a written account closure request, we will delete or anonymise your personal data within <strong>30 calendar days</strong>, except for data that we are legally required to retain (e.g., financial transaction records, GST invoices, which must be retained for 7 years under Indian tax law).</li>
            <li style={styles.li}><strong>Inquiries &amp; Contact Forms:</strong> Data submitted via contact or inquiry forms is retained for 12 months and then automatically purged, unless a business relationship was established as a result of the inquiry.</li>
            <li style={styles.li}><strong>Support Tickets:</strong> Support ticket records are retained for 2 years from the date of resolution for quality assurance and dispute resolution purposes.</li>
            <li style={styles.li}><strong>Marketing Opt-Outs:</strong> If you unsubscribe from marketing communications, we retain a record of your email address on our suppression list to ensure we do not contact you again.</li>
          </ul>
        </section>

        {/* Section 9 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>9. Children&apos;s Privacy</h2>
          <p style={styles.p}>
            KVL TECH&apos;s services are intended for businesses and individuals aged 18 years and above.
            We do not knowingly collect, process, or store personal data from persons under the age
            of 18 (&ldquo;minors&rdquo;).
          </p>
          <p style={styles.p}>
            If you are a parent or guardian and believe that your child has provided us with personal
            information without your consent, please contact us immediately at{" "}
            <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a>.
            We will take prompt steps to delete such information from our systems.
          </p>
          <p style={styles.p}>
            We do not direct any of our marketing communications, website content, or services at
            children, and we do not use any data collection techniques specifically designed to
            attract or identify minors.
          </p>
        </section>

        {/* Section 10 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>10. Changes to This Policy</h2>
          <p style={styles.p}>
            KVL TECH may update this Privacy Policy from time to time to reflect changes in our
            business practices, applicable laws, or service offerings. When we make material changes,
            we will:
          </p>
          <ul style={styles.ul}>
            <li style={styles.li}>Update the &ldquo;Last updated&rdquo; date at the top of this page.</li>
            <li style={styles.li}>Post the revised policy on this page at <a href="https://kvlbusinesssolutions.com/privacy" style={styles.link}>kvlbusinesssolutions.com/privacy</a>.</li>
            <li style={styles.li}>Notify registered account holders of significant changes via email at the address associated with their account, where reasonably practicable.</li>
          </ul>
          <p style={styles.p}>
            Your continued use of our website or services after the effective date of any revised
            Privacy Policy constitutes your acceptance of the updated policy. We encourage you to
            review this page periodically to stay informed about how we protect your data.
          </p>
        </section>

        {/* Section 11 */}
        <section style={styles.section}>
          <h2 style={styles.h2}>11. Contact Us</h2>
          <p style={styles.p}>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your
            personal data, please contact our data privacy team:
          </p>
          <div style={styles.contactBox}>
            <p style={styles.contactLine}><strong>Company:</strong> KVL TECH (KVL Business Solutions)</p>
            <p style={styles.contactLine}><strong>Address:</strong> Sector 62, Noida, Uttar Pradesh 201309, India</p>
            <p style={styles.contactLine}><strong>Email:</strong> <a href="mailto:support@kvlbusinesssolutions.com" style={styles.link}>support@kvlbusinesssolutions.com</a></p>
            <p style={styles.contactLine}><strong>Phone:</strong> <a href="tel:+919942000413" style={styles.link}>+91 9942000413</a></p>
            <p style={styles.contactLine}><strong>Website:</strong> <a href="https://kvlbusinesssolutions.com" style={styles.link}>kvlbusinesssolutions.com</a></p>
          </div>
          <p style={{ ...styles.p, marginTop: "16px" }}>
            We aim to respond to all privacy-related queries within 30 days. For urgent matters or
            data breach notifications, please use the subject line &ldquo;URGENT — Data Privacy&rdquo; in your
            email.
          </p>
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
            <strong style={{ color: "#0B1437" }}>KVL TECH</strong> &nbsp;·&nbsp;
            Compliant with Indian IT Act 2000 &amp; GDPR &nbsp;·&nbsp; Last updated: June 2025
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Sector 62, Noida, UP 201309 &nbsp;·&nbsp; GST: 29AABCU9603R1ZM
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
  h3: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "10px",
    marginTop: "18px",
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
