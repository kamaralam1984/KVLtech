import Groq from "groq-sdk"

function getGroq() {
  if (!process.env.GROQ_API_KEY) return null
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export interface WebsiteSection {
  type: "hero" | "about" | "services" | "portfolio" | "testimonials" | "pricing" | "contact" | "faq" | "cta"
  heading: string
  subheading?: string
  content: string
  items?: Array<{ title: string; description: string; icon?: string; price?: string }>
  cta?: { text: string; url: string }
}

export interface GeneratedWebsite {
  businessName: string
  tagline: string
  description: string
  industry: string
  primaryColor: string
  fontStyle: "modern" | "classic" | "minimal" | "bold"
  sections: WebsiteSection[]
  seoTitle: string
  seoDescription: string
  keywords: string[]
  pages: string[]
}

export async function generateWebsiteContent(
  prompt: string,
  options: {
    industry?: string
    style?: "modern" | "classic" | "minimal" | "corporate"
    pages?: string[]
    language?: "english" | "hindi" | "both"
  }
): Promise<GeneratedWebsite> {
  const groq = getGroq()

  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const systemPrompt = `You are an expert website content creator for KVL TECH, a software development company. Generate professional website content based on user requirements.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "businessName": "Business Name",
  "tagline": "Short compelling tagline",
  "description": "2-3 sentence business description",
  "industry": "industry name",
  "primaryColor": "#hexcolor",
  "fontStyle": "modern|classic|minimal|bold",
  "sections": [
    {
      "type": "hero",
      "heading": "Main hero heading",
      "subheading": "Hero subheading",
      "content": "Hero paragraph",
      "cta": {"text": "Button text", "url": "#contact"}
    },
    {
      "type": "services",
      "heading": "Our Services",
      "content": "Brief intro",
      "items": [
        {"title": "Service Name", "description": "Service description", "icon": "emoji"}
      ]
    },
    {
      "type": "about",
      "heading": "About Us",
      "content": "About section content (2-3 paragraphs)"
    },
    {
      "type": "testimonials",
      "heading": "What Our Clients Say",
      "content": "Intro text",
      "items": [
        {"title": "Client Name", "description": "Testimonial text"}
      ]
    },
    {
      "type": "pricing",
      "heading": "Our Packages",
      "items": [
        {"title": "Package name", "description": "What's included", "price": "₹X,XXX"}
      ]
    },
    {
      "type": "faq",
      "heading": "Frequently Asked Questions",
      "items": [
        {"title": "Question?", "description": "Answer"}
      ]
    },
    {
      "type": "contact",
      "heading": "Get In Touch",
      "content": "Contact section text",
      "cta": {"text": "Book Free Consultation", "url": "#contact"}
    }
  ],
  "seoTitle": "Business Name | Tagline",
  "seoDescription": "SEO meta description (150 chars)",
  "keywords": ["keyword1", "keyword2"],
  "pages": ["Home", "About", "Services", "Portfolio", "Contact"]
}`

  const userPrompt = `Create a complete website for:
${prompt}

Industry: ${options.industry || "business"}
Style preference: ${options.style || "modern"}
${options.language === "hindi" ? "Generate content in Hindi" : "Generate content in English"}

Generate all sections with realistic, professional content. Make it specific to their industry, not generic.`

  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content || "{}"
  const match = text.match(/\{[\s\S]*\}/)

  try {
    return JSON.parse(match ? match[0] : "{}")
  } catch {
    return fallbackWebsite(options.industry)
  }
}

// Generate a specific section
export async function generateSection(
  sectionType: WebsiteSection["type"],
  context: { businessName: string; industry: string; tone?: string }
): Promise<WebsiteSection> {
  const groq = getGroq()

  if (!groq) {
    return { type: sectionType, heading: `${sectionType} Section`, content: "AI unavailable." }
  }

  const prompt = `Generate a ${sectionType} section for ${context.businessName}, a ${context.industry} business.
Tone: ${context.tone || "professional"}
Return ONLY JSON (no markdown): {"type": "${sectionType}", "heading": "...", "subheading": "...", "content": "...", "items": [{"title": "...", "description": "..."}]}`

  const response = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content || "{}"
  const match = text.match(/\{[\s\S]*\}/)
  try {
    return JSON.parse(match ? match[0] : "{}")
  } catch {
    return { type: sectionType, heading: `${sectionType} Section`, content: "" }
  }
}

function fallbackWebsite(industry?: string): GeneratedWebsite {
  return {
    businessName: "Your Business",
    tagline: "Professional Services You Can Trust",
    description: "We provide professional services tailored to your needs.",
    industry: industry || "business",
    primaryColor: "#C9A227",
    fontStyle: "modern",
    sections: [
      {
        type: "hero",
        heading: "Welcome to Your Business",
        subheading: "Professional Services You Can Trust",
        content: "We deliver exceptional results for our clients.",
        cta: { text: "Get Started", url: "#contact" },
      },
      {
        type: "services",
        heading: "Our Services",
        content: "We offer a wide range of professional services:",
        items: [
          { title: "Consultation", description: "Expert advice tailored to your needs.", icon: "💡" },
          { title: "Implementation", description: "Seamless execution of your projects.", icon: "⚡" },
          { title: "Support", description: "Ongoing support and maintenance.", icon: "🛠️" },
        ],
      },
      {
        type: "contact",
        heading: "Contact Us",
        content: "Get in touch with us today to discuss your requirements.",
        cta: { text: "Book Free Consultation", url: "#contact" },
      },
    ],
    seoTitle: "Your Business | Professional Services",
    seoDescription: "We provide professional services tailored to your needs.",
    keywords: ["professional services", "business", "consultation"],
    pages: ["Home", "About", "Services", "Contact"],
  }
}

// Export website as HTML
export function websiteToHTML(website: GeneratedWebsite): string {
  const sections = website.sections
    .map((section) => {
      switch (section.type) {
        case "hero":
          return `<section class="hero" style="background: linear-gradient(135deg, ${website.primaryColor}22, #f8f9fa); padding: 80px 20px; text-align: center;">
  <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; color: #1a1a2e;">${section.heading}</h1>
  ${section.subheading ? `<h2 style="font-size: 1.3rem; color: #666; margin-bottom: 20px;">${section.subheading}</h2>` : ""}
  <p style="font-size: 1.1rem; max-width: 600px; margin: 0 auto 32px; color: #555;">${section.content}</p>
  ${section.cta ? `<a href="${section.cta.url}" style="background: ${website.primaryColor}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1rem;">${section.cta.text}</a>` : ""}
</section>`

        case "services":
          return `<section style="padding: 60px 20px; max-width: 1100px; margin: 0 auto;">
  <h2 style="text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 8px;">${section.heading}</h2>
  <p style="text-align: center; color: #666; margin-bottom: 40px;">${section.content}</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
    ${(section.items || [])
      .map(
        (item) => `
    <div style="background: white; border: 1px solid #eee; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="font-size: 2rem; margin-bottom: 12px;">${item.icon || "⚡"}</div>
      <h3 style="font-weight: 700; margin-bottom: 8px; color: #1a1a2e;">${item.title}</h3>
      <p style="color: #666; font-size: 0.95rem;">${item.description}</p>
    </div>`
      )
      .join("")}
  </div>
</section>`

        case "about":
          return `<section style="padding: 60px 20px; max-width: 800px; margin: 0 auto; text-align: center;">
  <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 24px;">${section.heading}</h2>
  <p style="font-size: 1.05rem; color: #555; line-height: 1.8;">${section.content}</p>
</section>`

        case "testimonials":
          return `<section style="padding: 60px 20px; background: #f8f9fa;">
  <h2 style="text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 8px;">${section.heading}</h2>
  <p style="text-align: center; color: #666; margin-bottom: 40px;">${section.content}</p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto;">
    ${(section.items || [])
      .map(
        (item) => `
    <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <p style="color: #555; font-style: italic; margin-bottom: 16px;">"${item.description}"</p>
      <p style="font-weight: 700; color: ${website.primaryColor};">— ${item.title}</p>
    </div>`
      )
      .join("")}
  </div>
</section>`

        case "pricing":
          return `<section style="padding: 60px 20px; background: #f8f9fa;">
  <h2 style="text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 40px;">${section.heading}</h2>
  <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; max-width: 1100px; margin: 0 auto;">
    ${(section.items || [])
      .map(
        (item, i) => `
    <div style="background: white; border: ${i === 1 ? `2px solid ${website.primaryColor}` : "1px solid #eee"}; border-radius: 16px; padding: 32px; min-width: 250px; text-align: center; flex: 1; max-width: 320px;">
      ${i === 1 ? `<div style="background: ${website.primaryColor}; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 12px;">POPULAR</div>` : ""}
      <h3 style="font-weight: 700; font-size: 1.2rem; margin-bottom: 8px;">${item.title}</h3>
      ${item.price ? `<div style="font-size: 2rem; font-weight: 800; color: ${website.primaryColor}; margin: 12px 0;">${item.price}</div>` : ""}
      <p style="color: #666; font-size: 0.9rem; line-height: 1.6;">${item.description}</p>
    </div>`
      )
      .join("")}
  </div>
</section>`

        case "faq":
          return `<section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 32px; text-align: center;">${section.heading}</h2>
  ${(section.items || [])
    .map(
      (item) => `
  <details style="border: 1px solid #eee; border-radius: 8px; margin-bottom: 12px; padding: 16px;">
    <summary style="font-weight: 600; cursor: pointer; color: #1a1a2e; list-style: none; display: flex; justify-content: space-between; align-items: center;">${item.title} <span>+</span></summary>
    <p style="margin-top: 12px; color: #666; line-height: 1.7;">${item.description}</p>
  </details>`
    )
    .join("")}
</section>`

        case "portfolio":
          return `<section style="padding: 60px 20px; max-width: 1100px; margin: 0 auto;">
  <h2 style="text-align: center; font-size: 2rem; font-weight: 700; margin-bottom: 40px;">${section.heading}</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
    ${(section.items || [])
      .map(
        (item) => `
    <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="height: 160px; background: linear-gradient(135deg, ${website.primaryColor}33, #f0f0f0); display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">${item.icon || "🏆"}</div>
      <div style="padding: 20px;">
        <h3 style="font-weight: 700; margin-bottom: 8px;">${item.title}</h3>
        <p style="color: #666; font-size: 0.9rem;">${item.description}</p>
      </div>
    </div>`
      )
      .join("")}
  </div>
</section>`

        case "cta":
          return `<section style="padding: 80px 20px; background: linear-gradient(135deg, #1a1a2e, #16213e); text-align: center;">
  <h2 style="font-size: 2rem; font-weight: 700; color: white; margin-bottom: 16px;">${section.heading}</h2>
  ${section.subheading ? `<p style="color: #aaa; margin-bottom: 32px; font-size: 1.1rem;">${section.subheading}</p>` : `<p style="color: #aaa; margin-bottom: 32px;">${section.content}</p>`}
  ${section.cta ? `<a href="${section.cta.url}" style="background: ${website.primaryColor}; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.05rem;">${section.cta.text}</a>` : ""}
</section>`

        default:
          return `<section style="padding: 60px 20px; text-align: center; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 16px;">${section.heading}</h2>
  <p style="color: #666; max-width: 600px; margin: 0 auto; line-height: 1.8;">${section.content}</p>
  ${section.cta ? `<br><a href="${section.cta.url}" style="display: inline-block; margin-top: 24px; background: ${website.primaryColor}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">${section.cta.text}</a>` : ""}
</section>`
      }
    })
    .join("\n\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.seoTitle}</title>
  <meta name="description" content="${website.seoDescription}">
  <meta name="keywords" content="${website.keywords.join(", ")}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; background: #fff; }
    nav { background: white; border-bottom: 1px solid #eee; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    nav .logo { font-weight: 800; font-size: 1.3rem; color: ${website.primaryColor}; }
    nav .nav-links a { margin-left: 24px; color: #555; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
    nav .nav-links a:hover { color: ${website.primaryColor}; }
    footer { background: #1a1a2e; color: white; text-align: center; padding: 40px 20px; margin-top: 0; }
    footer .footer-grid { display: flex; flex-wrap: wrap; gap: 32px; justify-content: center; margin-bottom: 32px; text-align: left; }
    footer .footer-col h4 { color: ${website.primaryColor}; margin-bottom: 12px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
    footer .footer-col p, footer .footer-col a { color: #aaa; font-size: 0.9rem; line-height: 2; text-decoration: none; display: block; }
    footer .footer-bottom { border-top: 1px solid #333; padding-top: 24px; color: #aaa; font-size: 0.85rem; }
  </style>
</head>
<body>
  <nav>
    <div class="logo">${website.businessName}</div>
    <div class="nav-links">${website.pages.map((p) => `<a href="#">${p}</a>`).join("")}</div>
  </nav>

  ${sections}

  <footer>
    <div class="footer-grid">
      <div class="footer-col">
        <h4>${website.businessName}</h4>
        <p>${website.tagline}</p>
        <p style="margin-top: 8px; font-size: 0.85rem; max-width: 220px;">${website.description}</p>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        ${website.pages.map((p) => `<a href="#">${p}</a>`).join("")}
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <p>info@${website.businessName.toLowerCase().replace(/\s+/g, "")}.com</p>
        <p>+91 98765 43210</p>
        <p>India</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>${website.businessName} — ${website.tagline}</p>
      <p style="margin-top: 8px;">© ${new Date().getFullYear()} All rights reserved. Built with <strong style="color: #C9A227;">KVL TECH</strong></p>
    </div>
  </footer>
</body>
</html>`
}
