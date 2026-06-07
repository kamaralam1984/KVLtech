"use client"

import { useState } from "react"
import { Reorder } from "framer-motion"
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  Wand2,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react"
import type { GeneratedWebsite, WebsiteSection } from "@/lib/website-builder"

// ── Types ────────────────────────────────────────────────────────────────────

export interface WebsiteBuilderEditorProps {
  website: GeneratedWebsite
  onChange: (updated: GeneratedWebsite) => void
  onRegenerateSection: (sectionType: string) => Promise<void>
  regeneratingSection: string | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_SECTION_TYPES: WebsiteSection["type"][] = [
  "hero", "about", "services", "portfolio", "testimonials",
  "pricing", "faq", "contact", "cta",
]

const BADGE_COLORS: Record<string, string> = {
  hero: "bg-yellow-100 text-yellow-700",
  about: "bg-blue-100 text-blue-700",
  services: "bg-purple-100 text-purple-700",
  portfolio: "bg-green-100 text-green-700",
  testimonials: "bg-pink-100 text-pink-700",
  pricing: "bg-orange-100 text-orange-700",
  faq: "bg-teal-100 text-teal-700",
  contact: "bg-red-100 text-red-700",
  cta: "bg-indigo-100 text-indigo-700",
}

// ── Section Card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: WebsiteSection
  index: number
  total: number
  regenerating: boolean
  onUpdate: (updated: WebsiteSection) => void
  onMove: (dir: "up" | "down") => void
  onRemove: () => void
  onRegenerate: () => void
}

