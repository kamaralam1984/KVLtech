"use client"

import React, { useState, useEffect } from 'react'
import type { BuilderElement, GlobalStyles, CSSStyles } from './builder-types'

// Cast CSSStyles (which has [key:string]:string|undefined index signature) to React.CSSProperties
function s(styles: CSSStyles | undefined): React.CSSProperties {
  return (styles || {}) as React.CSSProperties
}

// ─── Sub-component renderers (must be top-level to satisfy React hooks rules) ──

function SliderRenderer({ el, globalStyles }: { el: BuilderElement; globalStyles: GlobalStyles }) {
  const cfg = el.config as Record<string, unknown>
  const slides = (cfg.slides as Array<{ src: string; heading?: string; text?: string }>) || []
  const autoPlay = cfg.autoPlay as boolean
  const interval = (cfg.interval as number) || 4000
  const arrows = cfg.arrows !== false
  const dots = cfg.dots !== false
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!autoPlay || slides.length < 2) return
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [autoPlay, interval, slides.length])

  if (!slides.length) {
    return (
      <div style={{ height: 300, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No slides
      </div>
    )
  }

  const slide = slides[current]

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...s(el.styles) }}>
      <div style={{ position: 'relative', minHeight: 300 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.heading || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '2rem' }}>
          {slide.heading && <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>{slide.heading}</h2>}
          {slide.text && <p style={{ fontSize: '1.1rem' }}>{slide.text}</p>}
        </div>
      </div>
      {arrows && slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}
          >‹</button>
          <button
            onClick={() => setCurrent(c => (c + 1) % slides.length)}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}
          >›</button>
        </>
      )}
      {dots && slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{ width: 8, height: 8, borderRadius: '50%', background: i === current ? '#C9A227' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CountdownRenderer({ el }: { el: BuilderElement }) {
  const cfg = el.config as Record<string, unknown>
  const targetDate = (cfg.targetDate as string) || ''
  const label = (cfg.label as string) || 'Countdown'

  const calcTime = () => {
    const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  const [time, setTime] = useState(calcTime)

  useEffect(() => {
    if (!targetDate) return
    const t = setInterval(() => setTime(calcTime()), 1000)
    return () => clearInterval(t)
  }, [targetDate])

  const units: Array<{ key: keyof typeof time; label: string }> = [
    { key: 'days', label: 'Days' },
    { key: 'hours', label: 'Hours' },
    { key: 'minutes', label: 'Minutes' },
    { key: 'seconds', label: 'Seconds' },
  ]

  return (
    <div style={{ textAlign: 'center', ...s(el.styles) }}>
      {label && <p style={{ marginBottom: '1rem', fontWeight: 600, fontSize: '1rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {units.map(u => (
          <div key={u.key} style={{ minWidth: 80, background: '#0B1437', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#C9A227', lineHeight: 1 }}>
              {String(time[u.key]).padStart(2, '0')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{u.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CounterRenderer({ el }: { el: BuilderElement }) {
  const cfg = el.config as Record<string, unknown>
  const items = (cfg.items as Array<{ value: number; label: string; prefix?: string; suffix?: string }>) || []
  const [counts, setCounts] = useState<number[]>(items.map(() => 0))
  const duration = 1800

  useEffect(() => {
    if (!items.length) return
    const steps = 60
    const stepMs = duration / steps
    let step = 0
    const t = setInterval(() => {
      step++
      const progress = step / steps
      setCounts(items.map(it => Math.round(it.value * Math.min(progress, 1))))
      if (step >= steps) clearInterval(t)
    }, stepMs)
    return () => clearInterval(t)
  }, [items.length])

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', ...s(el.styles) }}>
      {items.map((it, i) => (
        <div key={i} style={{ textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#C9A227', lineHeight: 1 }}>
            {it.prefix || ''}{counts[i].toLocaleString()}{it.suffix || ''}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem', fontWeight: 500 }}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

function AccordionRenderer({ el }: { el: BuilderElement }) {
  const cfg = el.config as Record<string, unknown>
  const items = (cfg.items as Array<{ id: string; question: string; answer: string }>) || []
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', ...s(el.styles) }}>
      {items.map(item => (
        <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: openId === item.id ? '#fafafa' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.95rem', color: '#222' }}
          >
            <span>{item.question}</span>
            <span style={{ fontSize: '1.1rem', color: '#C9A227', transition: 'transform 0.2s', transform: openId === item.id ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
          </button>
          {openId === item.id && (
            <div style={{ padding: '0.75rem 1.25rem 1rem', background: '#fafafa', color: '#555', lineHeight: 1.7, fontSize: '0.9rem', borderTop: '1px solid #f0f0f0' }}>
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TabsRenderer({ el }: { el: BuilderElement }) {
  const cfg = el.config as Record<string, unknown>
  const tabs = (cfg.tabs as Array<{ id: string; label: string; content: string }>) || []
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id || '')

  const active = tabs.find(t => t.id === activeTab)

  return (
    <div style={s(el.styles)}>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', gap: 0, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: tab.id === activeTab ? 700 : 500,
              color: tab.id === activeTab ? '#C9A227' : '#666',
              borderBottom: tab.id === activeTab ? '2px solid #C9A227' : '2px solid transparent',
              marginBottom: '-2px',
              fontSize: '0.9rem',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '1.5rem', color: '#444', lineHeight: 1.7, fontSize: '0.95rem' }}>
        {active ? active.content : ''}
      </div>
    </div>
  )
}

function ProgressRenderer({ el }: { el: BuilderElement }) {
  const cfg = el.config as Record<string, unknown>
  const items = (cfg.items as Array<{ label: string; value: number; color?: string }>) || []
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', ...s(el.styles) }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: '#333' }}>
            <span>{item.label}</span>
            <span style={{ color: item.color || '#C9A227' }}>{item.value}%</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: 999, height: 10, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                borderRadius: 999,
                background: item.color || '#C9A227',
                width: mounted ? `${item.value}%` : '0%',
                transition: 'width 1s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main render function ──────────────────────────────────────────────────────

export function renderElement(
  el: BuilderElement,
  globalStyles: GlobalStyles,
  previewMode: boolean
): React.ReactElement {
  const cfg = el.config as Record<string, unknown>

  switch (el.type) {
    case 'heading': {
      const text = (cfg.text as string) || 'Your Heading'
      const level = (cfg.level as number) || 2
      const style: React.CSSProperties = {
        fontSize: level === 1 ? '2.5rem' : level === 2 ? '2rem' : level === 3 ? '1.75rem' : level === 4 ? '1.5rem' : '1.25rem',
        fontWeight: '700',
        lineHeight: '1.2',
        ...s(el.styles),
      }
      if (level === 1) return <h1 style={style}>{text}</h1>
      if (level === 3) return <h3 style={style}>{text}</h3>
      if (level === 4) return <h4 style={style}>{text}</h4>
      if (level === 5) return <h5 style={style}>{text}</h5>
      if (level === 6) return <h6 style={style}>{text}</h6>
      return <h2 style={style}>{text}</h2>
    }

    case 'paragraph':
      return (
        <p style={{ lineHeight: '1.7', ...s(el.styles) }}>
          {(cfg.text as string) || 'Write your content here.'}
        </p>
      )

    case 'richtext':
      return (
        <div
          style={s(el.styles)}
          dangerouslySetInnerHTML={{ __html: (cfg.html as string) || '' }}
        />
      )

    case 'quote':
      return (
        <blockquote style={{ borderLeft: '4px solid #C9A227', paddingLeft: '1.5rem', fontStyle: 'italic', color: '#555', ...s(el.styles) }}>
          <p>{(cfg.text as string) || 'An inspiring quote.'}</p>
        </blockquote>
      )

    case 'list': {
      const items = (cfg.items as string[]) || ['Item 1', 'Item 2', 'Item 3']
      const ordered = cfg.ordered as boolean
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag style={{ paddingLeft: '1.5rem', lineHeight: '2', ...s(el.styles) }}>
          {items.map((it, i) => <li key={i}>{it}</li>)}
        </Tag>
      )
    }

    case 'button': {
      const label = (cfg.label as string) || 'Click Here'
      const href = (cfg.href as string) || '#'
      const variant = (cfg.variant as string) || 'primary'
      const size = (cfg.size as string) || 'md'
      const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { padding: '0.375rem 1rem', fontSize: '0.875rem' },
        md: { padding: '0.625rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '0.875rem 2rem', fontSize: '1.125rem' },
      }
      const variantStyles: Record<string, React.CSSProperties> = {
        primary: { background: '#C9A227', color: '#0B1437', border: 'none' },
        secondary: { background: '#0B1437', color: '#fff', border: 'none' },
        outline: { background: 'transparent', color: '#C9A227', border: '2px solid #C9A227' },
        ghost: { background: 'transparent', color: '#C9A227', border: 'none' },
        link: { background: 'transparent', color: '#C9A227', border: 'none', textDecoration: 'underline' },
      }
      return (
        <a
          href={href}
          style={{
            display: 'inline-block',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            textDecoration: 'none',
            ...(sizeStyles[size] || sizeStyles.md),
            ...(variantStyles[variant] || variantStyles.primary),
            ...s(el.styles),
          }}
        >
          {label}
        </a>
      )
    }

    case 'buttongroup': {
      const buttons = (cfg.buttons as Array<{ label: string; href: string; variant: string; size: string }>) || []
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', ...s(el.styles) }}>
          {buttons.map((btn, i) =>
            renderElement(
              { ...el, id: el.id + '_btn' + i, type: 'button', config: btn, styles: {} },
              globalStyles,
              previewMode
            )
          )}
        </div>
      )
    }

    case 'image': {
      const src = (cfg.src as string) || '/photos/office-meeting.jpg'
      const alt = (cfg.alt as string) || 'Image'
      const fit = (cfg.fit as string) || 'cover'
      return (
        <div style={{ overflow: 'hidden', ...s(el.styles) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: fit as 'cover' | 'contain' | 'fill' }}
          />
        </div>
      )
    }

    case 'gallery': {
      const images = (cfg.images as Array<{ src: string; alt: string }>) || []
      const columns = (cfg.columns as number) || 3
      const gap = (cfg.gap as number) || 16
      return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gap + 'px', ...s(el.styles) }}>
          {images.map((img, i) => (
            <div key={i} style={{ overflow: 'hidden', borderRadius: '8px', aspectRatio: '4/3' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              />
            </div>
          ))}
        </div>
      )
    }

    case 'slider':
      return <SliderRenderer el={el} globalStyles={globalStyles} />

    case 'video': {
      const src = (cfg.src as string) || ''
      const poster = cfg.poster as string | undefined
      const autoPlay = cfg.autoPlay as boolean
      const muted = cfg.muted as boolean
      const controls = cfg.controls !== false
      const loop = cfg.loop as boolean

      if (!src) {
        return (
          <div style={{ height: 300, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', borderRadius: 8, ...s(el.styles) }}>
            <span style={{ fontSize: '3rem' }}>▶</span>
          </div>
        )
      }

      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        let videoId = ''
        try {
          if (src.includes('youtu.be')) {
            videoId = src.split('youtu.be/')[1]?.split('?')[0] || ''
          } else {
            videoId = new URL(src).searchParams.get('v') || ''
          }
        } catch {
          videoId = src.split('v=')[1]?.split('&')[0] || ''
        }
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, ...s(el.styles) }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}${autoPlay ? '?autoplay=1&mute=1' : ''}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              title="YouTube video"
            />
          </div>
        )
      }

      if (src.includes('vimeo.com')) {
        const videoId = src.split('vimeo.com/')[1]?.split('?')[0] || ''
        return (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, ...s(el.styles) }}>
            <iframe
              src={`https://player.vimeo.com/video/${videoId}${autoPlay ? '?autoplay=1&muted=1' : ''}`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              title="Vimeo video"
            />
          </div>
        )
      }

      return (
        <video
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          controls={controls}
          loop={loop}
          style={{ width: '100%', borderRadius: 8, ...s(el.styles) }}
        />
      )
    }

    case 'marquee': {
      const items = (cfg.items as string[]) || ['Item 1', 'Item 2', 'Item 3']
      const speed = (cfg.speed as number) || 40
      const direction = (cfg.direction as string) || 'left'
      const separator = (cfg.separator as string) || ' • '
      const text = items.join(separator)
      const animationName = `marquee-${el.id}`
      const dur = Math.max(5, Math.round(100 / speed * 20))

      return (
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...s(el.styles) }}>
          <style>{`
            @keyframes ${animationName} {
              from { transform: translateX(${direction === 'right' ? '-100%' : '100%'}); }
              to { transform: translateX(${direction === 'right' ? '100%' : '-100%'}); }
            }
          `}</style>
          <span style={{ display: 'inline-block', animation: `${animationName} ${dur}s linear infinite`, paddingRight: '2rem' }}>
            {text}{separator}{text}
          </span>
        </div>
      )
    }

    case 'divider':
      return (
        <div style={{ margin: '1rem 0' }}>
          <hr style={{ border: 'none', borderTop: '1px solid currentColor', opacity: 0.3, ...s(el.styles) }} />
        </div>
      )

    case 'spacer':
      return <div style={{ height: (cfg.height as number) || 48 }} />

    case 'icon':
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', ...s(el.styles) }}>
          <span style={{ fontSize: (cfg.size as number) || 48, color: (cfg.color as string) || '#C9A227' }}>★</span>
        </div>
      )

    case 'iconbox': {
      const title = (cfg.title as string) || 'Feature'
      const desc = (cfg.description as string) || 'Description'
      const align = (cfg.align as string) || 'center'
      return (
        <div style={{ textAlign: align as 'left' | 'center', padding: '2rem 1.5rem', ...s(el.styles) }}>
          <div style={{ fontSize: '2.5rem', color: '#C9A227', marginBottom: '1rem' }}>★</div>
          <h4 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h4>
          <p style={{ color: '#666', lineHeight: 1.7 }}>{desc}</p>
        </div>
      )
    }

    case 'card': {
      const title = (cfg.title as string) || 'Card Title'
      const desc = (cfg.description as string) || 'Card description text.'
      const image = cfg.image as string | undefined
      const link = cfg.link as string | undefined
      const badge = cfg.badge as string | undefined
      return (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', ...s(el.styles) }}>
          {image && (
            <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: '1.5rem' }}>
            {badge && (
              <span style={{ display: 'inline-block', background: '#C9A227', color: '#0B1437', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: 999, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge}</span>
            )}
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#111' }}>{title}</h4>
            <p style={{ color: '#666', lineHeight: 1.6, fontSize: '0.9rem' }}>{desc}</p>
            {link && (
              <a href={link} style={{ display: 'inline-block', marginTop: '1rem', color: '#C9A227', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>Learn more →</a>
            )}
          </div>
        </div>
      )
    }

    case 'counter':
      return <CounterRenderer el={el} />

    case 'countdown':
      return <CountdownRenderer el={el} />

    case 'progress':
      return <ProgressRenderer el={el} />

    case 'testimonial': {
      const name = (cfg.name as string) || 'Client Name'
      const role = (cfg.role as string) || 'Role'
      const text = (cfg.text as string) || 'Great service!'
      const rating = (cfg.rating as number) || 5
      return (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', ...s(el.styles) }}>
          <div style={{ color: '#F59E0B', marginBottom: '1rem', fontSize: '1.25rem' }}>{'★'.repeat(Math.min(5, Math.max(0, rating)))}</div>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{text}"</p>
          <div style={{ fontWeight: 700 }}>{name}</div>
          <div style={{ color: '#888', fontSize: '0.875rem' }}>{role}</div>
        </div>
      )
    }

    case 'pricing': {
      const plans = (cfg.plans as Array<{
        name: string; price: string; period: string; features: string[];
        cta: { label: string; href: string; variant: string };
        highlighted: boolean; badge?: string;
      }>) || []
      return (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', ...s(el.styles) }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                flex: '1 1 280px', maxWidth: '320px',
                background: plan.highlighted ? '#0B1437' : '#fff',
                color: plan.highlighted ? '#fff' : '#333',
                borderRadius: '16px', padding: '2rem',
                border: plan.highlighted ? '2px solid #C9A227' : '1px solid #eee',
                position: 'relative',
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              }}
            >
              {plan.badge && (
                <span style={{ position: 'absolute', top: -12, right: 16, background: '#C9A227', color: '#0B1437', padding: '2px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {plan.badge}
                </span>
              )}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#C9A227', marginBottom: '0.25rem' }}>{plan.price}</div>
              <div style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{plan.period}</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                {(plan.features || []).map((f, j) => (
                  <li key={j} style={{ padding: '0.25rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>✓ {f}</li>
                ))}
              </ul>
              <a
                href={plan.cta?.href || '#'}
                style={{
                  display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: '8px',
                  background: plan.highlighted ? '#C9A227' : 'transparent',
                  color: plan.highlighted ? '#0B1437' : '#C9A227',
                  border: '2px solid #C9A227', fontWeight: 700, textDecoration: 'none',
                }}
              >
                {plan.cta?.label || 'Get Started'}
              </a>
            </div>
          ))}
        </div>
      )
    }

    case 'accordion':
      return <AccordionRenderer el={el} />

    case 'tabs':
      return <TabsRenderer el={el} />

    case 'form': {
      const fields = (cfg.fields as Array<{ id: string; type: string; label: string; placeholder?: string; required?: boolean; options?: string[] }>) || []
      const submitLabel = (cfg.submitLabel as string) || 'Send Message'
      return (
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...s(el.styles) }} onSubmit={e => e.preventDefault()}>
          {fields.map(field => (
            <div key={field.id}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                {field.label}
                {field.required && <span style={{ color: 'red' }}> *</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              ) : field.type === 'select' ? (
                <select style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option>Select...</option>
                  {(field.options || []).map((opt, oi) => <option key={oi}>{opt}</option>)}
                </select>
              ) : field.type === 'checkbox' ? (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: '0.875rem', color: '#555' }}>{field.placeholder}</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            style={{ background: '#C9A227', color: '#0B1437', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', alignSelf: 'flex-start' }}
          >
            {submitLabel}
          </button>
        </form>
      )
    }

    case 'map': {
      const address = encodeURIComponent((cfg.address as string) || 'Mumbai, India')
      const height = (cfg.height as number) || 400
      const zoom = (cfg.zoom as number) || 14
      return (
        <div style={{ borderRadius: '12px', overflow: 'hidden', ...s(el.styles) }}>
          <iframe
            src={`https://maps.google.com/maps?q=${address}&output=embed&z=${zoom}`}
            width="100%"
            height={height}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title="Google Map"
          />
        </div>
      )
    }

    case 'social': {
      const links = (cfg.links as Array<{ platform: string; url: string }>) || []
      const colors: Record<string, string> = {
        facebook: '#1877F2',
        instagram: '#E4405F',
        twitter: '#1DA1F2',
        youtube: '#FF0000',
        linkedin: '#0A66C2',
        whatsapp: '#25D366',
        tiktok: '#010101',
        pinterest: '#E60023',
      }
      const icons: Record<string, string> = {
        facebook: 'f',
        instagram: '📷',
        twitter: '𝕏',
        youtube: '▶',
        linkedin: 'in',
        whatsapp: 'W',
        tiktok: '♪',
        pinterest: 'P',
      }
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', ...s(el.styles) }}>
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: colors[link.platform] || '#666',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              }}
            >
              {icons[link.platform] || link.platform[0]?.toUpperCase()}
            </a>
          ))}
        </div>
      )
    }

    case 'navbar': {
      const logoText = (cfg.logoText as string) || 'Brand'
      const links = (cfg.links as Array<{ label: string; href: string }>) || []
      const sticky = cfg.sticky as boolean
      const cta = cfg.cta as { label: string; href: string } | undefined
      return (
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 2rem', background: '#0B1437', color: '#fff',
          position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 100,
          ...s(el.styles),
        }}>
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#C9A227' }}>{logoText}</span>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {links.map((link, i) => (
              <a key={i} href={link.href} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                {link.label}
              </a>
            ))}
            {cta && (
              <a href={cta.href} style={{ background: '#C9A227', color: '#0B1437', padding: '0.375rem 1rem', borderRadius: 6, fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                {cta.label}
              </a>
            )}
          </div>
        </nav>
      )
    }

    case 'footer': {
      const tagline = (cfg.tagline as string) || ''
      const columns = (cfg.columns as Array<{ heading: string; links: Array<{ label: string; href: string }> }>) || []
      const copyright = (cfg.copyright as string) || 'All rights reserved.'
      return (
        <footer style={{ background: '#0B1437', color: '#fff', padding: '3rem 2rem 1.5rem', ...s(el.styles) }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            {columns.map((col, i) => (
              <div key={i} style={{ flex: '1 1 160px' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '1rem', color: '#C9A227' }}>{col.heading}</h5>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(col.links || []).map((link, j) => (
                    <li key={j}>
                      <a href={link.href} style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.875rem' }}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {tagline && <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.875rem' }}>{tagline}</p>}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
            © {copyright}
          </div>
        </footer>
      )
    }

    case 'hero': {
      const heading = (cfg.heading as string) || 'Welcome'
      const subheading = (cfg.subheading as string) || ''
      const text = (cfg.text as string) || ''
      const bgImage = cfg.bgImage as string | undefined
      const overlay = (cfg.overlay as number) || 40
      const align = (cfg.align as string) || 'center'
      const cta = cfg.cta as { label: string; href: string } | undefined
      const secondaryCta = cfg.secondaryCta as { label: string; href: string } | undefined
      return (
        <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...s(el.styles) }}>
          {bgImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={bgImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: `rgba(11,20,55,${overlay / 100})` }} />
          <div style={{ position: 'relative', textAlign: align as 'left' | 'center' | 'right', color: '#fff', padding: '4rem 2rem', maxWidth: '900px', width: '100%' }}>
            {subheading && (
              <p style={{ color: '#C9A227', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.875rem' }}>
                {subheading}
              </p>
            )}
            <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              {heading}
            </h1>
            {text && (
              <p style={{ fontSize: '1.25rem', opacity: 0.85, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                {text}
              </p>
            )}
            <div style={{
              display: 'flex', gap: '1rem',
              justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
              flexWrap: 'wrap',
            }}>
              {cta && (
                <a href={cta.href} style={{ background: '#C9A227', color: '#0B1437', padding: '0.875rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
                  {cta.label}
                </a>
              )}
              {secondaryCta && (
                <a href={secondaryCta.href} style={{ border: '2px solid rgba(255,255,255,0.6)', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
                  {secondaryCta.label}
                </a>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'cta': {
      const heading = (cfg.heading as string) || 'Ready to Get Started?'
      const text = (cfg.text as string) || 'Contact us today.'
      const bgColor = (cfg.bgColor as string) || '#0B1437'
      const cta = cfg.cta as { label: string; href: string } | undefined
      const secondaryCta = cfg.secondaryCta as { label: string; href: string } | undefined
      return (
        <div style={{ background: bgColor, color: '#fff', textAlign: 'center', padding: '4rem 2rem', ...s(el.styles) }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>{heading}</h2>
          <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>{text}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cta && (
              <a href={cta.href} style={{ background: '#C9A227', color: '#0B1437', padding: '0.875rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
                {cta.label}
              </a>
            )}
            {secondaryCta && (
              <a href={secondaryCta.href} style={{ border: '2px solid rgba(255,255,255,0.6)', color: '#fff', padding: '0.875rem 2.5rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1.1rem' }}>
                {secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      )
    }

    default:
      return (
        <div style={{ padding: '1rem', border: '1px dashed #ccc', color: '#999', textAlign: 'center', ...s(el.styles) }}>
          {el.type} element
        </div>
      )
  }
}
