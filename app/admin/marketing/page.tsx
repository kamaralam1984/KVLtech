"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, MessageCircle, Phone, Send, Users, TrendingUp,
  CheckCircle2, Clock, Plus, Loader2, RefreshCw, X,
  Save, Trash2, AlertCircle, Eye, BarChart2, Play,
  Search, MapPin, Building2, Sparkles, Copy,
} from "lucide-react";

// Inline YouTube icon (not in this lucide-react version)
function YoutubeIcon({ size = 16, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const TYPE_CONFIG: Record<string, { icon: typeof Mail; color: string; label: string }> = {
  EMAIL:    { icon: Mail,            color: "#0891B2", label: "Email" },
  WHATSAPP: { icon: MessageCircle,   color: "#25D366", label: "WhatsApp" },
  SMS:      { icon: Phone,           color: "#7C3AED", label: "SMS" },
};
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  DRAFT:     { color: "#9CA3AF", bg: "#9CA3AF15", label: "Draft" },
  SCHEDULED: { color: "#F59E0B", bg: "#F59E0B15", label: "Scheduled" },
  ACTIVE:    { color: "#16A34A", bg: "#16A34A15", label: "Active" },
  COMPLETED: { color: "#0891B2", bg: "#0891B215", label: "Completed" },
  FAILED:    { color: "#EF4444", bg: "#EF444415", label: "Failed" },
};

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

const TEMPLATES = [
  { name: "Welcome New Lead",      type: "Email",    msg: "Namaskar! KVL TECH mein aapka swagat hai. Aapki requirement ke baare mein baat karte hain — free consultation ke liye reply karein." },
  { name: "Product Demo Offer",    type: "WhatsApp", msg: "Hi! 👋 Kya aap hamare product ka FREE demo dekhna chahenge? 30 minutes mein sab clear ho jaayega. Reply 'DEMO' to book." },
  { name: "Follow-up (3 days)",    type: "Email",    msg: "Namaskar, pichli baar aapne hamse contact kiya tha. Kya aapko abhi bhi help chahiye? Hum yahan hain." },
  { name: "Discount Alert",        type: "SMS",      msg: "KVL TECH: Sirf aaj ke liye 15% OFF! Website/Software book karein. Call: +91 98765 43210. Offer midnight tak." },
];

const INDIAN_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Agra',
];

const BUSINESS_TYPES = [
  'Restaurant', 'Hospital', 'School', 'Hotel', 'Real Estate',
  'Grocery Shop', 'Pharmacy', 'Gym', 'Salon', 'Clinic',
  'Bakery', 'Retail Shop', 'Coaching Center', 'Travel Agency',
];

interface Lead {
  businessName: string;
  ownerName?: string;
  city: string;
  businessType: string;
  address?: string;
  email: string;
  phone: string;
  rating: string | number;
  status: string;
  emailSent?: boolean;
}

interface YoutubeLead {
  businessName: string;
  city: string;
  businessType: string;
  channelId: string;
  description: string;
  thumbnail: string;
  youtubeUrl: string;
  email: string;
  phone: string;
  rating: string;
  status: string;
}

interface AiEmailState {
  subject: string;
  body: string;
  loading: boolean;
  leadName: string;
}