function SectionCard({
  section,
  index,
  total,
  regenerating,
  onUpdate,
  onMove,
  onRemove,
  onRegenerate,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(section.heading)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const saveTitle = () => {
    onUpdate({ ...section, heading: titleVal.trim() || section.heading })
    setEditingTitle(false)
  }

  const updateItem = (i: number, field: "title" | "description", val: string) => {
    const items = [...(section.items || [])]
    items[i] = { ...items[i], [field]: val }
    onUpdate({ ...section, items })
  }

  const addItem = () => {
    const items = [...(section.items || []), { title: "New Item", description: "" }]
    onUpdate({ ...section, items })
  }

  const removeItem = (i: number) => {
    const items = (section.items || []).filter((_, idx) => idx !== i)
    onUpdate({ ...section, items })
  }

  const badgeCls = BADGE_COLORS[section.type] ?? "bg-gray-100 text-gray-700"

  return (
    <Reorder.Item
      value={section}
      id={section.type + "-" + index}
      className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] mb-3 select-none"
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 p-3">
        {/* Drag handle */}
        <div
          className="pt-1 shrink-0 cursor-grab active:cursor-grabbing text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>

        {/* Badge + heading */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${badgeCls}`}>
              {section.type}
            </span>
            {section.items && section.items.length > 0 && (
              <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)] rounded-full px-2 py-0.5">
                {section.items.length} items
              </span>
            )}
          </div>

          {editingTitle ? (
            <div className="flex gap-1.5 mb-1">
              <input
                value={titleVal}
                onChange={(e) => setTitleVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle()
                  if (e.key === "Escape") setEditingTitle(false)
                }}
                onBlur={saveTitle}
                autoFocus
                className="flex-1 px-2 py-1 text-sm font-semibold rounded-lg border border-[var(--color-gold)] bg-[var(--color-bg-secondary)] outline-none"
              />
            </div>
          ) : (
            <button
              onClick={() => { setTitleVal(section.heading); setEditingTitle(true) }}
              className="group flex items-center gap-1 text-left"
            >
              <span className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-gold)] transition-colors line-clamp-1">
                {section.heading}
              </span>
              <Pencil size={11} className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
            </button>
          )}

          {section.content && !expanded && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
              {section.content.slice(0, 80)}{section.content.length > 80 ? "…" : ""}
            </p>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Move up/down */}
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            title="Move up"
            className="p-1 rounded hover:bg-[var(--color-bg-secondary)] disabled:opacity-25 transition-colors"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            title="Move down"
            className="p-1 rounded hover:bg-[var(--color-bg-secondary)] disabled:opacity-25 transition-colors"
          >
            <ChevronDown size={13} />
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            title="Regenerate with AI"
            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-50"
          >
            {regenerating ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
          </button>

          {/* Expand/collapse */}
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand editor"}
            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            <ChevronDown size={13} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          {/* Remove */}
          {confirmRemove ? (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => { setConfirmRemove(false); onRemove() }}
                className="px-2 py-1 text-[10px] font-bold bg-red-500 text-white rounded-lg"
              >
                Remove
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                className="p-1 rounded-lg hover:bg-[var(--color-bg-secondary)]"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              title="Remove section"
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-3">
          {/* Heading */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
              Heading
            </label>
            <input
              value={section.heading}
              onChange={(e) => onUpdate({ ...section, heading: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] outline-none focus:border-[var(--color-gold)] transition-all"
            />
          </div>

          {/* Subheading */}
          {"subheading" in section && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
                Subheading
              </label>
              <input
                value={section.subheading ?? ""}
                onChange={(e) => onUpdate({ ...section, subheading: e.target.value })}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] outline-none focus:border-[var(--color-gold)] transition-all"
              />
            </div>
          )}

          {/* Content */}
          {section.content !== undefined && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
                Content
              </label>
              <textarea
                value={section.content}
                onChange={(e) => onUpdate({ ...section, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] outline-none focus:border-[var(--color-gold)] transition-all resize-none"
              />
            </div>
          )}

          {/* Items editor */}
          {section.items !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Items ({section.items.length})
                </label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-gold)] hover:opacity-80 transition-opacity"
                >
                  <Plus size={11} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(i, "title", e.target.value)}
                        placeholder="Title"
                        className="flex-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg)] outline-none focus:border-[var(--color-gold)] transition-all font-medium"
                      />
                      <button
                        onClick={() => removeItem(i)}
                        className="p-1 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg)] outline-none focus:border-[var(--color-gold)] transition-all resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Reorder.Item>
  )
}

// ── Main Editor ───────────────────────────────────────────────────────────────

export function WebsiteBuilderEditor({
  website,
  onChange,
  onRegenerateSection,
  regeneratingSection,
}: WebsiteBuilderEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sections = website.sections

  const handleReorder = (newSections: WebsiteSection[]) => {
    onChange({ ...website, sections: newSections })
  }

  const handleUpdate = (index: number, updated: WebsiteSection) => {
    const next = sections.map((s, i) => (i === index ? updated : s))
    onChange({ ...website, sections: next })
  }

  const handleMove = (index: number, dir: "up" | "down") => {
    const next = [...sections]
    const swapIdx = dir === "up" ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[index], next[swapIdx]] = [next[swapIdx], next[index]]
    onChange({ ...website, sections: next })
  }

  const handleRemove = (index: number) => {
    const next = sections.filter((_, i) => i !== index)
    onChange({ ...website, sections: next })
  }

  const addSection = (type: WebsiteSection["type"]) => {
    const newSection: WebsiteSection = {
      type,
      heading: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: "",
      items: ["services", "pricing", "testimonials", "portfolio", "faq"].includes(type) ? [] : undefined,
    }
    onChange({ ...website, sections: [...sections, newSection] })
    setShowAddMenu(false)
  }

  const existingTypes = new Set(sections.map((s) => s.type))
  const availableTypes = ALL_SECTION_TYPES.filter((t) => !existingTypes.has(t))

  return (
    <div className="flex flex-col h-full">
      {/* Section count */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wide">
          Sections ({sections.length})
        </h2>
        <p className="text-[10px] text-[var(--color-text-muted)]">Drag to reorder</p>
      </div>

      {/* Draggable list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="outline-none"
        >
          {sections.map((section, index) => (
            <SectionCard
              key={`${section.type}-${index}`}
              section={section}
              index={index}
              total={sections.length}
              regenerating={regeneratingSection === section.type}
              onUpdate={(updated) => handleUpdate(index, updated)}
              onMove={(dir) => handleMove(index, dir)}
              onRemove={() => handleRemove(index)}
              onRegenerate={() => onRegenerateSection(section.type)}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* Add Section */}
      {availableTypes.length > 0 && (
        <div className="relative pt-3 border-t border-[var(--color-border)] mt-2">
          <button
            onClick={() => setShowAddMenu((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            <Plus size={13} /> Add Section
          </button>

          {showAddMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-xl z-20 p-2">
              <p className="text-[10px] font-semibold uppercase text-[var(--color-text-muted)] px-2 pb-1.5">
                Available Sections
              </p>
              <div className="grid grid-cols-2 gap-1">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium capitalize hover:bg-[var(--color-bg-secondary)] transition-colors text-left ${
                      BADGE_COLORS[type]
                        ? BADGE_COLORS[type].split(" ")[1]
                        : "text-[var(--color-text)]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${BADGE_COLORS[type]?.split(" ")[0] ?? "bg-gray-300"}`} />
                    {type}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddMenu(false)}
                className="w-full mt-1 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
