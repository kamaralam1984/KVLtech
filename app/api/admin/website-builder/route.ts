import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import {
  generateWebsiteContent,
  generateSection,
  websiteToHTML,
  type GeneratedWebsite,
  type WebsiteSection,
} from "@/lib/website-builder"
import type { WebsiteProject, BuilderElement, Section, GlobalStyles } from "@/app/admin/website-builder/builder-types"

// ─── HTML Export for WebsiteProject ──────────────────────────────────────────
function elementToHTML(el: BuilderElement, gs: GlobalStyles): string {
  const cfg = el.config as Record<string, unknown>
  const st = Object.entries(el.styles || {}).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`).join(';')
  const wrap = (inner: string, tag = 'div') => `<${tag} style="${st}">${inner}</${tag}>`

  switch (el.type) {
    case 'heading': {
      const level = (cfg.level as number) || 2
      const text = (cfg.text as string) || 'Heading'
      return `<h${level} style="font-family:'${gs.headingFont}',sans-serif;${st}">${text}</h${level}>`
    }
    case 'paragraph': return `<p style="line-height:1.7;${st}">${cfg.text || ''}</p>`
    case 'richtext': return `<div style="${st}">${cfg.html || ''}</div>`
    case 'quote': return `<blockquote style="border-left:4px solid ${gs.primaryColor};padding-left:1.5rem;font-style:italic;${st}">${cfg.text || ''}</blockquote>`
    case 'list': {
      const items = (cfg.items as string[]) || []
      const tag = cfg.ordered ? 'ol' : 'ul'
      return `<${tag} style="padding-left:1.5rem;line-height:2;${st}">${items.map(i => `<li>${i}</li>`).join('')}</${tag}>`
    }
    case 'button': {
      const variant = (cfg.variant as string) || 'primary'
      const bgMap: Record<string,string> = { primary: gs.primaryColor, secondary: gs.secondaryColor, outline: 'transparent', ghost: 'transparent', link: 'transparent' }
      const colorMap: Record<string,string> = { primary: '#fff', secondary: '#fff', outline: gs.primaryColor, ghost: gs.primaryColor, link: gs.primaryColor }
      const border = (variant === 'outline') ? `2px solid ${gs.primaryColor}` : 'none'
      const size = (cfg.size as string) || 'md'
      const pMap: Record<string,string> = { sm: '6px 16px', md: '10px 24px', lg: '14px 32px' }
      return `<a href="${cfg.href || '#'}" style="display:inline-block;background:${bgMap[variant]||gs.primaryColor};color:${colorMap[variant]||'#fff'};border:${border};padding:${pMap[size]||pMap.md};border-radius:6px;font-weight:600;text-decoration:none;${st}">${cfg.label || 'Click Here'}</a>`
    }
    case 'image': return `<div style="${st}"><img src="${cfg.src}" alt="${cfg.alt||''}" style="width:100%;height:100%;object-fit:${cfg.fit||'cover'}" /></div>`
    case 'gallery': {
      const images = (cfg.images as Array<{src:string;alt:string}>) || []
      const cols = (cfg.columns as number) || 3
      return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${cfg.gap||16}px;${st}">${images.map(img => `<div style="overflow:hidden;border-radius:8px;aspect-ratio:4/3"><img src="${img.src}" alt="${img.alt||''}" style="width:100%;height:100%;object-fit:cover"/></div>`).join('')}</div>`
    }
    case 'marquee': {
      const items = (cfg.items as string[]) || []
      const sep = (cfg.separator as string) || ' · '
      const speed = (cfg.speed as number) || 30
      const text = [...items, ...items].join(sep)
      return `<div style="overflow:hidden;white-space:nowrap;${st}"><span style="display:inline-block;animation:marqueeScroll ${speed}s linear infinite">${text}</span></div>`
    }
    case 'video': {
      const src = cfg.src as string || ''
      if (src.includes('youtube') || src.includes('youtu.be')) {
        const vid = src.split('v=')[1]?.split('&')[0] || src.split('/').pop()
        return `<div style="${st}"><iframe width="100%" height="450" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe></div>`
      }
      return `<video src="${src}" ${cfg.controls?'controls':''} ${cfg.autoPlay?'autoplay':''} ${cfg.muted?'muted':''} ${cfg.loop?'loop':''} style="width:100%;${st}"></video>`
    }
    case 'divider': return `<hr style="border:none;border-top:1px solid rgba(0,0,0,0.15);margin:1rem 0;${st}" />`
    case 'spacer': return `<div style="height:${cfg.height||48}px"></div>`
    case 'iconbox': return wrap(`<div style="text-align:${cfg.align||'center'};padding:2rem 1.5rem"><div style="font-size:2.5rem;margin-bottom:1rem">${cfg.icon||'★'}</div><h4 style="font-weight:700;font-size:1.25rem;margin-bottom:.5rem;font-family:'${gs.headingFont}',sans-serif">${cfg.title||''}</h4><p style="color:#666;line-height:1.7">${cfg.description||''}</p></div>`)
    case 'counter': {
      const items = (cfg.items as Array<{value:number;label:string;prefix?:string;suffix?:string}>) || []
      return wrap(`<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:3rem;padding:2rem">${items.map(it => `<div style="text-align:center"><div style="font-size:3rem;font-weight:800;color:${gs.primaryColor}">${it.prefix||''}${it.value}${it.suffix||''}</div><div style="color:#666;margin-top:.5rem">${it.label}</div></div>`).join('')}</div>`)
    }
    case 'testimonial': {
      const rating = (cfg.rating as number) || 5
      return wrap(`<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:12px;padding:2.5rem;box-shadow:0 4px 24px rgba(0,0,0,.08)"><div style="color:#F59E0B;font-size:1.25rem;margin-bottom:1rem">${'★'.repeat(rating)}</div><p style="font-size:1.1rem;color:#555;font-style:italic;margin-bottom:1.5rem">"${cfg.text||''}"</p><strong>${cfg.name||''}</strong> <span style="color:#888;font-size:.875rem">· ${cfg.role||''}</span></div>`)
    }
    case 'pricing': {
      const plans = (cfg.plans as Array<{name:string;price:string;period:string;features:string[];cta:{label:string;href:string};highlighted:boolean;badge?:string}>) || []
      return wrap(`<div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center;padding:2rem 0">${plans.map(p => `<div style="flex:1 1 280px;max-width:320px;background:${p.highlighted?gs.secondaryColor:'#fff'};color:${p.highlighted?'#fff':'#333'};border:${p.highlighted?`2px solid ${gs.primaryColor}`:'1px solid #eee'};border-radius:16px;padding:2rem;position:relative">${p.badge?`<span style="position:absolute;top:-12px;right:16px;background:${gs.primaryColor};color:#fff;padding:2px 12px;border-radius:999px;font-size:.75rem;font-weight:700">${p.badge}</span>`:''}<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem">${p.name}</h3><div style="font-size:2.5rem;font-weight:800;color:${gs.primaryColor};margin-bottom:.25rem">${p.price}</div><div style="color:#888;font-size:.875rem;margin-bottom:1.5rem">${p.period}</div><ul style="list-style:none;padding:0;margin-bottom:2rem">${p.features.map(f=>`<li style="padding:.25rem 0">✓ ${f}</li>`).join('')}</ul><a href="${p.cta?.href||'#'}" style="display:block;text-align:center;padding:.75rem;border-radius:8px;background:${p.highlighted?gs.primaryColor:'transparent'};color:${p.highlighted?gs.secondaryColor:gs.primaryColor};border:2px solid ${gs.primaryColor};font-weight:700;text-decoration:none">${p.cta?.label||'Get Started'}</a></div>`).join('')}</div>`)
    }
    case 'accordion': {
      const items = (cfg.items as Array<{id:string;question:string;answer:string}>) || []
      return wrap(`<div style="max-width:800px;margin:0 auto">${items.map((it,i) => `<details style="border:1px solid #eee;border-radius:8px;margin-bottom:.5rem;overflow:hidden" ${i===0?'open':''}><summary style="padding:1rem 1.5rem;cursor:pointer;font-weight:600;font-size:1rem;list-style:none">${it.question}</summary><div style="padding:1rem 1.5rem;border-top:1px solid #eee;color:#555;line-height:1.7">${it.answer}</div></details>`).join('')}</div>`)
    }
    case 'tabs': {
      const items = (cfg.items as Array<{id:string;label:string;content:string}>) || []
      const tabBtns = items.map((t,i) => `<button onclick="document.querySelectorAll('.tab-content-${el.id}').forEach(x=>x.style.display='none');document.getElementById('tab-${el.id}-${t.id}').style.display='block';this.parentElement.querySelectorAll('button').forEach(b=>b.style.background='transparent');this.style.background='${gs.primaryColor}'" style="padding:.5rem 1.5rem;border:none;border-radius:6px;cursor:pointer;font-weight:600;background:${i===0?gs.primaryColor:'transparent'};color:${i===0?'#fff':'#555'}">${t.label}</button>`).join('')
      const panels = items.map((t,i) => `<div id="tab-${el.id}-${t.id}" class="tab-content-${el.id}" style="padding:1.5rem;display:${i===0?'block':'none'}">${t.content}</div>`).join('')
      return wrap(`<div><div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">${tabBtns}</div><div style="border:1px solid #eee;border-radius:8px">${panels}</div></div>`)
    }
    case 'form': {
      const fields = (cfg.fields as Array<{id:string;type:string;label:string;placeholder?:string;required?:boolean;options?:string[]}>) || []
      const inputs = fields.map(f => {
        const req = f.required ? 'required' : ''
        if (f.type === 'textarea') return `<div style="margin-bottom:1rem"><label style="display:block;margin-bottom:.25rem;font-weight:500">${f.label}</label><textarea name="${f.id}" placeholder="${f.placeholder||''}" ${req} rows="4" style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px;font-family:inherit;resize:vertical"></textarea></div>`
        if (f.type === 'select') return `<div style="margin-bottom:1rem"><label style="display:block;margin-bottom:.25rem;font-weight:500">${f.label}</label><select name="${f.id}" ${req} style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px">${(f.options||[]).map(o=>`<option>${o}</option>`).join('')}</select></div>`
        return `<div style="margin-bottom:1rem"><label style="display:block;margin-bottom:.25rem;font-weight:500">${f.label}</label><input type="${f.type}" name="${f.id}" placeholder="${f.placeholder||''}" ${req} style="width:100%;padding:.5rem .75rem;border:1px solid #ddd;border-radius:6px" /></div>`
      }).join('')
      return wrap(`<form style="max-width:600px;margin:0 auto" onsubmit="event.preventDefault();this.innerHTML='<p style=color:green;font-size:1.1rem>${cfg.successMessage||'Thank you!'}</p>'">${inputs}<button type="submit" style="background:${gs.primaryColor};color:#fff;border:none;padding:.75rem 2.5rem;border-radius:8px;font-weight:700;font-size:1rem;cursor:pointer">${cfg.submitLabel||'Send'}</button></form>`)
    }
    case 'social': {
      const links = (cfg.links as Array<{platform:string;url:string}>) || []
      const colors: Record<string,string> = { facebook:'#1877F2', instagram:'#E4405F', twitter:'#1DA1F2', youtube:'#FF0000', linkedin:'#0A66C2', whatsapp:'#25D366' }
      const icons: Record<string,string> = { facebook:'f', instagram:'📷', twitter:'𝕏', youtube:'▶', linkedin:'in', whatsapp:'W' }
      return `<div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center;${st}">${links.map(l=>`<a href="${l.url}" style="width:44px;height:44px;border-radius:50%;background:${colors[l.platform]||'#666'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;text-decoration:none;font-size:.875rem">${icons[l.platform]||l.platform[0]?.toUpperCase()}</a>`).join('')}</div>`
    }
    case 'navbar': {
      const links = (cfg.links as Array<{label:string;href:string}>) || []
      return `<nav style="display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:${gs.secondaryColor};color:#fff;${st}"><span style="font-weight:800;font-size:1.25rem;color:${gs.primaryColor};font-family:'${gs.headingFont}',sans-serif">${cfg.logoText||'Brand'}</span><div style="display:flex;gap:1.5rem;align-items:center">${links.map(l=>`<a href="${l.href}" style="color:#fff;text-decoration:none;font-size:.9rem;font-weight:500">${l.label}</a>`).join('')}</div></nav>`
    }
    case 'footer': {
      const columns = (cfg.columns as Array<{heading:string;links:Array<{label:string;href:string}>}>) || []
      const socials = (cfg.socials as Array<{platform:string;url:string}>) || []
      const socColors: Record<string,string> = { facebook:'#1877F2', instagram:'#E4405F', twitter:'#1DA1F2', youtube:'#FF0000', linkedin:'#0A66C2', whatsapp:'#25D366' }
      return `<footer style="background:${gs.secondaryColor};color:#fff;padding:3rem 2rem 1.5rem;${st}"><div style="max-width:1280px;margin:0 auto"><div style="display:flex;flex-wrap:wrap;gap:2rem;margin-bottom:2rem">${columns.map(col=>`<div style="flex:1 1 160px"><h5 style="font-weight:700;margin-bottom:1rem;color:${gs.primaryColor}">${col.heading}</h5><ul style="list-style:none;padding:0">${col.links.map(l=>`<li style="margin-bottom:.5rem"><a href="${l.href}" style="color:#aaa;text-decoration:none;font-size:.875rem">${l.label}</a></li>`).join('')}</ul></div>`).join('')}</div>${cfg.tagline?`<p style="color:#888;margin-bottom:1rem;font-size:.875rem">${cfg.tagline}</p>`:''}<div style="display:flex;gap:.5rem;margin-bottom:1rem">${socials.map(s=>`<a href="${s.url}" style="width:36px;height:36px;border-radius:50%;background:${socColors[s.platform]||'#666'};display:inline-flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:.75rem">${s.platform[0]?.toUpperCase()}</a>`).join('')}</div><div style="border-top:1px solid rgba(255,255,255,.1);padding-top:1rem;color:#555;font-size:.8rem">© ${cfg.copyright||''}</div></div></footer>`
    }
    case 'hero': {
      const cta = cfg.cta as {label:string;href:string}|undefined
      const cta2 = cfg.secondaryCta as {label:string;href:string}|undefined
      const align = (cfg.align as string) || 'center'
      const overlay = (cfg.overlay as number) || 50
      const bgImg = cfg.bgImage as string
      return `<div style="position:relative;min-height:80vh;display:flex;align-items:center;justify-content:center;overflow:hidden;${st}">${bgImg?`<img src="${bgImg}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"/>`:''}<div style="position:absolute;inset:0;background:rgba(${gs.secondaryColor.match(/\d+/g)?.slice(0,3).join(',')||'11,20,55'},${overlay/100})"></div><div style="position:relative;text-align:${align};color:#fff;padding:4rem 2rem;max-width:900px;width:100%">${cfg.subheading?`<p style="color:${gs.primaryColor};font-weight:600;letter-spacing:.1em;margin-bottom:1rem;text-transform:uppercase;font-size:.875rem">${cfg.subheading}</p>`:''}<h1 style="font-size:clamp(2rem,5vw,4rem);font-weight:800;line-height:1.1;margin-bottom:1.5rem;font-family:'${gs.headingFont}',sans-serif">${cfg.heading||'Welcome'}</h1>${cfg.text?`<p style="font-size:1.25rem;opacity:.85;margin-bottom:2rem;max-width:600px;margin-left:auto;margin-right:auto">${cfg.text}</p>`:''}<div style="display:flex;gap:1rem;justify-content:${align==='center'?'center':align==='right'?'flex-end':'flex-start'};flex-wrap:wrap">${cta?`<a href="${cta.href}" style="background:${gs.primaryColor};color:#fff;padding:.875rem 2.5rem;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.1rem">${cta.label}</a>`:''} ${cta2?`<a href="${cta2.href}" style="border:2px solid rgba(255,255,255,.6);color:#fff;padding:.875rem 2.5rem;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.1rem">${cta2.label}</a>`:''}</div></div></div>`
    }
    case 'cta': {
      const cta = cfg.cta as {label:string;href:string}|undefined
      return `<div style="background:${cfg.bgColor||gs.secondaryColor};color:#fff;text-align:center;padding:4rem 2rem;${st}"><h2 style="font-size:2rem;font-weight:700;margin-bottom:1rem;font-family:'${gs.headingFont}',sans-serif">${cfg.heading||''}</h2><p style="opacity:.8;margin-bottom:2rem;font-size:1.1rem">${cfg.text||''}</p>${cta?`<a href="${cta.href}" style="background:${gs.primaryColor};color:#fff;padding:.875rem 2.5rem;border-radius:8px;font-weight:700;text-decoration:none;font-size:1.1rem">${cta.label}</a>`:''}</div>`
    }
    case 'map': {
      const addr = encodeURIComponent((cfg.address as string) || 'India')
      return `<div style="border-radius:12px;overflow:hidden;${st}"><iframe src="https://maps.google.com/maps?q=${addr}&output=embed&z=${cfg.zoom||14}" width="100%" height="${cfg.height||400}" style="border:0" allowfullscreen loading="lazy"></iframe></div>`
    }
    case 'countdown': {
      const id = `cd_${Math.random().toString(36).slice(2,7)}`
      return `<div id="${id}" style="text-align:center;padding:2rem;${st}"><p style="margin-bottom:1rem;font-weight:600;color:${gs.primaryColor}">${cfg.label||''}</p><div style="display:flex;gap:1rem;justify-content:center">${['Days','Hours','Minutes','Seconds'].map(u=>`<div style="background:${gs.secondaryColor};color:#fff;border-radius:12px;padding:1rem 1.5rem;min-width:80px"><div class="cd-${id}-${u.toLowerCase()}" style="font-size:2.5rem;font-weight:800;color:${gs.primaryColor}">00</div><div style="font-size:.75rem;opacity:.7">${u}</div></div>`).join('')}</div><script>(function(){var t=new Date("${cfg.targetDate||'2026-12-31'}").getTime();function u(){var n=t-new Date().getTime();if(n<0){clearInterval(i);return;}document.querySelector(".cd-${id}-days").textContent=String(Math.floor(n/864e5)).padStart(2,"0");document.querySelector(".cd-${id}-hours").textContent=String(Math.floor((n%864e5)/36e5)).padStart(2,"0");document.querySelector(".cd-${id}-minutes").textContent=String(Math.floor((n%36e5)/6e4)).padStart(2,"0");document.querySelector(".cd-${id}-seconds").textContent=String(Math.floor((n%6e4)/1e3)).padStart(2,"0");}u();var i=setInterval(u,1000);})()</script></div>`
    }
    case 'progress': {
      const items = (cfg.items as Array<{label:string;value:number;color?:string}>) || []
      return wrap(`<div style="max-width:700px;margin:0 auto;padding:1rem">${items.map(it=>`<div style="margin-bottom:1.5rem"><div style="display:flex;justify-content:space-between;margin-bottom:.5rem"><span style="font-weight:600">${it.label}</span><span style="color:${it.color||gs.primaryColor};font-weight:700">${it.value}%</span></div><div style="background:#eee;border-radius:999px;height:8px"><div style="background:${it.color||gs.primaryColor};border-radius:999px;height:8px;width:${it.value}%;transition:width 1s"></div></div></div>`).join('')}</div>`)
    }
    default: return `<div style="padding:1rem;border:1px dashed #ccc;color:#999;text-align:center">${el.type}</div>`
  }
}