function LeadFinderTab() {
  const [subTab, setSubTab] = useState<'serpapi' | 'youtube'>('serpapi');

  // -- SerpAPI leads state --
  const [city, setCity] = useState('Delhi');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [count, setCount] = useState(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingIdx, setSendingIdx] = useState<number | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [stats, setStats] = useState({ found: 0, sent: 0 });
  const [error, setError] = useState('');

  // -- YouTube leads state --
  const [ytCity, setYtCity] = useState('Delhi');
  const [ytType, setYtType] = useState('Restaurant');
  const [ytCount, setYtCount] = useState(10);
  const [ytLeads, setYtLeads] = useState<YoutubeLead[]>([]);
  const [ytSearching, setYtSearching] = useState(false);
  const [ytError, setYtError] = useState('');

  // -- AI Email state --
  const [aiEmail, setAiEmail] = useState<AiEmailState | null>(null);
  const [copied, setCopied] = useState(false);

  const generateAIEmail = async (lead: Lead | YoutubeLead) => {
    setAiEmail({ subject: '', body: '', loading: true, leadName: lead.businessName });
    try {
      const res = await fetch('/api/marketing/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      const data = await res.json();
      setAiEmail({ subject: data.subject, body: data.body, loading: false, leadName: lead.businessName });
    } catch {
      setAiEmail(prev => prev ? { ...prev, loading: false, subject: 'Error', body: 'Failed to generate email. Please try again.' } : null);
    }
  };

  const copyEmail = () => {
    if (!aiEmail) return;
    const text = `Subject: ${aiEmail.subject}\n\n${aiEmail.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const findLeads = async () => {
    setSearching(true);
    setError('');
    setLeads([]);
    try {
      const res = await fetch('/api/admin/lead-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ city, businessType, count }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Search failed'); return; }
      setLeads(data.leads || []);
      setStats(s => ({ ...s, found: s.found + (data.leads?.length || 0) }));
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const findYouTubeLeads = async () => {
    setYtSearching(true);
    setYtError('');
    setYtLeads([]);
    try {
      const res = await fetch('/api/admin/youtube-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: ytCity, businessType: ytType, count: ytCount }),
      });
      const data = await res.json();
      if (data.error) { setYtError(data.error); return; }
      setYtLeads(data.leads || []);
      setStats(s => ({ ...s, found: s.found + (data.leads?.length || 0) }));
    } catch {
      setYtError('Network error. Please try again.');
    } finally {
      setYtSearching(false);
    }
  };

  const sendEmail = async (lead: Lead, idx: number) => {
    setSendingIdx(idx);
    try {
      await fetch('/api/marketing/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: lead.email,
          name: lead.ownerName || lead.businessName,
          service: lead.businessType,
        }),
      });
      setLeads(prev => prev.map((l, i) => i === idx ? { ...l, emailSent: true } : l));
      setStats(s => ({ ...s, sent: s.sent + 1 }));
    } finally {
      setSendingIdx(null);
    }
  };

  const sendToAll = async () => {
    setSendingAll(true);
    const unsent = leads.filter(l => !l.emailSent);
    for (let i = 0; i < unsent.length; i++) {
      const idx = leads.indexOf(unsent[i]);
      await sendEmail(unsent[i], idx);
    }
    setSendingAll(false);
  };

  const conversionRate = stats.found > 0 ? ((stats.sent / stats.found) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Leads Found', value: stats.found, icon: Search, color: '#C9A227' },
          { label: 'Emails Sent', value: stats.sent, icon: Mail, color: '#0891B2' },
          { label: 'Outreach Rate', value: `${conversionRate}%`, icon: TrendingUp, color: '#16A34A' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="font-display font-bold text-xl text-[var(--color-text)]">{value}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sub-tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)] w-fit">
        {([
          { key: 'serpapi', label: 'Google Leads' },
          { key: 'youtube', label: 'YouTube Leads' },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              subTab === key
                ? 'bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {key === 'youtube'
              ? <YoutubeIcon size={14} color={subTab === key ? '#FF0000' : 'currentColor'} />
              : <Search size={14} style={subTab === key ? { color: 'var(--color-gold)' } : {}} />
            }
            {label}
          </button>
        ))}
      </div>

      {/* Google / SerpAPI Leads */}
      {subTab === 'serpapi' && (
        <>
          {/* Search form */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Search size={16} className="text-[var(--color-gold)]" /> Lead Finder
            </h3>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className={LABEL}>City</label>
                <select value={city} onChange={e => setCity(e.target.value)} className={INPUT}>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Business Type</label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} className={INPUT}>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Count</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))} className={INPUT}>
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} leads</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={findLeads}
                  disabled={searching}
                  className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                  {searching ? 'Searching...' : 'Find Leads'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm mb-4">
                <AlertCircle size={14} /> {error}
              </div>
            )}
          </div>

          {/* Results table */}
          {leads.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <Building2 size={16} className="text-[var(--color-gold)]" />
                  {leads.length} Leads Found — {city}
                </h3>
                <button
                  onClick={sendToAll}
                  disabled={sendingAll || leads.every(l => l.emailSent)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] border border-[var(--color-gold)]/30 px-3 py-1.5 rounded-xl hover:bg-[var(--color-gold)]/5 transition-all disabled:opacity-50"
                >
                  {sendingAll ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {sendingAll ? 'Sending...' : 'Send to All'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      {['Business', 'City', 'Email', 'Phone', 'Rating', 'Action'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[var(--color-text-muted)] pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {leads.map((lead, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-bg-secondary)] transition-colors">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-[var(--color-text)] truncate max-w-[160px]">{lead.businessName}</p>
                          {lead.ownerName && <p className="text-xs text-[var(--color-text-muted)]">{lead.ownerName}</p>}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                            <MapPin size={11} /> {lead.city}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[180px] block">{lead.email}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-[var(--color-text-secondary)]">{lead.phone || '—'}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-semibold text-amber-500">★ {lead.rating}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            {lead.emailSent ? (
                              <span className="flex items-center gap-1 text-xs text-green-500 font-medium">
                                <CheckCircle2 size={12} /> Sent
                              </span>
                            ) : (
                              <button
                                onClick={() => sendEmail(lead, idx)}
                                disabled={sendingIdx === idx}
                                className="flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)] border border-[var(--color-gold)]/30 px-2.5 py-1 rounded-lg hover:bg-[var(--color-gold)]/5 transition-all disabled:opacity-50"
                              >
                                {sendingIdx === idx ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
                                {sendingIdx === idx ? 'Sending' : 'Cold Email'}
                              </button>
                            )}
                            <button
                              onClick={() => generateAIEmail(lead)}
                              className="flex items-center gap-1 text-xs font-semibold text-purple-500 border border-purple-400/30 px-2.5 py-1 rounded-lg hover:bg-purple-500/5 transition-all"
                              title="Generate AI-personalised email"
                            >
                              <Sparkles size={11} /> AI Email
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* YouTube Leads */}
      {subTab === 'youtube' && (
        <>
          <div className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
              <YoutubeIcon size={16} color="#FF0000" /> YouTube Business Finder
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Businesses with YouTube channels are more tech-savvy — higher conversion chance.
            </p>
            <div className="grid sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className={LABEL}>City</label>
                <select value={ytCity} onChange={e => setYtCity(e.target.value)} className={INPUT}>
                  {INDIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Business Type</label>
                <select value={ytType} onChange={e => setYtType(e.target.value)} className={INPUT}>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Count</label>
                <select value={ytCount} onChange={e => setYtCount(Number(e.target.value))} className={INPUT}>
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} channels</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={findYouTubeLeads}
                  disabled={ytSearching}
                  className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {ytSearching ? <Loader2 size={15} className="animate-spin" /> : <YoutubeIcon size={15} />}
                  {ytSearching ? 'Searching...' : 'Find Channels'}
                </button>
              </div>
            </div>

            {ytError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={14} /> {ytError}
              </div>
            )}
          </div>

          {ytLeads.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4 flex items-center gap-2">
                <YoutubeIcon size={16} color="#FF0000" />
                {ytLeads.length} Channels Found — {ytCity}
              </h3>
              <div className="space-y-3">
                {ytLeads.map((lead, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all">
                    {lead.thumbnail ? (
                      <img src={lead.thumbnail} alt={lead.businessName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <YoutubeIcon size={20} color="#FF0000" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--color-text)] truncate">{lead.businessName}</p>
                      {lead.description && (
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{lead.description}</p>
                      )}
                      <a
                        href={lead.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-red-500 hover:underline mt-0.5 block"
                      >
                        {lead.youtubeUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500">YT</span>
                      <button
                        onClick={() => generateAIEmail(lead)}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-500 border border-purple-400/30 px-2.5 py-1 rounded-lg hover:bg-purple-500/5 transition-all"
                        title="Generate AI email for this channel"
                      >
                        <Sparkles size={11} /> AI Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Email Slide-in Panel */}
      <AnimatePresence>
        {aiEmail && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setAiEmail(null)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-bg)] shadow-[var(--shadow-luxury)] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-500" />
                  <div>
                    <h3 className="font-display font-bold text-base text-[var(--color-text)]">AI Email</h3>
                    <p className="text-xs text-[var(--color-text-muted)] truncate max-w-[220px]">{aiEmail.leadName}</p>
                  </div>
                </div>
                <button onClick={() => setAiEmail(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiEmail.loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--color-text-muted)]">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/10">
                      <Sparkles size={28} className="text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">AI is writing email...</p>
                    <p className="text-xs text-center text-[var(--color-text-muted)]">Personalising for {aiEmail.leadName}</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className={LABEL}>Subject Line</label>
                      <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        <p className="text-sm font-medium text-[var(--color-text)]">{aiEmail.subject}</p>
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Email Body</label>
                      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] min-h-[240px]">
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{aiEmail.body}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer actions */}
              {!aiEmail.loading && (
                <div className="px-6 py-4 border-t border-[var(--color-border)] flex gap-3">
                  <button
                    onClick={copyEmail}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold border border-[var(--color-border)] rounded-xl py-2.5 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
                  >
                    <Copy size={14} />
                    {copied ? 'Copied!' : 'Copy Email'}
                  </button>
                  <button
                    onClick={() => setAiEmail(null)}
                    className="flex-1 btn-gold flex items-center justify-center gap-2 text-sm"
                  >
                    <Send size={14} /> Done
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'leads'>('campaigns');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Compose
  const [composeType, setComposeType] = useState("EMAIL");
  const [composeForm, setComposeForm] = useState({ name: "", subject: "", message: "", recipients: "ALL_LEADS" });
  const [composeSaving, setComposeSaving] = useState(false);
  const [composeMsg, setComposeMsg] = useState("");

  // Campaign modal
  const [newCampaignModal, setNewCampaignModal] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", type: "EMAIL", subject: "", message: "", recipients: "ALL_LEADS" });
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState("");

  // Sending
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing", { credentials: "include" });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBroadcast = async () => {
    if (!composeForm.message.trim()) { setComposeMsg("Message likhein pehle"); return; }
    setComposeSaving(true); setComposeMsg("");
    try {
      // Create + immediately send
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: composeForm.name || `Quick Broadcast — ${new Date().toLocaleDateString("en-IN")}`,
          type: composeType,
          subject: composeForm.subject,
          message: composeForm.message,
          recipients: composeForm.recipients,
        }),
      });
      const created = await res.json();
      if (created.campaign?.id) {
        await fetch("/api/admin/marketing", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ id: created.campaign.id, action: "send" }),
        });
      }
      setComposeMsg(`✅ Broadcast sent to ${data?.audienceSizes?.[composeForm.recipients] || "recipients"}!`);
      setComposeForm(f => ({ ...f, message: "", subject: "", name: "" }));
      await fetchData();
    } catch { setComposeMsg("❌ Failed to send."); }
    setComposeSaving(false);
  };

  const handleNewCampaign = async () => {
    setNewError("");
    if (!newForm.name || !newForm.message) { setNewError("Name aur message required hain."); return; }
    setNewSaving(true);
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newForm),
      });
      if (!res.ok) { const d = await res.json(); setNewError(d.error || "Failed"); }
      else { setNewCampaignModal(false); await fetchData(); }
    } catch { setNewError("Network error."); }
    setNewSaving(false);
  };

  const handleSend = async (id: string) => {
    setSendingId(id);
    await fetch("/api/admin/marketing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, action: "send" }),
    });
    await fetchData();
    setSendingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/admin/marketing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    await fetchData();
    setDeletingId(null);
  };

  const audienceLabel: Record<string, string> = {
    ALL_LEADS: `All Leads (${data?.audienceSizes?.allLeads || 0})`,
    NEW_LEADS: `New Leads (${data?.audienceSizes?.newLeads || 0})`,
    CONTACTED: `Contacted (${data?.audienceSizes?.contacted || 0})`,
    QUALIFIED: `Qualified (${data?.audienceSizes?.qualified || 0})`,
    ALL_CLIENTS: `All Clients (${data?.audienceSizes?.allClients || 0})`,
  };

  const stats = data?.stats || {};
  const campaigns = data?.campaigns || [];
  const totalSent = (stats.emailSent || 0) + (stats.waSent || 0) + (stats.smsSent || 0);

  return (
    <>
      <AdminTopbar title="Marketing" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)] w-fit">
          {([
            { key: 'campaigns', label: 'Campaigns', icon: BarChart2 },
            { key: 'leads', label: 'Lead Finder', icon: Search },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Icon size={14} style={activeTab === key ? { color: 'var(--color-gold)' } : {}} />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'leads' && <LeadFinderTab />}
        {activeTab === 'campaigns' && <>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Emails Sent", value: loading ? "…" : stats.emailSent?.toLocaleString("en-IN") || "0", icon: Mail, color: "#0891B2" },
            { label: "WhatsApp Sent", value: loading ? "…" : stats.waSent?.toLocaleString("en-IN") || "0", icon: MessageCircle, color: "#25D366" },
            { label: "SMS Sent", value: loading ? "…" : stats.smsSent?.toLocaleString("en-IN") || "0", icon: Phone, color: "#7C3AED" },
            { label: "Total Delivered", value: loading ? "…" : totalSent.toLocaleString("en-IN"), icon: TrendingUp, color: "#C9A227" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                {loading && <Loader2 size={14} className="animate-spin text-[var(--color-text-muted)]" />}
              </div>
              <p className="font-display font-bold text-2xl text-[var(--color-text)]">{value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Quick Broadcast ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] mb-4">Quick Broadcast</h3>

            {/* Channel */}
            <div className="flex gap-1.5 mb-4 p-1 rounded-xl bg-[var(--color-bg-secondary)]">
              {["EMAIL", "WHATSAPP", "SMS"].map(t => {
                const cfg = TYPE_CONFIG[t];
                return (
                  <button key={t} onClick={() => setComposeType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${composeType === t ? "bg-[var(--color-bg)] shadow-sm text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}>
                    <cfg.icon size={12} style={{ color: composeType === t ? cfg.color : undefined }} /> {cfg.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className={LABEL}>Recipients</label>
                <select value={composeForm.recipients} onChange={e => setComposeForm(f => ({ ...f, recipients: e.target.value }))} className={INPUT}>
                  {Object.entries(audienceLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {composeType === "EMAIL" && (
                <div>
                  <label className={LABEL}>Subject</label>
                  <input value={composeForm.subject} onChange={e => setComposeForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Email ka subject..." className={INPUT} />
                </div>
              )}
              <div>
                <label className={LABEL}>Message</label>
                <textarea rows={4} value={composeForm.message} onChange={e => setComposeForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Apna message likhein..." className={INPUT + " resize-none"} />
              </div>

              {composeMsg && (
                <p className={`text-xs ${composeMsg.startsWith("✅") ? "text-green-500" : "text-red-500"}`}>{composeMsg}</p>
              )}

              <button onClick={handleBroadcast} disabled={composeSaving || !composeForm.message.trim()}
                className="btn-gold w-full flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                {composeSaving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {composeSaving ? "Sending..." : "Send Broadcast"}
              </button>
            </div>

            {/* Templates */}
            <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3">Quick Templates</p>
              <div className="space-y-1.5">
                {TEMPLATES.map(t => (
                  <button key={t.name} onClick={() => { setComposeForm(f => ({ ...f, message: t.msg })); setComposeType(t.type === "WhatsApp" ? "WHATSAPP" : t.type.toUpperCase()); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-all text-left group">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-text)]">{t.name}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] group-hover:bg-[var(--color-gold)]/10 group-hover:text-[var(--color-gold)] transition-colors">{t.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Campaigns ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Campaigns</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">{campaigns.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={fetchData} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all text-[var(--color-text-muted)]">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
                <button onClick={() => { setNewForm({ name: "", type: "EMAIL", subject: "", message: "", recipients: "ALL_LEADS" }); setNewError(""); setNewCampaignModal(true); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-gold)] border border-[var(--color-gold)]/30 px-3 py-1.5 rounded-xl hover:bg-[var(--color-gold)]/5 transition-all">
                  <Plus size={13} /> New Campaign
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--color-gold)]" /></div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                <BarChart2 size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Koi campaigns nahi hain abhi</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {campaigns.map((c: any) => {
                  const typeCfg = TYPE_CONFIG[c.type] || TYPE_CONFIG.EMAIL;
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.DRAFT;
                  const openRate = c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(1) : null;
                  const clickRate = c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(1) : null;

                  return (
                    <div key={c.id} className="p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${typeCfg.color}15` }}>
                            <typeCfg.icon size={16} style={{ color: typeCfg.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{c.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                                {c.status === "ACTIVE" ? <span className="flex items-center gap-1"><CheckCircle2 size={9} /> {statusCfg.label}</span>
                                  : c.status === "COMPLETED" ? <span className="flex items-center gap-1"><CheckCircle2 size={9} /> {statusCfg.label}</span>
                                    : <span className="flex items-center gap-1"><Clock size={9} /> {statusCfg.label}</span>}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-muted)]">
                                {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                              <span className="text-[10px] text-[var(--color-text-muted)]">→ {audienceLabel[c.recipients]?.split("(")[0].trim() || c.recipients}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button onClick={() => setPreview(c)} className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-[var(--color-text-muted)]">
                            <Eye size={12} />
                          </button>
                          {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                            <button onClick={() => handleSend(c.id)} disabled={sendingId === c.id}
                              className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:border-green-500 hover:text-green-500 transition-all text-[var(--color-text-muted)] disabled:opacity-50">
                              {sendingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            </button>
                          )}
                          <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                            className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all text-[var(--color-text-muted)] disabled:opacity-50">
                            {deletingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>

                      {c.sentCount > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {[
                            { label: "Sent", value: c.sentCount.toLocaleString("en-IN") },
                            { label: "Open Rate", value: `${openRate}%` },
                            { label: "Click Rate", value: `${clickRate}%` },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center p-2 rounded-lg bg-[var(--color-bg-secondary)]">
                              <p className="font-bold text-sm text-[var(--color-text)]">{value}</p>
                              <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
        </>}
      </div>

      {/* ── New Campaign Modal ── */}
      <AnimatePresence>
        {newCampaignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setNewCampaignModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <h3 className="font-display font-bold text-lg text-[var(--color-text)]">New Campaign</h3>
                <button onClick={() => setNewCampaignModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {newError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle size={14} /> {newError}
                  </div>
                )}
                <div>
                  <label className={LABEL}>Campaign Name *</label>
                  <input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Summer Offer 2025" className={INPUT} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Channel *</label>
                    <select value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value }))} className={INPUT}>
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Recipients</label>
                    <select value={newForm.recipients} onChange={e => setNewForm(f => ({ ...f, recipients: e.target.value }))} className={INPUT}>
                      {Object.entries(audienceLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                {newForm.type === "EMAIL" && (
                  <div>
                    <label className={LABEL}>Subject</label>
                    <input value={newForm.subject} onChange={e => setNewForm(f => ({ ...f, subject: e.target.value }))}
                      placeholder="Email subject..." className={INPUT} />
                  </div>
                )}
                <div>
                  <label className={LABEL}>Message *</label>
                  <textarea rows={4} value={newForm.message} onChange={e => setNewForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Campaign ka message..." className={INPUT + " resize-none"} />
                </div>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setNewCampaignModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleNewCampaign} disabled={newSaving}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                  {newSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {newSaving ? "Saving..." : "Save Campaign"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[var(--color-bg)] rounded-2xl w-full max-w-md shadow-[var(--shadow-luxury)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  {(() => { const cfg = TYPE_CONFIG[preview.type]; return <cfg.icon size={16} style={{ color: cfg.color }} />; })()}
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">{preview.name}</h3>
                </div>
                <button onClick={() => setPreview(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {preview.subject && (
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Subject</p>
                    <p className="text-sm font-medium text-[var(--color-text)]">{preview.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Message</p>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">{preview.message}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Recipients</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{audienceLabel[preview.recipients]?.split("(")[0].trim() || preview.recipients}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Status</p>
                    <p className="text-sm font-semibold" style={{ color: STATUS_CONFIG[preview.status]?.color }}>{STATUS_CONFIG[preview.status]?.label}</p>
                  </div>
                </div>
                {preview.sentCount > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Sent", value: preview.sentCount.toLocaleString("en-IN") },
                      { label: "Opened", value: preview.openCount.toLocaleString("en-IN") },
                      { label: "Clicked", value: preview.clickCount.toLocaleString("en-IN") },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center p-2.5 rounded-xl bg-[var(--color-bg-secondary)]">
                        <p className="font-bold text-sm text-[var(--color-text)]">{value}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
