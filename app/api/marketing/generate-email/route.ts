import { NextRequest, NextResponse } from 'next/server';

async function generateWithAI(prompt: string): Promise<string> {
  // Try Groq first (fastest, free)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && !groqKey.startsWith('gsk_placeholder')) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.choices?.[0]?.message?.content || '';
      }
    } catch {}
  }

  // Try Gemini (free fallback)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (res.ok) {
        const d = await res.json();
        return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch {}
  }

  // Try Cohere (free fallback)
  const cohereKey = process.env.COHERE_API_KEY;
  if (cohereKey) {
    try {
      const res = await fetch('https://api.cohere.com/v1/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cohereKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'command-light', prompt, max_tokens: 500 }),
      });
      if (res.ok) {
        const d = await res.json();
        return d.generations?.[0]?.text || '';
      }
    } catch {}
  }

  return '';
}

export async function POST(request: NextRequest) {
  const { businessName, ownerName, businessType, city, website, phone } = await request.json();

  const prompt = `Write a SHORT, personalized cold email in Hinglish (mix of Hindi and English) from KVL TECH to a business owner.

Business Details:
- Business Name: ${businessName}
- Owner: ${ownerName || 'Business Owner'}
- Type: ${businessType}
- City: ${city}
- Website: ${website || 'No website yet'}

KVL TECH sells ready-made, branded websites:
- ${businessType} website: Starting ₹12,999
- 3-5 days delivery
- Full branding with their company name/logo
- 1,200+ clients across India

Write the email:
- Subject line first (on its own line, starting with "Subject: ")
- Then the email body
- Max 150 words
- Hinglish tone (friendly, not formal)
- Mention their specific business name and city
- Create FOMO — their competitors are already online
- End with clear CTA: reply to this email or call +91 9942000413
- Mention FREE domain+hosting with Premium plan
- Sign off as "Kavya, KVL TECH"

ONLY output subject line + email body. No extra explanation.`;

  const aiContent = await generateWithAI(prompt);

  if (!aiContent) {
    // Template fallback
    return NextResponse.json({
      subject: `${businessName} ke liye professional website — KVL TECH Special Offer`,
      body: `Namaste ${ownerName || businessName} Ji,\n\nMain Kavya hoon, KVL TECH se. Aapka ${businessName} ${city} mein dekha — bahut achha ${businessType} hai!\n\nLekin kya aapka ${businessType} online hai? ${city} mein aapke competitors already digital ho gaye hain. Professional website se daily naye customers milte hain.\n\nKVL TECH mein ${businessType} website sirf ₹12,999 mein — 3-5 din mein ready, aapke naam ke saath!\n\n✅ Premium plan mein FREE Domain + Hosting (1 year)\n✅ 1,200+ satisfied clients\n✅ 100% quality guaranteed\n\nAaj hi reply karein ya call karein: +91 9942000413\n\nKavya\nKVL TECH`,
      provider: 'template'
    });
  }

  // Parse subject and body from AI output
  const lines = aiContent.trim().split('\n');
  const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
  const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : `${businessName} ke liye website — KVL TECH`;
  const body = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();

  return NextResponse.json({ subject, body, provider: 'ai' });
}
