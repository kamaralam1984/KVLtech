export interface IndustryTemplate {
  label: string
  promptHint: string
  sections: string[]
  colorSuggestion: string
  samplePrompt: string
  style: "modern" | "classic" | "minimal" | "corporate"
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  restaurant: {
    label: "Restaurant / Food",
    promptHint: "A {type} restaurant in {city} serving {cuisine} cuisine...",
    sections: ["hero", "about", "services", "testimonials", "pricing", "contact"],
    colorSuggestion: "#C9A227",
    samplePrompt:
      "A vegetarian restaurant in Pune serving Maharashtrian and South Indian cuisine with a family-friendly atmosphere and catering services",
    style: "modern",
  },
  healthcare: {
    label: "Healthcare / Clinic",
    promptHint: "A {specialty} clinic in {city} providing {services}...",
    sections: ["hero", "services", "about", "testimonials", "faq", "contact"],
    colorSuggestion: "#2196F3",
    samplePrompt:
      "A multi-specialty clinic in Hyderabad offering general medicine, pediatrics, and diagnostic services with experienced doctors and modern equipment",
    style: "classic",
  },
  education: {
    label: "Education / Coaching",
    promptHint: "A {type} coaching institute in {city} for {subjects}...",
    sections: ["hero", "services", "about", "pricing", "testimonials", "faq", "contact"],
    colorSuggestion: "#4CAF50",
    samplePrompt:
      "A UPSC and MPSC coaching institute in Nagpur with experienced faculty, study materials, and online/offline batches for competitive exam preparation",
    style: "modern",
  },
  realestate: {
    label: "Real Estate",
    promptHint: "A real estate agency in {city} dealing in {property types}...",
    sections: ["hero", "services", "portfolio", "about", "testimonials", "contact"],
    colorSuggestion: "#795548",
    samplePrompt:
      "A real estate agency in Bangalore specializing in residential apartments, commercial spaces, and land deals in Electronic City and Whitefield areas",
    style: "corporate",
  },
  legal: {
    label: "Legal / Advocate",
    promptHint: "A law firm in {city} specializing in {practice areas}...",
    sections: ["hero", "about", "services", "testimonials", "faq", "contact"],
    colorSuggestion: "#37474F",
    samplePrompt:
      "A law firm in Delhi specializing in corporate law, intellectual property, civil litigation, and family matters with 15+ years of courtroom experience",
    style: "classic",
  },
  cafinance: {
    label: "CA / Finance",
    promptHint: "A CA firm in {city} offering {services}...",
    sections: ["hero", "services", "about", "pricing", "testimonials", "faq", "contact"],
    colorSuggestion: "#1565C0",
    samplePrompt:
      "A CA firm in Mumbai offering GST filing, income tax returns, company registration, audit services, and financial advisory for SMEs and startups",
    style: "corporate",
  },
  retail: {
    label: "Retail / E-commerce",
    promptHint: "A {product} retail store in {city} selling {categories}...",
    sections: ["hero", "services", "portfolio", "pricing", "testimonials", "contact"],
    colorSuggestion: "#E91E63",
    samplePrompt:
      "A fashion and lifestyle retail store in Jaipur selling ethnic wear, western outfits, accessories, and home decor with online and offline presence",
    style: "modern",
  },
  technology: {
    label: "Technology / IT",
    promptHint: "A tech startup in {city} building {products/services}...",
    sections: ["hero", "services", "about", "pricing", "portfolio", "testimonials", "faq", "contact"],
    colorSuggestion: "#6200EA",
    samplePrompt:
      "A tech startup in Bangalore building AI-powered SaaS tools for small businesses including CRM, inventory management, and automated billing solutions",
    style: "modern",
  },
  manufacturing: {
    label: "Manufacturing / Industrial",
    promptHint: "A manufacturing company in {city} producing {products}...",
    sections: ["hero", "about", "services", "portfolio", "testimonials", "contact"],
    colorSuggestion: "#FF6F00",
    samplePrompt:
      "A manufacturing company in Pune producing precision auto components, industrial fittings, and custom metal fabrication for OEM and aftermarket clients",
    style: "corporate",
  },
  ngo: {
    label: "NGO / Non-Profit",
    promptHint: "An NGO in {city} working for {cause}...",
    sections: ["hero", "about", "services", "testimonials", "cta", "contact"],
    colorSuggestion: "#00897B",
    samplePrompt:
      "An NGO in Rajasthan working for rural women empowerment through skill development, microfinance support, and digital literacy programs in 50+ villages",
    style: "minimal",
  },
}

export const INDUSTRY_LIST = Object.entries(INDUSTRY_TEMPLATES).map(([key, val]) => ({
  key,
  label: val.label,
}))

export function getTemplate(industry: string): IndustryTemplate | null {
  return INDUSTRY_TEMPLATES[industry] || null
}
