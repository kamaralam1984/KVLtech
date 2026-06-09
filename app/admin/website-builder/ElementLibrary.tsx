"use client";

import { useState } from "react";
import {
  Type,
  AlignLeft,
  AlignJustify,
  MessageSquare,
  List,
  MousePointer,
  Layers,
  Image,
  Grid,
  Play,
  SlidersHorizontal,
  MoveHorizontal,
  Minus,
  ChevronsUpDown,
  Star,
  Box,
  TrendingUp,
  Timer,
  BarChart2,
  Tag,
  ChevronDown,
  ChevronUp,
  Map,
  Share2,
  Navigation,
  PanelBottom,
  Zap,
  Megaphone,
  Mail,
  HelpCircle,
  Plus,
  Search,
  FileText,
} from "lucide-react";
import type { ElementType } from "./builder-types";

interface ElementLibraryProps {
  onAddElement: (type: ElementType, config?: Record<string, unknown>) => void;
  onAddSection: (preset?: string) => void;
}

interface ElementDef {
  type: ElementType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface CategoryDef {
  name: string;
  elements: ElementDef[];
}

const ICON_SIZE = 20;
const GOLD = "#C9A227";

const CATEGORIES: CategoryDef[] = [
  {
    name: "TEXT",
    elements: [
      { type: "heading", name: "Heading", description: "Title & subtitles", icon: <Type size={ICON_SIZE} color={GOLD} /> },
      { type: "paragraph", name: "Paragraph", description: "Body text block", icon: <AlignLeft size={ICON_SIZE} color={GOLD} /> },
      { type: "richtext", name: "Rich Text", description: "Formatted HTML", icon: <AlignJustify size={ICON_SIZE} color={GOLD} /> },
      { type: "quote", name: "Quote", description: "Blockquote callout", icon: <MessageSquare size={ICON_SIZE} color={GOLD} /> },
      { type: "list", name: "List", description: "Bullet or numbered", icon: <List size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "BUTTONS",
    elements: [
      { type: "button", name: "Button", description: "CTA or link", icon: <MousePointer size={ICON_SIZE} color={GOLD} /> },
      { type: "buttongroup", name: "Button Group", description: "Multiple buttons", icon: <Layers size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "MEDIA",
    elements: [
      { type: "image", name: "Image", description: "Photo or graphic", icon: <Image size={ICON_SIZE} color={GOLD} /> },
      { type: "gallery", name: "Gallery", description: "Image grid layout", icon: <Grid size={ICON_SIZE} color={GOLD} /> },
      { type: "video", name: "Video", description: "Embed or upload", icon: <Play size={ICON_SIZE} color={GOLD} /> },
      { type: "slider", name: "Slider", description: "Carousel slides", icon: <SlidersHorizontal size={ICON_SIZE} color={GOLD} /> },
      { type: "marquee", name: "Marquee", description: "Scrolling ticker", icon: <MoveHorizontal size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "LAYOUT",
    elements: [
      { type: "divider", name: "Divider", description: "Horizontal rule", icon: <Minus size={ICON_SIZE} color={GOLD} /> },
      { type: "spacer", name: "Spacer", description: "Vertical gap", icon: <ChevronsUpDown size={ICON_SIZE} color={GOLD} /> },
      { type: "icon", name: "Icon", description: "Single SVG icon", icon: <Star size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "WIDGETS",
    elements: [
      { type: "iconbox", name: "Icon Box", description: "Icon with text", icon: <Box size={ICON_SIZE} color={GOLD} /> },
      { type: "counter", name: "Counter", description: "Animated number", icon: <TrendingUp size={ICON_SIZE} color={GOLD} /> },
      { type: "countdown", name: "Countdown Timer", description: "Date countdown", icon: <Timer size={ICON_SIZE} color={GOLD} /> },
      { type: "progress", name: "Progress Bar", description: "Skill or stat bar", icon: <BarChart2 size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "CONTENT BLOCKS",
    elements: [
      { type: "testimonial", name: "Testimonial", description: "Review or quote", icon: <MessageSquare size={ICON_SIZE} color={GOLD} /> },
      { type: "pricing", name: "Pricing Table", description: "Plan comparison", icon: <Tag size={ICON_SIZE} color={GOLD} /> },
      { type: "accordion", name: "Accordion", description: "Collapsible items", icon: <ChevronDown size={ICON_SIZE} color={GOLD} /> },
      { type: "tabs", name: "Tabs", description: "Tabbed content", icon: <Layers size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "INTERACTIVE",
    elements: [
      { type: "form", name: "Contact Form", description: "Lead capture form", icon: <FileText size={ICON_SIZE} color={GOLD} /> },
      { type: "map", name: "Google Map", description: "Embedded map", icon: <Map size={ICON_SIZE} color={GOLD} /> },
      { type: "social", name: "Social Links", description: "Social media row", icon: <Share2 size={ICON_SIZE} color={GOLD} /> },
    ],
  },
  {
    name: "STRUCTURE",
    elements: [
      { type: "navbar", name: "Navbar", description: "Site navigation", icon: <Navigation size={ICON_SIZE} color={GOLD} /> },
      { type: "footer", name: "Footer", description: "Page footer block", icon: <PanelBottom size={ICON_SIZE} color={GOLD} /> },
      { type: "hero", name: "Hero Section", description: "Above-fold hero", icon: <Zap size={ICON_SIZE} color={GOLD} /> },
      { type: "cta", name: "CTA Banner", description: "Conversion banner", icon: <Megaphone size={ICON_SIZE} color={GOLD} /> },
    ],
  },
];

interface SectionPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const SECTION_PRESETS: SectionPreset[] = [
  { id: "hero", name: "Hero Section", icon: <Zap size={24} />, color: "#3B82F6" },
  { id: "features", name: "3-Col Features", icon: <Grid size={24} />, color: "#22C55E" },
  { id: "testimonials", name: "Testimonials", icon: <MessageSquare size={24} />, color: "#A855F7" },
  { id: "pricing", name: "Pricing Table", icon: <Tag size={24} />, color: "#C9A227" },
  { id: "contact", name: "Contact Form", icon: <Mail size={24} />, color: "#EF4444" },
  { id: "gallery", name: "Gallery", icon: <Image size={24} />, color: "#06B6D4" },
  { id: "faq", name: "FAQ/Accordion", icon: <HelpCircle size={24} />, color: "#F97316" },
  { id: "cta", name: "CTA Banner", icon: <Megaphone size={24} />, color: "#EC4899" },
  { id: "stats", name: "Stats Counter", icon: <TrendingUp size={24} />, color: "#6366F1" },
  { id: "blank", name: "Blank Section", icon: <Plus size={24} />, color: "#6B7280" },
];

export function ElementLibrary({ onAddElement, onAddSection }: ElementLibraryProps) {
  const [activeTab, setActiveTab] = useState<"elements" | "sections">("elements");
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.name, true]))
  );

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    elements: cat.elements.filter(
      (el) =>
        !search ||
        el.name.toLowerCase().includes(search.toLowerCase()) ||
        el.description.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.elements.length > 0);

  return (
    <div
      className="flex flex-col h-full select-none"
      style={{ backgroundColor: "#0D1628" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
          Elements
        </p>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements..."
            className="w-full rounded-lg py-1.5 pl-8 pr-3 text-xs text-white bg-white/5 border border-white/10 outline-none transition-colors placeholder:text-gray-500"
            style={{ "--tw-ring-color": GOLD } as React.CSSProperties}
            onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mx-4 flex-shrink-0">
        <button
          onClick={() => setActiveTab("elements")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === "elements" ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
          style={
            activeTab === "elements"
              ? { borderBottom: `2px solid ${GOLD}`, color: "#fff" }
              : { borderBottom: "2px solid transparent" }
          }
        >
          Elements
        </button>
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            activeTab === "sections" ? "text-white" : "text-gray-500 hover:text-gray-300"
          }`}
          style={
            activeTab === "sections"
              ? { borderBottom: `2px solid ${GOLD}`, color: "#fff" }
              : { borderBottom: "2px solid transparent" }
          }
        >
          Sections
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "elements" ? (
          <div className="py-2">
            {filteredCategories.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No elements found.</p>
            ) : (
              filteredCategories.map((cat) => (
                <div key={cat.name}>
                  {/* Category header */}
                  <button
                    className="flex items-center justify-between w-full px-4 py-2 hover:bg-white/5 transition-colors"
                    onClick={() => toggleCategory(cat.name)}
                  >
                    <span className="text-xs font-semibold tracking-widest text-gray-400">
                      {cat.name}
                    </span>
                    {openCategories[cat.name] ? (
                      <ChevronUp size={12} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={12} className="text-gray-500" />
                    )}
                  </button>

                  {/* Elements */}
                  {openCategories[cat.name] && (
                    <div className="pb-1">
                      {cat.elements.map((el) => (
                        <div
                          key={el.type}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("elementType", el.type)}
                          onClick={() => onAddElement(el.type)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab hover:bg-white/5 transition-colors mx-2"
                        >
                          <span className="flex-shrink-0">{el.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm text-white leading-none mb-0.5">{el.name}</p>
                            <p className="text-xs text-gray-500 truncate">{el.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 gap-2">
            {SECTION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onAddSection(preset.id)}
                className="rounded-lg border border-white/10 p-3 flex flex-col items-center gap-2 cursor-pointer transition-all hover:bg-white/5 text-left"
                style={{ "--hover-border": GOLD } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              >
                <span style={{ color: preset.color }}>{preset.icon}</span>
                <span className="text-sm text-white text-center leading-tight">{preset.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/10 flex items-center justify-between">
        <p className="text-xs text-gray-500">Need help?</p>
        <button
          onClick={() => onAddElement("hero")}
          className="text-xs px-3 py-1 rounded border transition-colors hover:bg-amber-400/10"
          style={{ borderColor: GOLD, color: GOLD }}
        >
          Use AI
        </button>
      </div>
    </div>
  );
}
