import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/products";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  try {
    const { businessType, budget, requirement, timeline } = await req.json();

    if (!businessType) {
      return NextResponse.json({ error: "businessType required" }, { status: 400 });
    }

    const productList = PRODUCTS.map(p =>
      `- ${p.slug}: "${p.name}" | Basic: ₹${p.basicPrice.toLocaleString("en-IN")} | Premium: ₹${p.premiumPrice.toLocaleString("en-IN")} | Category: ${p.category}`
    ).join("\n");

    const prompt = `You are a product consultant for KVL TECH, a website/software development company in India.

A potential customer has shared their requirements. Recommend the BEST matching product and plan from the list below.

Customer Requirements:
- Business Type: ${businessType}
- Budget: ${budget || "Not specified"}
- Requirement: ${requirement || "General digital presence"}
- Timeline: ${timeline || "Flexible"}

Available Products:
${productList}

Reply ONLY with this exact format (no extra text):
SLUG: [product-slug]
PLAN: [Basic/Premium/Custom]
REASON: [2 sentences in Hinglish explaining why this is perfect for them]
SAVING: [One line about ROI or benefit in Hinglish, e.g. "Restaurant mein 40% zyada online orders aa sakte hain"]`;

    const res = await fetch(GROQ_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.4,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    // Parse response
    const slugMatch  = raw.match(/SLUG:\s*([a-z0-9-]+)/i);
    const planMatch  = raw.match(/PLAN:\s*(Basic|Premium|Custom)/i);
    const reasonMatch = raw.match(/REASON:\s*(.+?)(?:\n|$)/i);
    const savingMatch = raw.match(/SAVING:\s*(.+?)(?:\n|$)/i);

    if (!slugMatch) {
      return NextResponse.json({ error: "Could not parse recommendation" }, { status: 500 });
    }

    const slug = slugMatch[1].toLowerCase();
    const product = PRODUCTS.find(p => p.slug === slug) || PRODUCTS[0];

    return NextResponse.json({
      slug: product.slug,
      name: product.name,
      plan: planMatch?.[1] || "Premium",
      reason: reasonMatch?.[1]?.trim() || `${product.name} aapke ${businessType} business ke liye perfect hai.`,
      saving: savingMatch?.[1]?.trim() || "Digital presence se business 2x badhega.",
      basicPrice: product.basicPrice,
      premiumPrice: product.premiumPrice,
      tagline: product.tagline,
      photo: product.photo,
    });
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
