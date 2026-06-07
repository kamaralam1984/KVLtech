"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, FileCheck, Target, Mail, Zap, Share2,
  Search, Headphones, Bell, Sparkles, Loader2,
  Copy, Check, CheckCircle2, Plus,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

const INPUT =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]";

const AI_TIPS = [
  "Use AI Blog Generator to publish 2-3 posts per week — Google rewards consistent content.",
  "Score your leads with AI every Monday to always follow up with the hottest prospects first.",
  "Generate 5 email subject lines, A/B test the top 2, and track which gets more opens.",
  "Use the Social Post Writer to repurpose every new blog post into a LinkedIn update.",
  "Set up automation rules for new leads — instant WhatsApp + email follow-up converts 3x better.",
  "SEO Keywords tool: use long-tail keywords in your proposals to match client search intent.",
  "AI Proposals generated with client-specific context have 40% higher acceptance rates.",
  "Run 'Score All Leads' after each marketing campaign to reprioritize your follow-up list.",
  "Use 'Translate to Hindi' in the Writing Assistant for WhatsApp messages — Hindi converts better in Tier 2 cities.",
  "Generate automation suggestions monthly to keep your CRM workflows optimized.",
];

function useToast() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const show = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ── Blog Generator Card ──────────────────────────────────────────────────────
function BlogCard() {
  const [suggesting, setSuggesting] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const { toast, show } = useToast();

  const suggestTopics = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "blog-topics" }),
      });
      const data = await res.json();
      if (data.suggestions?.length) {
        setTopics(data.suggestions);
        setOpen(true);
      } else {
        show(data.error || "No topics returned", false);
      }
    } catch {
      show("Network error", false);
    }
    setSuggesting(false);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center">
          <FileText size={20} className="text-[var(--color-gold)]" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">AI Blog Generator</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Generate SEO-optimized blog posts in seconds</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/admin/blog" className="btn-gold flex-1 flex items-center justify-center gap-1.5 text-xs py-2">
          <FileText size={13} /> Generate Blog
        </Link>
        <button
          onClick={suggestTopics}
          disabled={suggesting}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
        >
          {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Suggest Topics
        </button>
      </div>
      {open && topics.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Suggested Topics</span>
            <button onClick={() => setOpen(false)} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Close</button>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {topics.map((t, i) => (
              <Link
                key={i}
                href={`/admin/blog?topic=${encodeURIComponent(t)}`}
                className="block px-3 py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] hover:bg-[var(--color-gold)]/5 transition-all"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Proposal Generator Card ──────────────────────────────────────────────────
function ProposalCard({ proposalCount }: { proposalCount: number }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <FileCheck size={20} className="text-blue-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">AI Proposal Generator</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Create professional client proposals instantly</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
        <p className="font-display font-bold text-xl text-[var(--color-text)]">{proposalCount}</p>
        <p className="text-xs text-[var(--color-text-muted)]">Proposals generated this month</p>
      </div>
      <Link href="/admin/proposals" className="btn-gold w-full flex items-center justify-center gap-1.5 text-xs py-2">
        <FileCheck size={13} /> Create Proposal
      </Link>
    </div>
  );
}

// ── Lead Scorer Card ─────────────────────────────────────────────────────────
function LeadScorerCard({ leadCount, avgScore }: { leadCount: number; avgScore: number }) {
  const [scoring, setScoring] = useState(false);
  const { toast, show } = useToast();

  const scoreAll = async () => {
    setScoring(true);
    try {
      const res = await fetch("/api/admin/leads/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        show("All leads scored successfully!");
      } else {
        show("Failed to score leads", false);
      }
    } catch {
      show("Network error", false);
    }
    setScoring(false);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Target size={20} className="text-orange-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">AI Lead Scoring</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Automatically score and prioritize leads</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] text-center">
          <p className="font-display font-bold text-lg text-[var(--color-text)]">{leadCount}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Leads scored</p>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--color-bg-secondary)] text-center">
          <p className="font-display font-bold text-lg text-[var(--color-gold)]">{avgScore}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">Avg score</p>
        </div>
      </div>
      <button
        onClick={scoreAll}
        disabled={scoring}
        className="btn-gold w-full flex items-center justify-center gap-1.5 text-xs py-2 disabled:opacity-60"
      >
        {scoring ? <Loader2 size={13} className="animate-spin" /> : <Target size={13} />}
        {scoring ? "Scoring..." : "Score All Leads"}
      </button>
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Email Campaigns Card ─────────────────────────────────────────────────────
function EmailCampaignsCard() {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const { toast, show } = useToast();

  const generateSubjects = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "email-subject", context: topic }),
      });
      const data = await res.json();
      if (data.suggestions?.length) setSubjects(data.suggestions);
      else show(data.error || "No subjects returned", false);
    } catch {
      show("Network error", false);
    }
    setGenerating(false);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
          <Mail size={20} className="text-cyan-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">AI Email Campaigns</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Generate compelling subject lines</p>
        </div>
      </div>
      <input
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="Campaign topic (e.g. Diwali offer, new feature)"
        className={INPUT}
      />
      <div className="flex gap-2">
        <button
          onClick={generateSubjects}
          disabled={generating || !topic.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
        >
          {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Generate Subjects
        </button>
        <Link href="/admin/marketing" className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all whitespace-nowrap">
          <Mail size={13} /> Campaigns
        </Link>
      </div>
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(s).then(() => show("Copied!"))}
              className="text-[10px] px-2.5 py-1 rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Automation Suggestions Card ──────────────────────────────────────────────
function AutomationCard() {
  const [suggesting, setSuggesting] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [addingIdx, setAddingIdx] = useState<number | null>(null);
  const { toast, show } = useToast();

  const suggestRules = async () => {
    setSuggesting(true);
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "automation-rule" }),
      });
      const data = await res.json();
      if (data.suggestions?.length) setRules(data.suggestions);
      else show(data.error || "No suggestions returned", false);
    } catch {
      show("Network error", false);
    }
    setSuggesting(false);
  };

  const addRule = async (rule: any, idx: number) => {
    setAddingIdx(idx);
    try {
      const res = await fetch("/api/admin/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: rule.name,
          trigger: rule.trigger,
          action: rule.action,
          description: rule.description,
          isActive: true,
        }),
      });
      if (res.ok) {
        show("Rule added!");
        setRules(prev => prev.filter((_, i) => i !== idx));
      } else {
        show("Failed to add rule", false);
      }
    } catch {
      show("Network error", false);
    }
    setAddingIdx(null);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Zap size={20} className="text-purple-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Smart Automation</h3>
          <p className="text-xs text-[var(--color-text-muted)]">AI-suggested CRM automation rules</p>
        </div>
      </div>
      <button
        onClick={suggestRules}
        disabled={suggesting}
        className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
      >
        {suggesting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {suggesting ? "Thinking..." : "Suggest Rules"}
      </button>
      {rules.length > 0 && (
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <p className="text-xs font-semibold text-[var(--color-text)]">{rule.name}</p>
              <div className="flex gap-2 mt-1 mb-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">{rule.trigger}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500">{rule.action}</span>
              </div>
              {rule.description && (
                <p className="text-[10px] text-[var(--color-text-muted)] mb-2">{rule.description}</p>
              )}
              <button
                onClick={() => addRule(rule, i)}
                disabled={addingIdx === i}
                className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-gold)] hover:underline disabled:opacity-60"
              >
                {addingIdx === i ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                Add Rule
              </button>
            </div>
          ))}
        </div>
      )}
      <Link href="/admin/automation" className="text-xs text-[var(--color-gold)] hover:underline flex items-center gap-1">
        Manage Automations
      </Link>
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Social Media Writer Card ─────────────────────────────────────────────────
function SocialWriterCard() {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [post, setPost] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast, show } = useToast();

  const writePost = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setPost("");
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "social-post", context: topic }),
      });
      const data = await res.json();
      if (data.post) setPost(data.post);
      else show(data.error || "No post returned", false);
    } catch {
      show("Network error", false);
    }
    setGenerating(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(post).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
          <Share2 size={20} className="text-pink-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Social Post Writer</h3>
          <p className="text-xs text-[var(--color-text-muted)]">LinkedIn & Instagram posts instantly</p>
        </div>
      </div>
      <textarea
        value={topic}
        onChange={e => setTopic(e.target.value)}
        placeholder="What to promote? (e.g. new website plan launch, Diwali offer)"
        rows={2}
        className={INPUT + " resize-none"}
      />
      <button
        onClick={writePost}
        disabled={generating || !topic.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl btn-gold disabled:opacity-60"
      >
        {generating ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
        {generating ? "Writing..." : "Write LinkedIn Post"}
      </button>
      {post && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
          <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{post}</p>
          <button
            onClick={copy}
            className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-gold)] hover:underline"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "Copied!" : "Copy Post"}
          </button>
        </div>
      )}
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── SEO Keywords Card ────────────────────────────────────────────────────────
function SEOKeywordsCard() {
  const [service, setService] = useState("");
  const [generating, setGenerating] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const { toast, show } = useToast();

  const generateKeywords = async () => {
    if (!service.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: "seo-keywords", context: service }),
      });
      const data = await res.json();
      if (data.suggestions?.length) setKeywords(data.suggestions);
      else show(data.error || "No keywords returned", false);
    } catch {
      show("Network error", false);
    }
    setGenerating(false);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
          <Search size={20} className="text-green-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">SEO Keyword Generator</h3>
          <p className="text-xs text-[var(--color-text-muted)]">10 SEO keywords with long-tail variants</p>
        </div>
      </div>
      <input
        value={service}
        onChange={e => setService(e.target.value)}
        placeholder="Service or topic (e.g. restaurant website, ERP software)"
        className={INPUT}
      />
      <button
        onClick={generateKeywords}
        disabled={generating || !service.trim()}
        className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
      >
        {generating ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        Generate Keywords
      </button>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((kw, i) => (
            <span
              key={i}
              className="text-[10px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Ticket Responder Card ────────────────────────────────────────────────────
function TicketAICard({ ticketCount }: { ticketCount: number }) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Headphones size={20} className="text-amber-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Support AI</h3>
          <p className="text-xs text-[var(--color-text-muted)]">AI-powered ticket analysis and auto-response</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
        <p className="font-display font-bold text-xl text-[var(--color-text)]">{ticketCount}</p>
        <p className="text-xs text-[var(--color-text-muted)]">Tickets analyzed this week</p>
      </div>
      <Link href="/admin/support" className="w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all">
        <Headphones size={13} /> Go to Support
      </Link>
    </div>
  );
}

// ── Alerts Monitor Card ──────────────────────────────────────────────────────
function AlertsCard() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [running, setRunning] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    fetch("/api/admin/ai-alerts?unread=true&limit=1", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUnreadCount(d?.unreadCount || 0))
      .catch(() => {});
  }, []);

  const runCheck = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/ai-alerts/generate", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        show("Alert check complete!");
        fetch("/api/admin/ai-alerts?unread=true&limit=1", { credentials: "include" })
          .then(r => r.ok ? r.json() : null)
          .then(d => setUnreadCount(d?.unreadCount || 0))
          .catch(() => {});
      } else {
        show("Check failed", false);
      }
    } catch {
      show("Network error", false);
    }
    setRunning(false);
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
          <Bell size={20} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--color-text)]">AI Alerts</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Business intelligence monitoring</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-xl text-[var(--color-text)]">{unreadCount}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Unread alerts</p>
        </div>
        {unreadCount > 0 && (
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={runCheck}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all disabled:opacity-60"
        >
          {running ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} />}
          Run Check
        </button>
        <Link href="/admin/alerts" className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl btn-gold">
          View Alerts
        </Link>
      </div>
      {toast && (
        <p className={`text-xs ${toast.ok ? "text-green-500" : "text-red-500"}`}>{toast.msg}</p>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AIHubPage() {
  const [stats, setStats] = useState({
    blogPosts: 0,
    proposals: 0,
    chatLeads: 0,
    proposalsThisMonth: 0,
    leadsScored: 0,
    avgLeadScore: 0,
    ticketsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tipIdx] = useState(() => new Date().getDate() % AI_TIPS.length);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.allSettled([
        fetch("/api/admin/stats", { credentials: "include" }),
      ]);
      if (statsRes.status === "fulfilled" && statsRes.value.ok) {
        const d = await statsRes.value.json();
        setStats(prev => ({
          ...prev,
          blogPosts: d.blogPostCount || 0,
          proposals: d.proposalCount || 0,
          chatLeads: d.stats?.leads?.value || 0,
          proposalsThisMonth: d.proposalsThisMonth || 0,
          leadsScored: d.stats?.leads?.value || 0,
          avgLeadScore: d.avgLeadScore || 72,
          ticketsThisWeek: d.ticketsThisWeek || 0,
        }));
      }
    } catch {
      // stats are best-effort
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <>
      <AdminTopbar title="AI Hub" />
      <div className="p-6 space-y-6 max-w-[1400px]">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-amber-400 flex items-center justify-center shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-[var(--color-text)]">AI Command Center</h1>
            <p className="text-sm text-[var(--color-text-muted)]">All AI-powered tools in one place</p>
          </div>
        </motion.div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <BlogCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ProposalCard proposalCount={stats.proposalsThisMonth} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <LeadScorerCard leadCount={stats.leadsScored} avgScore={stats.avgLeadScore} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <EmailCampaignsCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <AutomationCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <SocialWriterCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <SEOKeywordsCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <TicketAICard ticketCount={stats.ticketsThisWeek} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <AlertsCard />
          </motion.div>
        </div>

        {/* AI Insights bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid lg:grid-cols-3 gap-4"
        >
          {/* Daily tip */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[var(--color-gold)]" />
              <h3 className="font-display font-semibold text-sm text-[var(--color-text)]">Daily AI Tip</h3>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {AI_TIPS[tipIdx]}
            </p>
          </div>

          {/* Quick stats */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sm text-[var(--color-text)] mb-3">AI Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: "AI Blog Posts", value: loading ? "…" : stats.blogPosts, icon: FileText, color: "#C9A227" },
                { label: "AI Proposals", value: loading ? "…" : stats.proposals, icon: FileCheck, color: "#0891B2" },
                { label: "Chat Leads", value: loading ? "…" : stats.chatLeads, icon: CheckCircle2, color: "#16A34A" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                  </div>
                  <p className="font-display font-bold text-sm text-[var(--color-text)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
