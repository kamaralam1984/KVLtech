"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
  SelectionState,
  WebsiteProject,
  BuilderElement,
  Section,
  GlobalStyles,
  CSSStyles,
} from "./builder-types";

// ─── Helper components ───────────────────────────────────────────────────────

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono focus:border-amber-400 outline-none"
        />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <div className="flex gap-1 items-center">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-amber-400 outline-none"
        />
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}

function TextInputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-amber-400 outline-none"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 3}
        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-amber-400 outline-none resize-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-3">
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0D1628] border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-amber-400 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <label className="text-xs text-gray-400">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${
          value ? "bg-amber-500" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function AccordionSection({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
      >
        {title} {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PropertiesPanelProps {
  selection: SelectionState;
  project: WebsiteProject;
  onUpdateElement: (
    sectionId: string,
    columnId: string,
    elementId: string,
    updates: Partial<BuilderElement>
  ) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateGlobalStyles: (styles: Partial<GlobalStyles>) => void;
}

export function PropertiesPanel({
  selection,
  project,
  onUpdateElement,
  onUpdateSection,
  onUpdateGlobalStyles,
}: PropertiesPanelProps) {
  const [elementTab, setElementTab] = useState<"content" | "style" | "advanced">("content");

  // ── Lookup helpers ──────────────────────────────────────────────────────────

  const findSection = useCallback((): Section | null => {
    if (!selection.sectionId) return null;
    for (const page of project.pages) {
      const sec = page.sections.find((s) => s.id === selection.sectionId);
      if (sec) return sec;
    }
    return null;
  }, [selection.sectionId, project.pages]);

  const findElement = useCallback((): {
    element: BuilderElement;
    sectionId: string;
    columnId: string;
  } | null => {
    if (!selection.elementId) return null;
    for (const page of project.pages) {
      for (const section of page.sections) {
        for (const column of section.columns) {
          const el = column.elements.find((e) => e.id === selection.elementId);
          if (el) return { element: el, sectionId: section.id, columnId: column.id };
        }
      }
    }
    return null;
  }, [selection.elementId, project.pages]);

  // ── Global settings panel ───────────────────────────────────────────────────

  const renderGlobalSettings = () => {
    const gs = project.globalStyles;
    const fontOptions = [
      { value: "Inter", label: "Inter" },
      { value: "Roboto", label: "Roboto" },
      { value: "Open Sans", label: "Open Sans" },
      { value: "Poppins", label: "Poppins" },
      { value: "Playfair Display", label: "Playfair Display" },
      { value: "Montserrat", label: "Montserrat" },
    ];
    return (
      <div>
        <AccordionSection title="Colors" defaultOpen>
          <ColorPicker
            label="Primary Color"
            value={gs.primaryColor}
            onChange={(v) => onUpdateGlobalStyles({ primaryColor: v })}
          />
          <ColorPicker
            label="Secondary Color"
            value={gs.secondaryColor}
            onChange={(v) => onUpdateGlobalStyles({ secondaryColor: v })}
          />
          <ColorPicker
            label="Accent Color"
            value={gs.accentColor}
            onChange={(v) => onUpdateGlobalStyles({ accentColor: v })}
          />
        </AccordionSection>
        <AccordionSection title="Typography" defaultOpen>
          <SelectField
            label="Heading Font"
            value={gs.headingFont}
            onChange={(v) => onUpdateGlobalStyles({ headingFont: v })}
            options={fontOptions}
          />
          <SelectField
            label="Body Font"
            value={gs.bodyFont}
            onChange={(v) => onUpdateGlobalStyles({ bodyFont: v })}
            options={fontOptions}
          />
          <NumberInput
            label="Base Font Size"
            value={gs.baseFontSize}
            onChange={(v) => onUpdateGlobalStyles({ baseFontSize: v })}
            min={10}
            max={24}
            unit="px"
          />
        </AccordionSection>
        <AccordionSection title="Layout" defaultOpen>
          <NumberInput
            label="Max Width"
            value={gs.maxWidth}
            onChange={(v) => onUpdateGlobalStyles({ maxWidth: v })}
            min={800}
            max={1920}
            unit="px"
          />
          <SelectField
            label="Border Radius"
            value={gs.borderRadius}
            onChange={(v) => onUpdateGlobalStyles({ borderRadius: v })}
            options={[
              { value: "none", label: "None" },
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
            ]}
          />
        </AccordionSection>
      </div>
    );
  };

  // ── Section panel ───────────────────────────────────────────────────────────

  const renderSectionSettings = () => {
    const section = findSection();
    if (!section) return <p className="text-xs text-gray-500 px-4 py-4">Section not found.</p>;
    const sid = section.id;

    return (
      <div>
        <AccordionSection title="Background" defaultOpen>
          <SelectField
            label="Type"
            value={section.background.type}
            onChange={(v) =>
              onUpdateSection(sid, {
                background: { ...section.background, type: v as Section["background"]["type"] },
              })
            }
            options={[
              { value: "color", label: "Solid Color" },
              { value: "gradient", label: "Gradient" },
              { value: "image", label: "Image" },
            ]}
          />
          {section.background.type === "color" && (
            <ColorPicker
              label="Background Color"
              value={section.background.value || "#ffffff"}
              onChange={(v) =>
                onUpdateSection(sid, {
                  background: { ...section.background, value: v },
                })
              }
            />
          )}
          {section.background.type === "gradient" && (
            <>
              <ColorPicker
                label="Color From"
                value={section.background.value?.split(",")[0]?.trim() || "#000000"}
                onChange={(v) => {
                  const parts = section.background.value?.split(",") || ["#000000", "#ffffff", "180deg"];
                  parts[0] = v;
                  onUpdateSection(sid, { background: { ...section.background, value: parts.join(",") } });
                }}
              />
              <ColorPicker
                label="Color To"
                value={section.background.value?.split(",")[1]?.trim() || "#ffffff"}
                onChange={(v) => {
                  const parts = section.background.value?.split(",") || ["#000000", "#ffffff", "180deg"];
                  parts[1] = v;
                  onUpdateSection(sid, { background: { ...section.background, value: parts.join(",") } });
                }}
              />
              <SelectField
                label="Direction"
                value={section.background.value?.split(",")[2]?.trim() || "180deg"}
                onChange={(v) => {
                  const parts = section.background.value?.split(",") || ["#000000", "#ffffff", "180deg"];
                  parts[2] = v;
                  onUpdateSection(sid, { background: { ...section.background, value: parts.join(",") } });
                }}
                options={[
                  { value: "0deg", label: "Top" },
                  { value: "90deg", label: "Right" },
                  { value: "180deg", label: "Bottom" },
                  { value: "270deg", label: "Left" },
                  { value: "135deg", label: "Diagonal ↘" },
                  { value: "45deg", label: "Diagonal ↗" },
                ]}
              />
            </>
          )}
          {section.background.type === "image" && (
            <TextInputField
              label="Image URL"
              value={section.background.value}
              onChange={(v) =>
                onUpdateSection(sid, { background: { ...section.background, value: v } })
              }
              placeholder="https://..."
            />
          )}
          <NumberInput
            label="Overlay Opacity"
            value={section.background.overlay ?? 0}
            onChange={(v) =>
              onUpdateSection(sid, { background: { ...section.background, overlay: v } })
            }
            min={0}
            max={100}
            unit="%"
          />
        </AccordionSection>
        <AccordionSection title="Spacing" defaultOpen>
          <NumberInput
            label="Padding Top"
            value={section.padding.top}
            onChange={(v) => onUpdateSection(sid, { padding: { ...section.padding, top: v } })}
            min={0}
            unit="px"
          />
          <NumberInput
            label="Padding Bottom"
            value={section.padding.bottom}
            onChange={(v) => onUpdateSection(sid, { padding: { ...section.padding, bottom: v } })}
            min={0}
            unit="px"
          />
          <NumberInput
            label="Margin Top"
            value={section.margin.top}
            onChange={(v) => onUpdateSection(sid, { margin: { ...section.margin, top: v } })}
            unit="px"
          />
          <NumberInput
            label="Margin Bottom"
            value={section.margin.bottom}
            onChange={(v) => onUpdateSection(sid, { margin: { ...section.margin, bottom: v } })}
            unit="px"
          />
        </AccordionSection>
        <AccordionSection title="Layout" defaultOpen>
          <SelectField
            label="Max Width"
            value={section.maxWidth}
            onChange={(v) => onUpdateSection(sid, { maxWidth: v as Section["maxWidth"] })}
            options={[
              { value: "full", label: "Full Width" },
              { value: "xl", label: "XL (1280px)" },
              { value: "lg", label: "LG (1024px)" },
              { value: "md", label: "MD (768px)" },
            ]}
          />
        </AccordionSection>
        <AccordionSection title="Settings" defaultOpen>
          <Toggle
            label="Hidden"
            value={section.hidden ?? false}
            onChange={(v) => onUpdateSection(sid, { hidden: v })}
          />
          <Toggle
            label="Sticky"
            value={section.sticky ?? false}
            onChange={(v) => onUpdateSection(sid, { sticky: v })}
          />
        </AccordionSection>
      </div>
    );
  };

  // ── Element content tab ─────────────────────────────────────────────────────

  const renderElementContent = (
    el: BuilderElement,
    sectionId: string,
    columnId: string
  ) => {
    const cfg = el.config as Record<string, unknown>;
    const update = (key: string, value: unknown) =>
      onUpdateElement(sectionId, columnId, el.id, { config: { ...cfg, [key]: value } });

    switch (el.type) {
      case "heading":
        return (
          <>
            <TextareaField
              label="Text"
              value={(cfg.text as string) || ""}
              onChange={(v) => update("text", v)}
              rows={3}
            />
            <SelectField
              label="Heading Level"
              value={String(cfg.level || "2")}
              onChange={(v) => update("level", Number(v))}
              options={[
                { value: "1", label: "H1" },
                { value: "2", label: "H2" },
                { value: "3", label: "H3" },
                { value: "4", label: "H4" },
              ]}
            />
          </>
        );

      case "paragraph":
        return (
          <TextareaField
            label="Text"
            value={(cfg.text as string) || ""}
            onChange={(v) => update("text", v)}
            rows={5}
          />
        );

      case "richtext":
        return (
          <TextareaField
            label="HTML Content"
            value={(cfg.html as string) || ""}
            onChange={(v) => update("html", v)}
            rows={8}
          />
        );

      case "quote":
        return (
          <TextareaField
            label="Quote Text"
            value={(cfg.text as string) || ""}
            onChange={(v) => update("text", v)}
          />
        );

      case "list":
        return (
          <TextareaField
            label="Items (one per line)"
            value={((cfg.items as string[]) || []).join("\n")}
            onChange={(v) => update("items", v.split("\n"))}
            rows={5}
          />
        );

      case "button":
        return (
          <>
            <TextInputField
              label="Label"
              value={(cfg.label as string) || ""}
              onChange={(v) => update("label", v)}
              placeholder="Click here"
            />
            <TextInputField
              label="URL"
              value={(cfg.href as string) || ""}
              onChange={(v) => update("href", v)}
              placeholder="https://..."
            />
            <SelectField
              label="Variant"
              value={(cfg.variant as string) || "primary"}
              onChange={(v) => update("variant", v)}
              options={[
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
                { value: "outline", label: "Outline" },
                { value: "ghost", label: "Ghost" },
                { value: "link", label: "Link" },
              ]}
            />
            <SelectField
              label="Size"
              value={(cfg.size as string) || "md"}
              onChange={(v) => update("size", v)}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </>
        );

      case "image":
        return (
          <>
            <TextInputField
              label="Image URL"
              value={(cfg.src as string) || ""}
              onChange={(v) => update("src", v)}
              placeholder="https://..."
            />
            <TextInputField
              label="Alt Text"
              value={(cfg.alt as string) || ""}
              onChange={(v) => update("alt", v)}
              placeholder="Descriptive alt text"
            />
            <SelectField
              label="Object Fit"
              value={(cfg.fit as string) || "cover"}
              onChange={(v) => update("fit", v)}
              options={[
                { value: "cover", label: "Cover" },
                { value: "contain", label: "Contain" },
                { value: "fill", label: "Fill" },
              ]}
            />
          </>
        );

      case "gallery": {
        const images = (cfg.images as Array<{ src: string }>) || [];
        const urls = images.map((i) => i.src).join("\n");
        return (
          <>
            <NumberInput
              label="Columns"
              value={(cfg.columns as number) || 3}
              onChange={(v) => update("columns", v)}
              min={2}
              max={4}
            />
            <TextareaField
              label="Image URLs (one per line)"
              value={urls}
              onChange={(v) => {
                const newImages = v
                  .split("\n")
                  .filter(Boolean)
                  .map((src) => ({ src, alt: "", fit: "cover" }));
                update("images", newImages);
              }}
              rows={6}
            />
          </>
        );
      }

      case "slider":
        return (
          <>
            <Toggle
              label="Auto Play"
              value={(cfg.autoPlay as boolean) || false}
              onChange={(v) => update("autoPlay", v)}
            />
            <NumberInput
              label="Interval (ms)"
              value={(cfg.interval as number) || 3000}
              onChange={(v) => update("interval", v)}
              min={500}
              unit="ms"
            />
            <Toggle
              label="Show Arrows"
              value={(cfg.arrows as boolean) ?? true}
              onChange={(v) => update("arrows", v)}
            />
            <Toggle
              label="Show Dots"
              value={(cfg.dots as boolean) ?? true}
              onChange={(v) => update("dots", v)}
            />
            <SelectField
              label="Transition Effect"
              value={(cfg.effect as string) || "slide"}
              onChange={(v) => update("effect", v)}
              options={[
                { value: "slide", label: "Slide" },
                { value: "fade", label: "Fade" },
              ]}
            />
            <TextareaField
              label="Slides (JSON: [{src,alt,heading,text}])"
              value={JSON.stringify(cfg.slides || [], null, 2)}
              onChange={(v) => {
                try {
                  update("slides", JSON.parse(v));
                } catch {
                  // keep editing
                }
              }}
              rows={6}
            />
          </>
        );

      case "marquee":
        return (
          <>
            <TextareaField
              label="Items (one per line)"
              value={((cfg.items as string[]) || []).join("\n")}
              onChange={(v) => update("items", v.split("\n").filter(Boolean))}
              rows={4}
            />
            <NumberInput
              label="Speed"
              value={(cfg.speed as number) || 50}
              onChange={(v) => update("speed", v)}
              min={10}
              max={200}
            />
            <SelectField
              label="Direction"
              value={(cfg.direction as string) || "left"}
              onChange={(v) => update("direction", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ]}
            />
            <TextInputField
              label="Separator"
              value={(cfg.separator as string) || " • "}
              onChange={(v) => update("separator", v)}
            />
          </>
        );

      case "video":
        return (
          <>
            <TextInputField
              label="Video URL"
              value={(cfg.src as string) || ""}
              onChange={(v) => update("src", v)}
              placeholder="https://..."
            />
            <TextInputField
              label="Poster Image URL"
              value={(cfg.poster as string) || ""}
              onChange={(v) => update("poster", v)}
              placeholder="https://..."
            />
            <Toggle
              label="Auto Play"
              value={(cfg.autoPlay as boolean) || false}
              onChange={(v) => update("autoPlay", v)}
            />
            <Toggle
              label="Muted"
              value={(cfg.muted as boolean) || false}
              onChange={(v) => update("muted", v)}
            />
            <Toggle
              label="Show Controls"
              value={(cfg.controls as boolean) ?? true}
              onChange={(v) => update("controls", v)}
            />
            <Toggle
              label="Loop"
              value={(cfg.loop as boolean) || false}
              onChange={(v) => update("loop", v)}
            />
          </>
        );

      case "iconbox":
        return (
          <>
            <TextInputField
              label="Icon Name"
              value={(cfg.icon as string) || ""}
              onChange={(v) => update("icon", v)}
              placeholder="e.g. Star, Heart, Check"
            />
            <TextInputField
              label="Title"
              value={(cfg.title as string) || ""}
              onChange={(v) => update("title", v)}
            />
            <TextareaField
              label="Description"
              value={(cfg.description as string) || ""}
              onChange={(v) => update("description", v)}
            />
            <SelectField
              label="Alignment"
              value={(cfg.align as string) || "left"}
              onChange={(v) => update("align", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
              ]}
            />
          </>
        );

      case "counter":
        return (
          <TextareaField
            label="Items (JSON: [{value,label,suffix}])"
            value={JSON.stringify(cfg.items || [], null, 2)}
            onChange={(v) => {
              try {
                update("items", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={6}
          />
        );

      case "countdown":
        return (
          <>
            <TextInputField
              label="Target Date (YYYY-MM-DD)"
              value={(cfg.targetDate as string) || ""}
              onChange={(v) => update("targetDate", v)}
              placeholder="2025-12-31"
            />
            <TextInputField
              label="Label"
              value={(cfg.label as string) || ""}
              onChange={(v) => update("label", v)}
              placeholder="Until launch"
            />
          </>
        );

      case "progress":
        return (
          <TextareaField
            label="Items (JSON: [{label,value}])"
            value={JSON.stringify(cfg.items || [], null, 2)}
            onChange={(v) => {
              try {
                update("items", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={6}
          />
        );

      case "testimonial":
        return (
          <>
            <TextInputField
              label="Name"
              value={(cfg.name as string) || ""}
              onChange={(v) => update("name", v)}
            />
            <TextInputField
              label="Role"
              value={(cfg.role as string) || ""}
              onChange={(v) => update("role", v)}
            />
            <TextInputField
              label="Company"
              value={(cfg.company as string) || ""}
              onChange={(v) => update("company", v)}
            />
            <TextareaField
              label="Testimonial Text"
              value={(cfg.text as string) || ""}
              onChange={(v) => update("text", v)}
            />
            <NumberInput
              label="Rating"
              value={(cfg.rating as number) || 5}
              onChange={(v) => update("rating", v)}
              min={1}
              max={5}
            />
          </>
        );

      case "pricing":
        return (
          <TextareaField
            label="Plans (JSON array)"
            value={JSON.stringify(cfg.plans || [], null, 2)}
            onChange={(v) => {
              try {
                update("plans", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={10}
          />
        );

      case "accordion":
        return (
          <TextareaField
            label="Items (JSON: [{id,question,answer}])"
            value={JSON.stringify(cfg.items || [], null, 2)}
            onChange={(v) => {
              try {
                update("items", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={8}
          />
        );

      case "tabs":
        return (
          <TextareaField
            label="Tabs (JSON: [{id,label,content}])"
            value={JSON.stringify(cfg.tabs || [], null, 2)}
            onChange={(v) => {
              try {
                update("tabs", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={8}
          />
        );

      case "form":
        return (
          <>
            <TextareaField
              label="Fields (JSON)"
              value={JSON.stringify(cfg.fields || [], null, 2)}
              onChange={(v) => {
                try {
                  update("fields", JSON.parse(v));
                } catch {
                  // keep editing
                }
              }}
              rows={8}
            />
            <TextInputField
              label="Submit Label"
              value={(cfg.submitLabel as string) || "Submit"}
              onChange={(v) => update("submitLabel", v)}
            />
            <TextInputField
              label="Success Message"
              value={(cfg.successMessage as string) || "Thank you!"}
              onChange={(v) => update("successMessage", v)}
            />
          </>
        );

      case "map":
        return (
          <>
            <TextInputField
              label="Address / Embed URL"
              value={(cfg.address as string) || ""}
              onChange={(v) => update("address", v)}
              placeholder="Street, City or iframe src"
            />
            <NumberInput
              label="Zoom"
              value={(cfg.zoom as number) || 14}
              onChange={(v) => update("zoom", v)}
              min={1}
              max={20}
            />
            <NumberInput
              label="Map Height (px)"
              value={(cfg.height as number) || 400}
              onChange={(v) => update("height", v)}
              min={100}
              unit="px"
            />
          </>
        );

      case "social":
        return (
          <TextareaField
            label="Links (JSON: [{platform,url}])"
            value={JSON.stringify(cfg.links || [], null, 2)}
            onChange={(v) => {
              try {
                update("links", JSON.parse(v));
              } catch {
                // keep editing
              }
            }}
            rows={6}
          />
        );

      case "navbar":
        return (
          <>
            <TextInputField
              label="Logo Text"
              value={(cfg.logoText as string) || ""}
              onChange={(v) => update("logoText", v)}
            />
            <Toggle
              label="Sticky"
              value={(cfg.sticky as boolean) || false}
              onChange={(v) => update("sticky", v)}
            />
            <Toggle
              label="Transparent"
              value={(cfg.transparent as boolean) || false}
              onChange={(v) => update("transparent", v)}
            />
          </>
        );

      case "footer":
        return (
          <>
            <TextInputField
              label="Tagline"
              value={(cfg.tagline as string) || ""}
              onChange={(v) => update("tagline", v)}
            />
            <TextInputField
              label="Copyright"
              value={(cfg.copyright as string) || ""}
              onChange={(v) => update("copyright", v)}
              placeholder="© 2025 Company Name"
            />
          </>
        );

      case "hero":
        return (
          <>
            <TextInputField
              label="Heading"
              value={(cfg.heading as string) || ""}
              onChange={(v) => update("heading", v)}
            />
            <TextInputField
              label="Subheading"
              value={(cfg.subheading as string) || ""}
              onChange={(v) => update("subheading", v)}
            />
            <TextareaField
              label="Body Text"
              value={(cfg.text as string) || ""}
              onChange={(v) => update("text", v)}
            />
            <TextInputField
              label="BG Image URL"
              value={(cfg.bgImage as string) || ""}
              onChange={(v) => update("bgImage", v)}
              placeholder="https://..."
            />
            <NumberInput
              label="Overlay Opacity"
              value={(cfg.overlay as number) ?? 30}
              onChange={(v) => update("overlay", v)}
              min={0}
              max={100}
              unit="%"
            />
            <SelectField
              label="Alignment"
              value={(cfg.align as string) || "center"}
              onChange={(v) => update("align", v)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </>
        );

      case "cta":
        return (
          <>
            <TextInputField
              label="Heading"
              value={(cfg.heading as string) || ""}
              onChange={(v) => update("heading", v)}
            />
            <TextareaField
              label="Text"
              value={(cfg.text as string) || ""}
              onChange={(v) => update("text", v)}
            />
            <ColorPicker
              label="BG Color"
              value={(cfg.bgColor as string) || "#1a1a2e"}
              onChange={(v) => update("bgColor", v)}
            />
          </>
        );

      default:
        return (
          <p className="text-xs text-gray-500">No content settings for this element type.</p>
        );
    }
  };

  // ── Element style tab ───────────────────────────────────────────────────────

  const renderElementStyle = (
    el: BuilderElement,
    sectionId: string,
    columnId: string
  ) => {
    const styles = el.styles;
    const updateStyles = (updates: Partial<CSSStyles>) =>
      onUpdateElement(sectionId, columnId, el.id, { styles: { ...styles, ...updates } });

    const alignments: Array<{ value: CSSStyles["textAlign"]; label: string }> = [
      { value: "left", label: "L" },
      { value: "center", label: "C" },
      { value: "right", label: "R" },
      { value: "justify", label: "J" },
    ];

    return (
      <div>
        <AccordionSection title="Typography" defaultOpen>
          <SelectField
            label="Font Weight"
            value={styles.fontWeight || "400"}
            onChange={(v) => updateStyles({ fontWeight: v })}
            options={[
              { value: "300", label: "Light (300)" },
              { value: "400", label: "Regular (400)" },
              { value: "500", label: "Medium (500)" },
              { value: "600", label: "Semibold (600)" },
              { value: "700", label: "Bold (700)" },
              { value: "800", label: "Extrabold (800)" },
              { value: "900", label: "Black (900)" },
            ]}
          />
          <ColorPicker
            label="Text Color"
            value={styles.color || "#000000"}
            onChange={(v) => updateStyles({ color: v })}
          />
          <TextInputField
            label="Font Size"
            value={styles.fontSize || ""}
            onChange={(v) => updateStyles({ fontSize: v })}
            placeholder="e.g. 16px, 1.5rem"
          />
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">Text Align</label>
            <div className="flex gap-1">
              {alignments.map((a) => (
                <button
                  key={a.value}
                  onClick={() => updateStyles({ textAlign: a.value })}
                  className={`flex-1 py-1 text-xs rounded font-mono transition-colors ${
                    styles.textAlign === a.value
                      ? "text-black"
                      : "text-gray-400 bg-white/5 hover:bg-white/10"
                  }`}
                  style={
                    styles.textAlign === a.value
                      ? { backgroundColor: "#C9A227" }
                      : {}
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Spacing" defaultOpen>
          <NumberInput
            label="Padding Top"
            value={parseFloat(styles.paddingTop || "0")}
            onChange={(v) => updateStyles({ paddingTop: `${v}px` })}
            min={0}
            unit="px"
          />
          <NumberInput
            label="Padding Bottom"
            value={parseFloat(styles.paddingBottom || "0")}
            onChange={(v) => updateStyles({ paddingBottom: `${v}px` })}
            min={0}
            unit="px"
          />
          <NumberInput
            label="Margin Top"
            value={parseFloat(styles.marginTop || "0")}
            onChange={(v) => updateStyles({ marginTop: `${v}px` })}
            unit="px"
          />
          <NumberInput
            label="Margin Bottom"
            value={parseFloat(styles.marginBottom || "0")}
            onChange={(v) => updateStyles({ marginBottom: `${v}px` })}
            unit="px"
          />
        </AccordionSection>

        <AccordionSection title="Background">
          <ColorPicker
            label="Background"
            value={styles.backgroundColor || "#transparent"}
            onChange={(v) => updateStyles({ backgroundColor: v })}
          />
        </AccordionSection>

        <AccordionSection title="Border">
          <NumberInput
            label="Border Radius"
            value={parseFloat(styles.borderRadius || "0")}
            onChange={(v) => updateStyles({ borderRadius: `${v}px` })}
            min={0}
            unit="px"
          />
          <TextInputField
            label="Border"
            value={styles.border || ""}
            onChange={(v) => updateStyles({ border: v })}
            placeholder="e.g. 1px solid #ccc"
          />
        </AccordionSection>

        <AccordionSection title="Animation">
          <SelectField
            label="Animation"
            value={el.animation || "none"}
            onChange={(v) =>
              onUpdateElement(sectionId, columnId, el.id, {
                animation: v as BuilderElement["animation"],
              })
            }
            options={[
              { value: "none", label: "None" },
              { value: "fadeIn", label: "Fade In" },
              { value: "slideUp", label: "Slide Up" },
              { value: "slideLeft", label: "Slide Left" },
              { value: "zoom", label: "Zoom" },
              { value: "bounce", label: "Bounce" },
            ]}
          />
          <NumberInput
            label="Delay"
            value={el.animationDelay || 0}
            onChange={(v) =>
              onUpdateElement(sectionId, columnId, el.id, { animationDelay: v })
            }
            min={0}
            unit="ms"
          />
        </AccordionSection>
      </div>
    );
  };

  // ── Element advanced tab ────────────────────────────────────────────────────

  const renderElementAdvanced = (
    el: BuilderElement,
    sectionId: string,
    columnId: string
  ) => {
    const [customCss, setCustomCss] = useState("");
    return (
      <div className="px-4 py-3">
        <Toggle
          label="Hidden"
          value={el.hidden ?? false}
          onChange={(v) => onUpdateElement(sectionId, columnId, el.id, { hidden: v })}
        />
        <Toggle
          label="Locked"
          value={el.locked ?? false}
          onChange={(v) => onUpdateElement(sectionId, columnId, el.id, { locked: v })}
        />
        <TextareaField
          label="Custom CSS (informational)"
          value={customCss}
          onChange={setCustomCss}
          rows={5}
        />
      </div>
    );
  };

  // ── Element panel wrapper ───────────────────────────────────────────────────

  const renderElementSettings = () => {
    const found = findElement();
    if (!found) return <p className="text-xs text-gray-500 px-4 py-4">Element not found.</p>;
    const { element: el, sectionId, columnId } = found;

    const typeLabel = el.type.charAt(0).toUpperCase() + el.type.slice(1);

    return (
      <div className="flex flex-col h-full">
        {/* Element type subtitle */}
        <div className="px-4 pb-2 flex-shrink-0">
          <span className="text-xs text-gray-500 capitalize">{typeLabel} element</span>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-white/10 mx-4 flex-shrink-0 mb-0">
          {(["content", "style", "advanced"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setElementTab(tab)}
              className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${
                elementTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              style={
                elementTab === tab
                  ? { borderBottom: "2px solid #C9A227" }
                  : { borderBottom: "2px solid transparent" }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {elementTab === "content" && (
            <div className="px-4 py-3">
              {renderElementContent(el, sectionId, columnId)}
            </div>
          )}
          {elementTab === "style" && renderElementStyle(el, sectionId, columnId)}
          {elementTab === "advanced" && renderElementAdvanced(el, sectionId, columnId)}
        </div>
      </div>
    );
  };

  // ── Determine what to render ────────────────────────────────────────────────

  const getTitle = () => {
    if (selection.level === null) return { title: "Global Settings", subtitle: "Site-wide styles" };
    if (selection.level === "section") {
      const sec = findSection();
      return { title: "Section", subtitle: sec?.name || "Properties" };
    }
    if (selection.level === "element") {
      const found = findElement();
      return {
        title: "Element",
        subtitle: found ? found.element.label || found.element.type : "Properties",
      };
    }
    return { title: "Properties", subtitle: "" };
  };

  const { title, subtitle } = getTitle();

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#0D1628" }}
    >
      {/* Panel header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {(selection.level === null || selection.level === "page") && renderGlobalSettings()}
        {selection.level === "section" && renderSectionSettings()}
        {(selection.level === "element" || selection.level === "column") &&
          renderElementSettings()}
      </div>

      {/* Bottom deselect button */}
      {selection.level !== null && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
          <button
            className="w-full py-1.5 text-xs rounded border transition-colors hover:bg-amber-400/10"
            style={{ borderColor: "#C9A227", color: "#C9A227" }}
            onClick={() => {
              // Deselect: inform parent via a no-op update to signal clearing selection
              // The parent should handle selection state clearing through its own state management
            }}
          >
            Deselect
          </button>
        </div>
      )}
    </div>
  );
}