function sectionToHTML(sec: Section, gs: GlobalStyles): string {
  const bgStyle = sec.background.type === 'color' ? `background:${sec.background.value}` :
    sec.background.type === 'gradient' ? `background:${sec.background.value}` :
    `background-image:url(${sec.background.value});background-size:cover;background-position:center`
  const maxW = sec.maxWidth === 'xl' ? '1280px' : sec.maxWidth === 'lg' ? '1024px' : sec.maxWidth === 'md' ? '768px' : '100%'
  const cols = sec.columns.map(col => {
    const elHTML = col.elements.map(el => elementToHTML(el, gs)).join('\n')
    return `<div style="flex:${col.width?`0 0 ${col.width}%`:'1'};min-width:0">${elHTML}</div>`
  }).join('\n')
  return `<section style="${bgStyle};padding:${sec.padding.top}px 0 ${sec.padding.bottom}px"><div style="max-width:${maxW};margin:0 auto;padding:0 1.5rem;display:flex;flex-wrap:wrap">${cols}</div></section>`
}

function projectToHTML(project: WebsiteProject): string {
  const gs = project.globalStyles
  const page = project.pages[0]
  if (!page) return '<html><body><p>No pages found</p></body></html>'
  const body = page.sections.map(sec => sectionToHTML(sec, gs)).join('\n')
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${page.seo.title || project.name}</title>
<meta name="description" content="${page.seo.description||''}"/>
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(gs.headingFont)}:wght@400;600;700;800&family=${encodeURIComponent(gs.bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'${gs.bodyFont}',sans-serif;font-size:${gs.baseFontSize}px;color:#333;line-height:1.6}
img{max-width:100%}
a{text-decoration:none}
@keyframes marqueeScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
details>summary{list-style:none}details>summary::-webkit-details-marker{display:none}
@media(max-width:768px){
  nav{flex-wrap:wrap;gap:.5rem}
  nav div{display:none}
  section > div{flex-direction:column!important}
}
</style>
</head>
<body>
${body}
</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      {
        error: "AI Website Builder requires GROQ_API_KEY to be set in your .env file.",
        hint: "Add GROQ_API_KEY=your_key_here to .env and restart the server.",
      },
      { status: 503 }
    )
  }

  try {
    const body = await req.json()
    const { action } = body

    // Regenerate a single section
    if (action === "regenerate-section") {
      const { sectionType, businessName, industry, tone } = body as {
        action: string
        sectionType: WebsiteSection["type"]
        businessName: string
        industry: string
        tone?: string
      }

      if (!sectionType || !businessName || !industry) {
        return NextResponse.json(
          { error: "sectionType, businessName, and industry are required" },
          { status: 400 }
        )
      }

      const section = await generateSection(sectionType, { businessName, industry, tone })
      return NextResponse.json({ section })
    }

    // Export as HTML file
    if (action === "export") {
      const { website } = body as { action: string; website: GeneratedWebsite }

      if (!website) {
        return NextResponse.json({ error: "website object is required" }, { status: 400 })
      }

      // Support both old GeneratedWebsite and new WebsiteProject formats
      let html: string
      let fileName: string
      if ('pages' in website && Array.isArray((website as unknown as Record<string,unknown>).pages)) {
        // New WebsiteProject format — use projectToHTML
        html = projectToHTML(website as unknown as import("@/app/admin/website-builder/builder-types").WebsiteProject)
        const name = (website as unknown as {name?:string}).name || 'website'
        fileName = `${name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.html`
      } else {
        // Legacy GeneratedWebsite format
        html = websiteToHTML(website)
        fileName = `${website.businessName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-website.html`
      }

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      })
    }

    // Generate full project via AI
    if (action === 'generate-full-project') {
      const { businessDesc, industry, style, pages, colorTheme, projectName } = body as {
        businessDesc: string;
        industry: string;
        style: string;
        pages: string[];
        colorTheme: string;
        projectName: string;
      };

      if (!businessDesc?.trim()) {
        return NextResponse.json({ error: 'businessDesc is required' }, { status: 400 });
      }

      // Color themes mapping
      const colorThemes: Record<string, { primary: string; secondary: string; accent: string }> = {
        'Professional': { primary: '#C9A227', secondary: '#0B1437', accent: '#3B82F6' },
        'Fresh': { primary: '#10B981', secondary: '#064E3B', accent: '#34D399' },
        'Creative': { primary: '#6C63FF', secondary: '#1E1B4B', accent: '#FF6584' },
        'Warm': { primary: '#EA580C', secondary: '#431407', accent: '#FCD34D' },
        'Custom': { primary: '#6B7280', secondary: '#1F2937', accent: '#9CA3AF' },
      };
      const colors = colorThemes[colorTheme] || colorThemes['Professional'];

      // Font mapping by industry
      const fontMap: Record<string, { heading: string; body: string }> = {
        'Restaurant': { heading: 'Playfair Display', body: 'Lato' },
        'Agency/Studio': { heading: 'Montserrat', body: 'Inter' },
        'Healthcare/Clinic': { heading: 'Poppins', body: 'Open Sans' },
        'Education': { heading: 'Poppins', body: 'Roboto' },
        'Real Estate': { heading: 'Raleway', body: 'Open Sans' },
        'E-Commerce': { heading: 'Montserrat', body: 'Inter' },
        'Corporate/Finance': { heading: 'Raleway', body: 'Roboto' },
        'Technology/SaaS': { heading: 'Inter', body: 'Inter' },
        'Events/Wedding': { heading: 'Playfair Display', body: 'Lato' },
        'Personal/Portfolio': { heading: 'Poppins', body: 'Inter' },
      };
      const fonts = fontMap[industry] || { heading: 'Poppins', body: 'Inter' };

      // Use AI to generate content
      const aiPrompt = `Generate website content for this business:
${businessDesc}

Industry: ${industry}
Style: ${style}

Return a JSON object with this exact structure (no markdown, pure JSON):
{
  "businessName": "string",
  "tagline": "catchy tagline",
  "heroHeading": "main hero heading",
  "heroSubheading": "subheading",
  "heroText": "1-2 sentence hero description",
  "heroCTA": "button text",
  "aboutHeading": "about section heading",
  "aboutText": "2-3 sentence about description",
  "services": [
    {"title": "service 1", "description": "brief description"},
    {"title": "service 2", "description": "brief description"},
    {"title": "service 3", "description": "brief description"}
  ],
  "marqueeItems": ["item 1", "item 2", "item 3", "item 4", "item 5"],
  "testimonial": {"name": "client name", "role": "role/company", "text": "testimonial text", "rating": 5},
  "ctaHeading": "call to action heading",
  "ctaText": "call to action text",
  "ctaButton": "button text",
  "footerTagline": "footer tagline",
  "navLinks": ["Home", "About", "Services", "Contact"]
}`;

      let aiContent: Record<string, unknown> = {};
      try {
        const Groq = (await import('groq-sdk')).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: aiPrompt }],
          temperature: 0.7,
          max_tokens: 1000,
        });
        const raw = completion.choices[0]?.message?.content || '{}';
        // Extract JSON from response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiContent = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Use fallback content if AI fails
        aiContent = {
          businessName: projectName || 'My Business',
          tagline: 'Your Success is Our Mission',
          heroHeading: 'Welcome to Our Website',
          heroSubheading: 'Quality Service You Can Trust',
          heroText: 'We provide exceptional services tailored to your needs.',
          heroCTA: 'Get Started',
          aboutHeading: 'About Us',
          aboutText: 'We are dedicated to providing the best experience for our clients.',
          services: [
            { title: 'Service One', description: 'Professional service delivery' },
            { title: 'Service Two', description: 'Expert consultation' },
            { title: 'Service Three', description: '24/7 support' },
          ],
          marqueeItems: ['Quality Service', 'Fast Delivery', '24/7 Support', 'Expert Team', 'Best Prices'],
          testimonial: { name: 'Happy Client', role: 'Business Owner', text: 'Excellent service! Highly recommended.', rating: 5 },
          ctaHeading: 'Ready to Get Started?',
          ctaText: 'Contact us today for a free consultation.',
          ctaButton: 'Contact Us',
          footerTagline: 'Building better businesses',
          navLinks: ['Home', 'About', 'Services', 'Contact'],
        };
      }

      // Build the WebsiteProject from AI content
      const gid = (() => { let n = 0; return (p = 'x') => `${p}${++n}`; })();

      const navLinks = ((aiContent.navLinks as string[]) || ['Home', 'About', 'Services', 'Contact']).map((label: string) => ({ label, href: '#' }));

      const makeSection = (
        name: string,
        elementType: string,
        config: Record<string, unknown>,
        bg: string = '#ffffff'
      ) => ({
        id: gid('sec'),
        name,
        columns: [{
          id: gid('col'),
          width: 100,
          elements: [{
            id: gid('el'),
            type: elementType,
            styles: {},
            config,
          }],
        }],
        background: { type: 'color' as const, value: bg },
        padding: { top: 0, bottom: 0 },
        margin: { top: 0, bottom: 0 },
        maxWidth: 'xl' as const,
      });

      const services = (aiContent.services as Array<{ title: string; description: string }>) || [];
      const testimonial = (aiContent.testimonial as { name: string; role: string; text: string; rating: number } | undefined) ?? { name: '', role: '', text: '', rating: 5 };

      // pages variable is declared but sections are built for Home page only
      void pages;

      const sections = [
        makeSection('Navigation', 'navbar', {
          logoText: (aiContent.businessName as string) || projectName || 'Brand',
          links: navLinks,
          sticky: true,
          transparent: false,
        }, colors.secondary),
        makeSection('Hero', 'hero', {
          heading: (aiContent.heroHeading as string) || 'Welcome',
          subheading: (aiContent.heroSubheading as string) || '',
          text: (aiContent.heroText as string) || '',
          cta: { label: (aiContent.heroCTA as string) || 'Get Started', href: '#', variant: 'primary', size: 'lg' },
          secondaryCta: { label: 'Learn More', href: '#about', variant: 'outline', size: 'lg' },
          overlay: 60,
          align: 'center',
          bgImage: '',
        }, colors.secondary),
        makeSection('Marquee', 'marquee', {
          items: (aiContent.marqueeItems as string[]) || ['Quality Service', 'Fast Delivery', 'Expert Team'],
          speed: 25,
          direction: 'left',
          separator: '  ✦  ',
        }, '#0a0f20'),
        makeSection('Features', 'iconbox', {
          icon: '⭐',
          title: services[0]?.title || 'Our Service',
          description: services[0]?.description || 'Professional service',
          align: 'center',
        }, '#ffffff'),
        makeSection('Counter', 'counter', {
          items: [
            { value: 500, label: 'Happy Clients', suffix: '+' },
            { value: 100, label: 'Projects Done', suffix: '+' },
            { value: 5, label: 'Years Experience', suffix: '+' },
            { value: 99, label: 'Satisfaction', suffix: '%' },
          ],
        }, colors.secondary),
        makeSection('Testimonial', 'testimonial', {
          name: testimonial.name || 'Satisfied Client',
          role: testimonial.role || 'Business Owner',
          text: testimonial.text || 'Excellent service! Highly recommended.',
          rating: testimonial.rating || 5,
        }, '#f8f9fa'),
        makeSection('CTA', 'cta', {
          heading: (aiContent.ctaHeading as string) || 'Ready to Get Started?',
          text: (aiContent.ctaText as string) || 'Contact us today.',
          cta: { label: (aiContent.ctaButton as string) || 'Get Started', href: '#contact', variant: 'primary', size: 'lg' },
          bgColor: colors.secondary,
        }, colors.secondary),
        makeSection('Contact', 'form', {
          fields: [
            { id: 'name', type: 'text', label: 'Your Name', placeholder: 'Enter your name', required: true },
            { id: 'email', type: 'email', label: 'Email Address', placeholder: 'your@email.com', required: true },
            { id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', required: false },
            { id: 'message', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: true },
          ],
          submitLabel: 'Send Message',
          successMessage: 'Thank you! We will get back to you soon.',
        }, '#f8f9fa'),
        makeSection('Footer', 'footer', {
          logoText: (aiContent.businessName as string) || projectName || 'Brand',
          tagline: (aiContent.footerTagline as string) || 'Building better businesses',
          columns: [
            { heading: 'Company', links: navLinks.slice(0, 4) },
            { heading: 'Contact', links: [{ label: 'Email Us', href: '#' }, { label: 'Call Us', href: '#' }] },
          ],
          socials: [{ platform: 'facebook', url: '#' }, { platform: 'instagram', url: '#' }],
          copyright: `2026 ${(aiContent.businessName as string) || projectName}. All rights reserved.`,
        }, colors.secondary),
      ];

      const project = {
        id: gid('proj'),
        name: (aiContent.businessName as string) || projectName || 'AI Generated Website',
        pages: [{
          id: gid('pg'),
          name: 'Home',
          slug: 'home',
          sections,
          seo: {
            title: (aiContent.businessName as string) || projectName || '',
            description: (aiContent.heroText as string) || '',
            keywords: industry,
          },
        }],
        globalStyles: {
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
          headingFont: fonts.heading,
          bodyFont: fonts.body,
          baseFontSize: 16,
          maxWidth: 1280,
          borderRadius: 'md',
        },
        customCSS: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({ project });
    }

    // Generate full website (default action)
    const { prompt, industry, style, language } = body as {
      prompt: string
      industry?: string
      style?: "modern" | "classic" | "minimal" | "corporate"
      language?: "english" | "hindi" | "both"
    }

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    const website = await generateWebsiteContent(prompt, { industry, style, language })
    const htmlPreview = websiteToHTML(website)

    return NextResponse.json({ website, htmlPreview })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    console.error("[website-builder] error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
