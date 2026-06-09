"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Eye, EyeOff, Download, Undo2, Redo2,
  Monitor, Tablet, Smartphone, ZoomIn, ZoomOut,
  Plus, Sparkles, X, ChevronDown, Loader2,
  CheckCircle, AlertCircle, FileDown, Globe,
  Code2, FileCode2, Braces,
} from 'lucide-react';
import useBuilderState from './useBuilderState';
import { ElementLibrary } from './ElementLibrary';
import { getTemplateById } from './website-templates';
import { PropertiesPanel } from './PropertiesPanel';
import { BuilderCanvas } from './BuilderCanvas';
import type { ElementType, SelectionState } from './builder-types';

// ─── getDefaultConfig ─────────────────────────────────────────────────────────

function getDefaultConfig(type: ElementType): Record<string, unknown> {
  switch (type) {
    case 'heading':
      return { text: 'Your Heading', level: 2 };
    case 'paragraph':
      return { text: 'Write your content here. Click to edit.' };
    case 'richtext':
      return { html: '<p>Rich text content here.</p>' };
    case 'quote':
      return { text: 'Inspirational quote goes here.' };
    case 'list':
      return { items: ['First item', 'Second item', 'Third item'], ordered: false };
    case 'button':
      return { label: 'Click Here', href: '#', variant: 'primary', size: 'md' };
    case 'buttongroup':
      return {
        buttons: [
          { label: 'Primary', href: '#', variant: 'primary', size: 'md' },
          { label: 'Secondary', href: '#', variant: 'outline', size: 'md' },
        ],
      };
    case 'image':
      return { src: '/photos/office-meeting.jpg', alt: 'Image', fit: 'cover' };
    case 'gallery':
      return {
        images: [
          { src: '/photos/restaurant.jpg', alt: 'Photo 1', fit: 'cover' },
          { src: '/photos/school.jpg', alt: 'Photo 2', fit: 'cover' },
          { src: '/photos/hospital.jpg', alt: 'Photo 3', fit: 'cover' },
        ],
        columns: 3,
        gap: 16,
        style: 'grid',
      };
    case 'slider':
      return {
        slides: [
          { src: '/photos/restaurant.jpg', heading: 'Welcome', text: 'Your tagline here' },
          { src: '/photos/school.jpg', heading: 'Our Work', text: 'Quality results' },
        ],
        autoPlay: true,
        interval: 4000,
        arrows: true,
        dots: true,
        effect: 'slide',
      };
    case 'marquee':
      return {
        items: ['Quality Service', 'Fast Delivery', '24/7 Support', 'Best Prices', 'Trusted by Clients'],
        speed: 30,
        direction: 'left',
        separator: ' · ',
      };
    case 'video':
      return { src: '', poster: '', autoPlay: false, muted: true, controls: true, loop: false };
    case 'divider':
      return { style: 'solid' };
    case 'spacer':
      return { height: 48 };
    case 'icon':
      return { name: 'Star', size: 48, color: '#C9A227' };
    case 'iconbox':
      return { icon: 'Star', title: 'Feature Title', description: 'Describe this feature here.', align: 'center' };
    case 'card':
      return { title: 'Card Title', text: 'Card description here.', image: '', buttonLabel: 'Learn More', buttonHref: '#' };
    case 'counter':
      return {
        items: [
          { value: 1000, label: 'Happy Clients', suffix: '+' },
          { value: 500, label: 'Projects Done', suffix: '+' },
          { value: 99, label: 'Satisfaction', suffix: '%' },
        ],
      };
    case 'countdown':
      return { targetDate: '2026-12-31T23:59:59', label: 'Launch Countdown' };
    case 'progress':
      return {
        items: [
          { label: 'Web Design', value: 90 },
          { label: 'Development', value: 85 },
          { label: 'SEO', value: 75 },
        ],
      };
    case 'testimonial':
      return {
        name: 'Satisfied Client',
        role: 'Business Owner',
        company: '',
        text: 'Excellent service! Highly recommended.',
        rating: 5,
      };
    case 'pricing':
      return [
        {
          name: 'Basic',
          price: '₹9,999',
          period: 'one-time',
          features: ['5 Pages', 'Mobile Responsive', 'Contact Form'],
          cta: { label: 'Get Started', href: '#', variant: 'outline', size: 'md' },
          highlighted: false,
        },
        {
          name: 'Premium',
          price: '₹24,999',
          period: 'one-time',
          features: ['Everything in Basic', 'Admin Panel', '3 Months Support'],
          cta: { label: 'Buy Now', href: '#', variant: 'primary', size: 'md' },
          highlighted: true,
          badge: 'Popular',
        },
      ] as unknown as Record<string, unknown>;
    case 'accordion':
      return {
        items: [
          { id: 'q1', question: 'What do you offer?', answer: 'We offer complete digital solutions.' },
          { id: 'q2', question: 'How long does it take?', answer: 'Usually 3-15 business days.' },
        ],
      };
    case 'tabs':
      return {
        items: [
          { id: 't1', label: 'Design', content: 'Beautiful modern design' },
          { id: 't2', label: 'Development', content: 'Clean optimized code' },
          { id: 't3', label: 'Support', content: '24/7 support included' },
        ],
      };
    case 'form':
      return {
        fields: [
          { id: 'name', type: 'text', label: 'Your Name', placeholder: 'Enter your name', required: true },
          { id: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
          { id: 'message', type: 'textarea', label: 'Message', placeholder: 'Your message...', required: true },
        ],
        submitLabel: 'Send Message',
        successMessage: 'Thank you! We will contact you soon.',
      };
    case 'map':
      return { address: 'Mumbai, India', zoom: 14, height: 400 };
    case 'social':
      return {
        links: [
          { platform: 'facebook', url: '#' },
          { platform: 'instagram', url: '#' },
          { platform: 'twitter', url: '#' },
        ],
      };
    case 'navbar':
      return {
        logo: '',
        logoText: 'Your Brand',
        links: [
          { label: 'Home', href: '#' },
          { label: 'About', href: '#' },
          { label: 'Contact', href: '#' },
        ],
        sticky: true,
        transparent: false,
      };
    case 'footer':
      return {
        logo: '',
        tagline: 'Building better businesses',
        columns: [
          { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Contact', href: '#' }] },
          { heading: 'Services', links: [{ label: 'Web Design', href: '#' }, { label: 'Development', href: '#' }] },
        ],
        socials: [{ platform: 'facebook', url: '#' }],
        copyright: '2026 Your Brand. All rights reserved.',
      };
    case 'hero':
      return {
        heading: 'Welcome to Our Website',
        subheading: 'Your Success is Our Mission',
        text: 'We build amazing digital experiences that transform your business.',
        cta: { label: 'Get Started', href: '#', variant: 'primary', size: 'lg' },
        secondaryCta: { label: 'Learn More', href: '#', variant: 'outline', size: 'lg' },
        overlay: 40,
        align: 'center',
        bgImage: '',
      };
    case 'cta':
      return {
        heading: 'Ready to Get Started?',
        text: 'Contact us today for a free consultation.',
        cta: { label: 'Contact Us', href: '#', variant: 'primary', size: 'lg' },
        bgColor: '#0B1437',
      };
    default:
      return {};
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function WebsiteBuilderPage() {
  const {
    project, currentPage, selection,
    setCurrentPageId, setSelection,
    canUndo, canRedo, undo, redo,
    addSection, removeSection, moveSection, duplicateSection, updateSection,
    addElement, removeElement, updateElement, duplicateElement,
    updateGlobalStyles, updateProjectName,
    saveToLocalStorage, loadFromLocalStorage,
    loadTemplate,
  } = useBuilderState();

  const [previewMode, setPreviewMode] = useState(false);
  const [deviceWidth, setDeviceWidth] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(100);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'generator' | 'prompt'>('generator');
  const [aiBusinessDesc, setAiBusinessDesc] = useState('');
  const [aiIndustry, setAiIndustry] = useState('Restaurant');
  const [aiStyle, setAiStyle] = useState('Modern & Clean');
  const [aiPages, setAiPages] = useState(['Home']);
  const [aiColorTheme, setAiColorTheme] = useState('Professional');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html'|'nextjs'|'php'>('html');
  const [deployFormat, setDeployFormat] = useState<'html'|'nextjs'|'php'>('html');
  const [deploying, setDeploying] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [projectNameDraft, setProjectNameDraft] = useState(project.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ─── Effects ───────────────────────────────────────────────────────────────

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Sync project name draft when project.name changes externally
  useEffect(() => {
    setProjectNameDraft(project.name);
  }, [project.name]);

  // Auto-open right panel when element/section selected
  useEffect(() => {
    if (selection.level !== null) setShowRightPanel(true);
  }, [selection.level]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if (ctrl && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        setSelection({ pageId: null, sectionId: null, columnId: null, elementId: null, level: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo]);

  // Auto-save debounce (30s)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToLocalStorage();
    }, 30_000);
    return () => clearTimeout(timer);
  }, [project, saveToLocalStorage]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/website-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ website: project }),
      });
      if (res.ok) showToast('success', 'Website saved successfully!');
      else showToast('error', 'Failed to save. Please try again.');
    } catch {
      showToast('error', 'Network error. Auto-saved locally.');
      saveToLocalStorage();
    } finally {
      setSaving(false);
    }
  }, [project, showToast, saveToLocalStorage]);

  const handleExport = useCallback(async (format: 'html'|'nextjs'|'php' = 'html') => {
    setExporting(true);
    setShowExportModal(false);
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'export', website: project, format }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extMap = { html: '.html', nextjs: '.tsx', php: '.php' };
        a.download = (project.name || 'website').replace(/\s+/g, '-').toLowerCase() + (extMap[format] || '.html');
        a.click();
        URL.revokeObjectURL(url);
        const fmtLabel = { html: 'HTML', nextjs: 'Next.js', php: 'PHP' }[format];
        showToast('success', `${fmtLabel} file exported successfully!`);
      } else {
        showToast('error', 'Export failed. Please try again.');
      }
    } catch {
      showToast('error', 'Export failed.');
    } finally {
      setExporting(false);
    }
  }, [project, showToast]);

  const handleDeploy = useCallback(async (format: 'html'|'nextjs'|'php' = 'html') => {
    setDeploying(true);
    setShowDeployModal(false);
    try {
      const res = await fetch('/api/admin/website-builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ website: project, format }),
      });
      if (res.ok) {
        const data = await res.json();
        const fmtLabel = { html: 'HTML', nextjs: 'Next.js', php: 'PHP' }[format];
        showToast('success', `Deployed as ${fmtLabel}! URL: ${data.url || data.path || 'generated-sites/'}`);
      } else {
        showToast('error', 'Deploy failed.');
      }
    } catch {
      showToast('error', 'Deploy failed.');
    } finally {
      setDeploying(false);
    }
  }, [project, showToast]);

  const handleAIGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'generate',
          prompt: aiPrompt,
          businessName: project.name,
          industry: 'general',
          style: 'modern',
          language: 'en',
        }),
      });
      if (res.ok) {
        showToast('success', 'AI content generated! Add sections from the Elements panel.');
        setShowAI(false);
        setAiPrompt('');
      } else {
        showToast('error', 'AI generation failed. Check your API key.');
      }
    } catch {
      showToast('error', 'AI service unavailable.');
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, project.name, showToast]);

  const onAddElement = useCallback((type: ElementType, config?: Record<string, unknown>) => {
    const cfg = config || getDefaultConfig(type);
    const targetSectionId = selection.sectionId || currentPage?.sections[0]?.id;
    const targetColumnId = selection.columnId || currentPage?.sections[0]?.columns[0]?.id;
    if (targetSectionId && targetColumnId) {
      addElement(targetSectionId, targetColumnId, type, cfg);
    } else if (currentPage) {
      // Add a new section first, then add element
      addSection();
      // Can't get the new section ID synchronously, so just add section
    }
  }, [selection, currentPage, addElement, addSection]);

  const onAddSection = useCallback((preset?: string) => {
    addSection(preset);
  }, [addSection]);

  const toggleAiPage = useCallback((page: string) => {
    setAiPages(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]);
  }, []);

  const handleFullAIGenerate = useCallback(async () => {
    if (!aiBusinessDesc.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/admin/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'generate-full-project',
          businessDesc: aiBusinessDesc,
          industry: aiIndustry,
          style: aiStyle,
          pages: aiPages,
          colorTheme: aiColorTheme,
          projectName: project.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          loadTemplate(data.project);
          setShowAI(false);
          showToast('success', 'AI website generated! Review and customize it.');
        } else {
          showToast('error', 'AI did not return a valid project structure.');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        showToast('error', (err as { error?: string }).error || 'AI generation failed.');
      }
    } catch {
      showToast('error', 'Network error during AI generation.');
    } finally {
      setAiLoading(false);
    }
  }, [aiBusinessDesc, aiIndustry, aiStyle, aiPages, aiColorTheme, project.name, loadTemplate, showToast]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-[#0B1437] overflow-hidden">

      {/* TOP TOOLBAR */}
      <div className="flex items-center justify-between px-4 h-12 bg-[#060E24] border-b border-white/5 flex-shrink-0 z-40">

        {/* Left: Project name + page selector */}
        <div className="flex items-center gap-3">
          {/* Back link */}
          <a href="/admin" className="text-gray-500 hover:text-white transition-colors text-xs">← Admin</a>
          <div className="w-px h-4 bg-white/10" />

          {/* Project name (editable) */}
          {editingName ? (
            <input
              ref={nameInputRef}
              value={projectNameDraft}
              onChange={e => setProjectNameDraft(e.target.value)}
              onBlur={() => { updateProjectName(projectNameDraft); setEditingName(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter') { updateProjectName(projectNameDraft); setEditingName(false); }
                if (e.key === 'Escape') { setProjectNameDraft(project.name); setEditingName(false); }
              }}
              className="bg-white/10 text-white text-sm font-semibold px-2 py-0.5 rounded border border-amber-400 outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => { setProjectNameDraft(project.name); setEditingName(true); }}
              className="text-white text-sm font-semibold hover:text-amber-400 transition-colors"
            >
              {project.name}
            </button>
          )}

          {/* Page selector */}
          <div className="relative">
            <select
              value={currentPage?.id || ''}
              onChange={e => setCurrentPageId(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 text-xs rounded px-2 py-1 pr-6 outline-none focus:border-amber-400 appearance-none cursor-pointer"
            >
              {project.pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Center: Device + Zoom */}
        <div className="flex items-center gap-2">
          {/* Device buttons */}
          <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
            {[
              { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
              { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
              { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setDeviceWidth(id)}
                title={label}
                className={`p-1.5 rounded-md transition-colors ${deviceWidth === id ? 'bg-amber-500/20 text-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(50, z - 25))} className="text-gray-400 hover:text-white"><ZoomOut size={12} /></button>
            <span className="text-xs text-gray-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="text-gray-400 hover:text-white"><ZoomIn size={12} /></button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Redo2 size={14} />
          </button>

          <div className="w-px h-4 bg-white/10" />

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewMode ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}
          >
            {previewMode ? <EyeOff size={13} /> : <Eye size={13} />}
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            disabled={exporting}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
            Export
          </button>

          <button
            onClick={() => setShowDeployModal(true)}
            disabled={deploying}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          >
            {deploying ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
            Deploy
          </button>

          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
          >
            <Sparkles size={13} />
            AI
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* LEFT PANEL - Element Library */}
        {!previewMode && (
          <div className="flex flex-shrink-0 relative h-full">
            <motion.div
              initial={false}
              animate={{ width: showLeftPanel ? 280 : 0, opacity: showLeftPanel ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden border-r border-white/5 bg-[#0B1437] h-full"
              style={{ minWidth: 0 }}
            >
              <div className="w-[280px] h-full overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
                <ElementLibrary
                  onAddElement={onAddElement}
                  onAddSection={onAddSection}
                  onLoadTemplate={(templateId) => {
                    const template = getTemplateById(templateId);
                    if (template) {
                      loadTemplate(template.buildProject());
                      showToast('success', `Template "${template.name}" loaded!`);
                    }
                  }}
                />
              </div>
            </motion.div>
            {/* Left toggle button */}
            <button
              onClick={() => setShowLeftPanel(v => !v)}
              title={showLeftPanel ? 'Hide Elements Panel' : 'Show Elements Panel'}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#0B1437] border border-white/10 rounded-r-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-colors shadow-lg"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                {showLeftPanel
                  ? <path d="M7 1L3 5l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  : <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                }
              </svg>
            </button>
          </div>
        )}

        {/* CENTER - Canvas */}
        <div
          className="flex-1 overflow-auto bg-[#1A2040] relative"
          onClick={() => setSelection({ pageId: currentPage?.id || null, sectionId: null, columnId: null, elementId: null, level: null })}
        >
          {/* Canvas frame for tablet/mobile */}
          <div
            style={{
              width: deviceWidth === 'desktop' ? '100%' : deviceWidth === 'tablet' ? '768px' : '390px',
              margin: deviceWidth === 'desktop' ? '0' : '2rem auto',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              border: deviceWidth !== 'desktop' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              borderRadius: deviceWidth === 'mobile' ? '24px' : deviceWidth === 'tablet' ? '12px' : '0',
              overflow: 'hidden',
              minHeight: '100vh',
            }}
          >
            {currentPage && (
              <BuilderCanvas
                page={currentPage}
                selection={selection}
                globalStyles={project.globalStyles}
                previewMode={previewMode}
                deviceWidth={deviceWidth}
                onSelect={setSelection}
                onDrop={(sectionId, columnId, elementType, index) => {
                  addElement(sectionId, columnId, elementType as ElementType, getDefaultConfig(elementType as ElementType));
                }}
                onMoveSection={moveSection}
                onDuplicateSection={duplicateSection}
                onDeleteSection={removeSection}
                onDeleteElement={removeElement}
                onDuplicateElement={duplicateElement}
                onUpdateElement={updateElement}
              />
            )}
          </div>
        </div>

        {/* RIGHT PANEL - Properties (slide toggle) */}
        {!previewMode && (
          <div className="flex flex-shrink-0 relative h-full">
            {/* Right toggle button */}
            <button
              onClick={() => setShowRightPanel(v => !v)}
              title={showRightPanel ? 'Hide Properties Panel' : 'Show Properties Panel'}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-[#0B1437] border border-white/10 rounded-l-lg flex items-center justify-center text-gray-400 hover:text-amber-400 hover:border-amber-400/30 transition-colors shadow-lg"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                {showRightPanel
                  ? <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  : <path d="M7 1L3 5l4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                }
              </svg>
            </button>

            <motion.div
              initial={false}
              animate={{ width: showRightPanel ? 320 : 0, opacity: showRightPanel ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden border-l border-white/5 bg-[#0B1437] h-full"
              style={{ minWidth: 0 }}
            >
              <div className="w-[320px] h-full overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}>
                <PropertiesPanel
                  selection={selection}
                  project={project}
                  onUpdateElement={updateElement}
                  onUpdateSection={updateSection}
                  onUpdateGlobalStyles={updateGlobalStyles}
                />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* EXPORT FORMAT MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0D1628] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">Export Website</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Choose the language/framework to export in</p>
                  </div>
                  <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      id: 'html' as const,
                      icon: '🌐',
                      label: 'HTML',
                      desc: 'Single .html file',
                      detail: 'Works everywhere. Open in any browser. No setup needed.',
                      color: '#F97316',
                    },
                    {
                      id: 'nextjs' as const,
                      icon: '⚛️',
                      label: 'Next.js',
                      desc: 'React component (.tsx)',
                      detail: 'Ready to use in Next.js 14+ with App Router.',
                      color: '#3B82F6',
                    },
                    {
                      id: 'php' as const,
                      icon: '🐘',
                      label: 'PHP',
                      desc: 'PHP template (.php)',
                      detail: 'Works on any PHP server (cPanel, shared hosting).',
                      color: '#8B5CF6',
                    },
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        exportFormat === fmt.id
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {exportFormat === fmt.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <CheckCircle size={10} className="text-[#0B1437]" />
                        </div>
                      )}
                      <div className="text-2xl mb-2">{fmt.icon}</div>
                      <div className="text-white font-bold text-sm mb-0.5">{fmt.label}</div>
                      <div className="text-gray-400 text-[11px]">{fmt.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-4 text-xs text-gray-400">
                  {exportFormat === 'html' && '🌐 Generates a complete standalone HTML file with all styles and scripts embedded. Perfect for static hosting or email templates.'}
                  {exportFormat === 'nextjs' && '⚛️ Generates a Next.js page.tsx component with Tailwind CSS classes. Drop it into your existing Next.js project.'}
                  {exportFormat === 'php' && '🐘 Generates an index.php file with PHP variables for dynamic content. Works on cPanel, Hostinger, GoDaddy shared hosting.'}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowExportModal(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleExport(exportFormat)}
                    disabled={exporting}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 text-[#0B1437] font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                  >
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export as {exportFormat === 'html' ? 'HTML' : exportFormat === 'nextjs' ? 'Next.js' : 'PHP'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DEPLOY FORMAT MODAL */}
      <AnimatePresence>
        {showDeployModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeployModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0D1628] border border-white/10 rounded-2xl p-6 w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-white font-bold text-lg">Deploy Website</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Choose the language/format to deploy to server</p>
                  </div>
                  <button onClick={() => setShowDeployModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'html' as const, icon: '🌐', label: 'HTML', desc: 'Static HTML page', detail: 'Deployed to /generated-sites/ instantly accessible.' },
                    { id: 'nextjs' as const, icon: '⚛️', label: 'Next.js', desc: 'Next.js route', detail: 'Creates a Next.js page route on this server.' },
                    { id: 'php' as const, icon: '🐘', label: 'PHP', desc: 'PHP file', detail: 'Saves PHP file to generated-sites directory.' },
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => setDeployFormat(fmt.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        deployFormat === fmt.id
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {deployFormat === fmt.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <CheckCircle size={10} className="text-[#0B1437]" />
                        </div>
                      )}
                      <div className="text-2xl mb-2">{fmt.icon}</div>
                      <div className="text-white font-bold text-sm mb-0.5">{fmt.label}</div>
                      <div className="text-gray-400 text-[11px]">{fmt.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-4 text-xs text-gray-400">
                  {deployFormat === 'html' && '🌐 Deploys as a static HTML page at kvlbusinesssolutions.com/generated-sites/your-website.html — live instantly.'}
                  {deployFormat === 'nextjs' && '⚛️ Creates a new Next.js page route. Access at /generated-sites/your-website after server restart.'}
                  {deployFormat === 'php' && '🐘 Saves as a PHP file. Accessible via the web server if PHP is configured.'}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowDeployModal(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeploy(deployFormat)}
                    disabled={deploying}
                    className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                  >
                    {deploying ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                    Deploy as {deployFormat === 'html' ? 'HTML' : deployFormat === 'nextjs' ? 'Next.js' : 'PHP'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI DRAWER */}
      <AnimatePresence>
        {showAI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowAI(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-[#060E24] border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <h3 className="text-white font-semibold">AI Assistant</h3>
                </div>
                <button onClick={() => setShowAI(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              {/* Mode tabs */}
              <div className="flex border-b border-white/5">
                {(['generator', 'prompt'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setAiMode(mode)}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${aiMode === mode ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {mode === 'generator' ? 'AI Generator' : 'Quick Prompt'}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {aiMode === 'generator' ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🤖</div>
                      <h3 className="text-white font-bold text-lg">AI Website Generator</h3>
                      <p className="text-gray-400 text-xs mt-1">Tell us about your business — AI will build a complete website in seconds</p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Describe your business</label>
                      <textarea
                        value={aiBusinessDesc}
                        onChange={e => setAiBusinessDesc(e.target.value)}
                        placeholder="e.g. We are a restaurant in Mumbai serving authentic Mughlai cuisine since 1985. We offer dine-in, takeaway and catering services."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:border-amber-400 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Industry</label>
                      <select
                        value={aiIndustry}
                        onChange={e => setAiIndustry(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400 outline-none"
                      >
                        {['Restaurant', 'Agency/Studio', 'Healthcare/Clinic', 'Education', 'Real Estate', 'E-Commerce', 'Corporate/Finance', 'Technology/SaaS', 'Events/Wedding', 'Personal/Portfolio', 'Other'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Website Style</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Modern & Clean', 'Bold & Colorful', 'Minimal', 'Classic & Elegant'].map(style => (
                          <button key={style} onClick={() => setAiStyle(style)}
                            className={`p-2 rounded-lg border text-xs font-medium transition-colors ${aiStyle === style ? 'border-amber-400 bg-amber-500/10 text-amber-400' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Pages to Generate</label>
                      <div className="flex flex-wrap gap-2">
                        {['Home', 'About', 'Services', 'Portfolio', 'Contact', 'Blog'].map(page => (
                          <button key={page} onClick={() => toggleAiPage(page)}
                            className={`px-2.5 py-1 rounded-full border text-xs transition-colors ${aiPages.includes(page) ? 'border-amber-400 bg-amber-500/10 text-amber-400' : 'border-white/10 text-gray-400'}`}>
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">Color Theme</label>
                      <div className="flex gap-2">
                        {[
                          { name: 'Professional', colors: ['#0B1437', '#C9A227'] },
                          { name: 'Fresh', colors: ['#064E3B', '#10B981'] },
                          { name: 'Creative', colors: ['#1E1B4B', '#6C63FF'] },
                          { name: 'Warm', colors: ['#431407', '#EA580C'] },
                          { name: 'Custom', colors: ['#374151', '#9CA3AF'] },
                        ].map(theme => (
                          <button key={theme.name} onClick={() => setAiColorTheme(theme.name)}
                            title={theme.name}
                            className={`flex-1 h-8 rounded-lg border-2 overflow-hidden transition-all ${aiColorTheme === theme.name ? 'border-amber-400 scale-105' : 'border-transparent hover:border-white/20'}`}>
                            <div className="h-full flex">
                              <div style={{ background: theme.colors[0], flex: 1 }} />
                              <div style={{ background: theme.colors[1], flex: 1 }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => handleFullAIGenerate()}
                      disabled={aiLoading || !aiBusinessDesc.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-[#0B1437] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                      {aiLoading ? <><Loader2 size={16} className="animate-spin" /> Generating Website...</> : <><Sparkles size={16} /> Generate Full Website</>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400 text-sm">Describe what you want to build and AI will help generate content for your website.</p>

                    {/* Quick prompts */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Quick Prompts</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Generate a hero section',
                          'Add contact form',
                          'Pricing plans for agency',
                          'Restaurant menu section',
                          'Team members section',
                          'Testimonials from clients',
                        ].map(prompt => (
                          <button
                            key={prompt}
                            onClick={() => setAiPrompt(prompt)}
                            className="text-xs px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prompt input */}
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Your prompt</p>
                      <textarea
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="Describe what you need... e.g. 'Create a hero section for a restaurant with booking button'"
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm placeholder-gray-600 focus:border-amber-400 outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleAIGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-500 text-[#0B1437] font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {aiLoading ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-green-900/90 text-green-200 border border-green-700/50'
                : 'bg-red-900/90 text-red-200 border border-red-700/50'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
