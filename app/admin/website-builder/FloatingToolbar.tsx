"use client"

import React from 'react'
import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react'
import type { BuilderElement, CSSStyles } from './builder-types'

interface FloatingToolbarProps {
  element: BuilderElement
  onUpdateStyles: (styles: Partial<CSSStyles>) => void
  onUpdateProp: (prop: Partial<Pick<BuilderElement, 'animation' | 'animationDelay'>>) => void
}

const WEB_FONTS = [
  'Inter', 'Poppins', 'Montserrat', 'Roboto', 'Open Sans',
  'Raleway', 'Lato', 'Playfair Display', 'Oswald', 'Nunito',
  'Source Sans Pro', 'Ubuntu', 'Merriweather', 'Noto Sans',
]

type AnimationType = BuilderElement['animation']
const ANIMATIONS: AnimationType[] = ['none', 'fadeIn', 'slideUp', 'slideLeft', 'zoom', 'bounce']

export function FloatingToolbar({ element, onUpdateStyles, onUpdateProp }: FloatingToolbarProps) {
  const s = element.styles || {}

  const isBold = s.fontWeight === 'bold' || s.fontWeight === '700' || Number(s.fontWeight) >= 700
  const isItalic = s.fontStyle === 'italic'
  const isUnderline = s.textDecoration === 'underline'
  const hasGlow = typeof s.textShadow === 'string' && s.textShadow !== 'none' && s.textShadow.includes('currentColor')

  const fontSize = parseInt((s.fontSize as string) || '16') || 16
  const textColor = (s.color as string) || '#000000'
  const bgColor = (s.backgroundColor as string) || ''
  const align = (s.textAlign as string) || 'left'
  const font = (s.fontFamily as string) || ''
  const anim = element.animation || 'none'

  const safeColor = (c: string) => /^#[0-9a-fA-F]{3,6}$/.test(c) ? c : '#000000'

  return (
    <div
      className="absolute z-[60] flex items-center flex-wrap gap-0.5 bg-[#0B1437] border border-amber-400/40 rounded-xl px-2 py-1.5 shadow-2xl shadow-black/60 text-xs select-none"
      style={{ bottom: 'calc(100% + 6px)', left: 0, minWidth: 'max-content' }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* ── Text Color ── */}
      <label className="flex items-center gap-0.5 cursor-pointer group" title="Text Color">
        <span className="text-[10px] text-gray-400 font-bold group-hover:text-white transition-colors">A</span>
        <div className="relative">
          <input
            type="color"
            value={safeColor(textColor)}
            onChange={e => onUpdateStyles({ color: e.target.value })}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          <div className="w-4 h-4 rounded-sm border border-white/20" style={{ backgroundColor: textColor || '#000' }} />
        </div>
      </label>

      {/* ── BG Color ── */}
      <label className="flex items-center gap-0.5 cursor-pointer group" title="Background Color">
        <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">BG</span>
        <div className="relative">
          <input
            type="color"
            value={safeColor(bgColor || '#ffffff')}
            onChange={e => onUpdateStyles({ backgroundColor: e.target.value })}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          <div
            className="w-4 h-4 rounded-sm border border-white/20"
            style={{ backgroundColor: bgColor || 'transparent', backgroundImage: bgColor ? 'none' : 'repeating-conic-gradient(#aaa 0% 25%, transparent 0% 50%) 0 0/6px 6px' }}
          />
        </div>
      </label>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* ── Font Family ── */}
      <select
        value={font}
        onChange={e => onUpdateStyles({ fontFamily: e.target.value })}
        className="bg-[#0B1437] text-gray-300 text-[10px] border border-white/10 rounded px-1 py-0.5 outline-none cursor-pointer max-w-[90px]"
        title="Font Family"
      >
        <option value="">Font...</option>
        {WEB_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
      </select>

      {/* ── Font Size ── */}
      <div className="flex items-center border border-white/10 rounded overflow-hidden">
        <button
          onClick={() => onUpdateStyles({ fontSize: `${Math.max(8, fontSize - 1)}px` })}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
        >−</button>
        <input
          type="number"
          value={fontSize}
          onChange={e => onUpdateStyles({ fontSize: `${Math.max(6, Math.min(200, +e.target.value))}px` })}
          className="w-8 bg-transparent text-gray-200 text-[10px] text-center outline-none border-0"
          min={6} max={200}
        />
        <button
          onClick={() => onUpdateStyles({ fontSize: `${Math.min(200, fontSize + 1)}px` })}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
        >+</button>
      </div>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* ── Bold ── */}
      <button
        onClick={() => onUpdateStyles({ fontWeight: isBold ? '400' : '700' })}
        title="Bold"
        className={`w-6 h-6 flex items-center justify-center rounded font-bold text-sm transition-colors ${isBold ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >B</button>

      {/* ── Italic ── */}
      <button
        onClick={() => onUpdateStyles({ fontStyle: isItalic ? 'normal' : 'italic' })}
        title="Italic"
        className={`w-6 h-6 flex items-center justify-center rounded italic font-serif text-sm transition-colors ${isItalic ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >I</button>

      {/* ── Underline ── */}
      <button
        onClick={() => onUpdateStyles({ textDecoration: isUnderline ? 'none' : 'underline' })}
        title="Underline"
        className={`w-6 h-6 flex items-center justify-center rounded text-sm underline transition-colors ${isUnderline ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >U</button>

      {/* ── Glow ── */}
      <button
        onClick={() => onUpdateStyles({
          textShadow: hasGlow
            ? 'none'
            : '0 0 8px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
        })}
        title="Text Glow"
        className={`w-6 h-6 flex items-center justify-center rounded text-sm transition-colors ${hasGlow ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
      >✨</button>

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* ── Text Align ── */}
      {[
        { val: 'left',    icon: <AlignLeft size={10} /> },
        { val: 'center',  icon: <AlignCenter size={10} /> },
        { val: 'right',   icon: <AlignRight size={10} /> },
        { val: 'justify', icon: <AlignJustify size={10} /> },
      ].map(({ val, icon }) => (
        <button
          key={val}
          onClick={() => onUpdateStyles({ textAlign: val as CSSStyles['textAlign'] })}
          title={`Align ${val}`}
          className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${align === val ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
        >{icon}</button>
      ))}

      <div className="w-px h-4 bg-white/10 mx-0.5" />

      {/* ── Animation ── */}
      <select
        value={anim}
        onChange={e => onUpdateProp({ animation: e.target.value as AnimationType })}
        className="bg-[#0B1437] text-gray-300 text-[10px] border border-white/10 rounded px-1 py-0.5 outline-none cursor-pointer"
        title="Animation"
      >
        {ANIMATIONS.map(a => (
          <option key={a} value={a}>{a === 'none' ? '⚡ Anim' : a}</option>
        ))}
      </select>
    </div>
  )
}
