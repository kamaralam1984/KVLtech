"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LogIn, User, Package, CheckCircle2, Clock, Palette, Upload,
  ArrowRight, Shield, Eye, EyeOff, Zap, MessageCircle, Bell,
  Download, ExternalLink, AlertCircle, Star, X, FileText,
  ChevronDown, ChevronUp, Phone, Mail, MapPin, Send, LayoutDashboard,
  TrendingUp, Calendar, RefreshCw, Loader2, MessageSquare, Folder,
  CheckCircle, CreditCard, File, Image, FileCode, Music, Video,
  Paperclip, Users, Gift, Check, Sparkles, Mic,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ui/ChatWidget";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useWhiteLabel } from "@/components/ui/WhiteLabelProvider";
import { Confetti } from "@/components/ui/Confetti";
import { Skeleton, AvatarSkeleton, CardSkeleton } from "@/components/ui/Skeleton";
import { NoOrdersEmpty, NoDataEmpty } from "@/components/ui/EmptyState";

type Tab = "overview" | "branding" | "orders" | "support" | "messages" | "files" | "approvals" | "billing";

interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  plan: string;
  status: string;
  progress: number;
  amount: number;
  deliveryEst?: string;
  deliveredAt?: string;
  liveUrl?: string;
  product: { name: string; category: string; photo: string };
  payment?: { status: string; paidAt?: string };
  review?: { rating: number };
  statusHistory: { status: string; note?: string; changedAt: string }[];
}

interface Notification {
  id: string;
  title: string;
  body: string;
  color: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderType: string;
  senderName: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

interface ProjectFile {
  id: string;
  orderId: string;
  uploadedBy: string;
  uploaderType: string;
  uploaderName: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

interface DesignApproval {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  fileUrl?: string;
  previewUrl?: string;
  status: "PENDING" | "APPROVED" | "REVISION_REQUESTED";
  clientNote?: string;
  respondedAt?: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  planName: string;
  amount: number;
  billingCycle: string;
  status: string;
  nextBillingAt?: string;
  createdAt: string;
}

interface StripePlan {
  id: string;
  name: string;
  description?: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

interface StripeSubscription {
  id: string;
  stripeSubId: string;
  stripePlanId: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

const STATUS_LABEL: Record<string, string> = {
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  DESIGN_STARTED: "Design Started",
  DEVELOPMENT: "Development",
  REVIEW_TESTING: "Review & Testing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STEP: Record<string, number> = {
  PAYMENT_PENDING: 0,
  PAYMENT_CONFIRMED: 0,
  DESIGN_STARTED: 1,
  DEVELOPMENT: 2,
  REVIEW_TESTING: 3,
  DELIVERED: 4,
};

const STEPS = ["Payment Confirmed", "Design Started", "Development", "Review & Testing", "Delivered"];

const FAQS = [
  { q: "How do I send my logo?", a: "Send your logo in PNG or SVG format via WhatsApp +91 9942000413. Min 500×500px preferred." },
  { q: "When will my website go live?", a: "Premium plan: 1-2 days, Basic plan: 3-5 days. You will need to provide domain and hosting details to go live." },
  { q: "How do I update content after delivery?", a: "We provide an easy admin panel so you can update content yourself. Training is included." },
  { q: "What if there is an issue with my project?", a: "Premium: 90 days free support. Basic: 30 days free support. Contact us via WhatsApp or email." },
  { q: "Where should I buy domain and hosting?", a: "We recommend Hostinger or GoDaddy. We can also purchase and set it up for you if needed." },
];

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all placeholder:text-[var(--color-text-muted)]";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType?: string, name?: string) {
  const m = mimeType || "";
  if (m.startsWith("image/")) return Image;
  if (m.startsWith("video/")) return Video;
  if (m.startsWith("audio/")) return Music;
  if (m.includes("pdf") || (name || "").endsWith(".pdf")) return FileText;
  if (m.includes("zip") || m.includes("rar")) return Folder;
  if (m.includes("javascript") || m.includes("html") || m.includes("css") || m.includes("json")) return FileCode;
  return File;
}

export default function ClientPortalPage() {
  const wl = useWhiteLabel();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const [branding, setBranding] = useState({
    orderId: "", companyName: "", tagline: "", primaryColor: "#C9A227",
    secondaryColor: "#0F172A", fontPreference: "", phone: "", email: "",
    address: "", website: "", logoNote: "", logoUrl: "",
  });
  const [brandingSaved, setBrandingSaved] = useState(false);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [brandingError, setBrandingError] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoDragOver, setLogoDragOver] = useState(false);

  const [ticket, setTicket] = useState({ subject: "", orderId: "", priority: "Medium", message: "" });
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketNo, setTicketNo] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [chatOrderId, setChatOrderId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [filesOrderId, setFilesOrderId] = useState("");
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);

  // Meeting recording state
  const [recordingFile, setRecordingFile] = useState<File | null>(null);
  const [recordingUploading, setRecordingUploading] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingTranscript, setRecordingTranscript] = useState("");
  const [recordingError, setRecordingError] = useState("");
  const recordingInputRef = useRef<HTMLInputElement>(null);

  const [approvalsOrderId, setApprovalsOrderId] = useState("");
  const [approvals, setApprovals] = useState<DesignApproval[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [approvalSubmitting, setApprovalSubmitting] = useState<string | null>(null);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subAction, setSubAction] = useState<{ id: string; action: "pause" | "cancel" | "resume" } | null>(null);
  const [subActing, setSubActing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<{
    totalEarned: number; pendingEarnings: number; level1Count: number; level2Count: number; totalReferrals: number;
  }>({ totalEarned: 0, pendingEarnings: 0, level1Count: 0, level2Count: 0, totalReferrals: 0 });
  const [referralLink, setReferralLink] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [referralSending, setReferralSending] = useState(false);
  const [referralMsg, setReferralMsg] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Stripe
  const [stripePlans, setStripePlans] = useState<StripePlan[]>([]);
  const [stripePlansLoading, setStripePlansLoading] = useState(false);
  const [stripeNotConfigured, setStripeNotConfigured] = useState(false);
  const [stripeCheckoutLoading, setStripeCheckoutLoading] = useState<string | null>(null);
  const [stripeSubscriptions, setStripeSubscriptions] = useState<StripeSubscription[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null); // stripeSubId
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const r = await fetch("/api/orders", { credentials: "include" });
      const data = await r.json();
      if (data.orders) setOrders(data.orders);
    } catch {}
    setOrdersLoading(false);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const r = await fetch("/api/notifications", { credentials: "include" });
      const data = await r.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch {}
    setNotifLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchNotifications();
    }
  }, [user, fetchOrders, fetchNotifications]);

  useEffect(() => {
    const active = orders.find(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
    if (active && !branding.orderId) setBranding(b => ({ ...b, orderId: active.id }));
    const rv: Record<string, number> = {};
    orders.forEach(o => { if (o.review?.rating) rv[o.id] = o.review.rating; });
    setRatings(rv);
    if (orders.length > 0) {
      if (!chatOrderId) setChatOrderId(orders[0].id);
      if (!filesOrderId) setFilesOrderId(orders[0].id);
      if (!approvalsOrderId) setApprovalsOrderId(orders[0].id);
    }
  }, [orders]);

  const fetchChatMessages = useCallback(async (orderId: string) => {
    if (!orderId) return;
    try {
      const r = await fetch(`/api/messages?orderId=${orderId}`, { credentials: "include" });
      const data = await r.json();
      if (data.messages) setChatMessages(data.messages);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === "messages" && chatOrderId) {
      fetchChatMessages(chatOrderId);
      chatPollRef.current = setInterval(() => fetchChatMessages(chatOrderId), 5000);
    }
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, [activeTab, chatOrderId, fetchChatMessages]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatText.trim() || !chatOrderId || chatSending) return;
    setChatSending(true);
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: chatOrderId, text: chatText.trim() }),
      });
      if (r.ok) {
        setChatText("");
        fetchChatMessages(chatOrderId);
      }
    } catch {}
    setChatSending(false);
  };

  const fetchProjectFiles = useCallback(async (orderId: string) => {
    if (!orderId) return;
    setFilesLoading(true);
    try {
      const r = await fetch(`/api/project-files?orderId=${orderId}`, { credentials: "include" });
      const data = await r.json();
      if (data.files) setProjectFiles(data.files);
    } catch {}
    setFilesLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "files" && filesOrderId) fetchProjectFiles(filesOrderId);
  }, [activeTab, filesOrderId, fetchProjectFiles]);

  const uploadLogo = async (file: File) => {
    setLogoError("");
    if (!file.type.startsWith("image/")) { setLogoError("Sirf image files allowed hain"); return; }
    if (file.size > 10 * 1024 * 1024) { setLogoError("File 10MB se badi hai"); return; }
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/branding/upload", { method: "POST", credentials: "include", body: fd });
      const data = await r.json();
      if (r.ok && data.url) {
        setBranding(b => ({ ...b, logoUrl: data.url }));
      } else {
        setLogoError(data.error || "Upload failed");
      }
    } catch { setLogoError("Upload failed — retry karein"); }
    setLogoUploading(false);
  };

  const uploadFile = async (file: File) => {
    if (!filesOrderId || fileUploading) return;
    setFileUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("orderId", filesOrderId);
      const r = await fetch("/api/project-files", { method: "POST", credentials: "include", body: fd });
      if (r.ok) fetchProjectFiles(filesOrderId);
    } catch {}
    setFileUploading(false);
  };

  async function uploadMeetingRecording(file: File) {
    if (!file) return;
    const MAX = 25 * 1024 * 1024;
    if (file.size > MAX) {
      setRecordingError("File too large. Maximum size is 25MB.");
      return;
    }
    setRecordingUploading(true);
    setRecordingError("");
    setRecordingTranscript("");
    setRecordingProgress(10);

    const progressTimer = setInterval(() => {
      setRecordingProgress(prev => prev < 85 ? prev + 10 : prev);
    }, 1500);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("callType", "meeting");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      clearInterval(progressTimer);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setRecordingError(err.error || "Transcription failed. Please try again.");
        setRecordingUploading(false);
        setRecordingProgress(0);
        return;
      }

      const data = await res.json();
      setRecordingTranscript(data.transcript || "");
      setRecordingProgress(100);
      setRecordingFile(file);
    } catch {
      clearInterval(progressTimer);
      setRecordingError("Network error. Please try again.");
    } finally {
      setRecordingUploading(false);
    }
  }

  function downloadTranscript() {
    if (!recordingTranscript) return;
    const blob = new Blob([recordingTranscript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const fetchApprovals = useCallback(async (orderId: string) => {
    if (!orderId) return;
    setApprovalsLoading(true);
    try {
      const r = await fetch(`/api/design-approvals?orderId=${orderId}`, { credentials: "include" });
      const data = await r.json();
      if (data.approvals) setApprovals(data.approvals);
    } catch {}
    setApprovalsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "approvals" && approvalsOrderId) fetchApprovals(approvalsOrderId);
  }, [activeTab, approvalsOrderId, fetchApprovals]);

  const respondToApproval = async (id: string, status: "APPROVED" | "REVISION_REQUESTED") => {
    setApprovalSubmitting(id);
    try {
      const r = await fetch(`/api/design-approvals?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, clientNote: approvalNotes[id] || "" }),
      });
      if (r.ok) fetchApprovals(approvalsOrderId);
    } catch {}
    setApprovalSubmitting(null);
  };

  const fetchBillingData = useCallback(async () => {
    setSubsLoading(true);
    try {
      const [subsRes, refRes] = await Promise.all([
        fetch("/api/subscriptions", { credentials: "include" }),
        fetch("/api/referrals", { credentials: "include" }),
      ]);
      const subsData = await subsRes.json();
      const refData = await refRes.json();
      if (Array.isArray(subsData)) setSubscriptions(subsData);
      if (refData.referrals) setReferrals(refData.referrals);
      if (refData.stats) setReferralStats(refData.stats);
      if (refData.referralLink) setReferralLink(refData.referralLink);
    } catch {}
    setSubsLoading(false);
  }, []);

  const fetchStripePlans = useCallback(async () => {
    setStripePlansLoading(true);
    setStripeNotConfigured(false);
    try {
      const r = await fetch("/api/admin/stripe-plans", { credentials: "include" });
      const data = await r.json();
      if (data.plans) {
        setStripePlans(data.plans.filter((p: StripePlan) => p.isActive));
      }
    } catch {
      setStripeNotConfigured(true);
    }
    setStripePlansLoading(false);
  }, []);

  const fetchStripeSubscriptions = useCallback(async () => {
    try {
      const r = await fetch("/api/client/stripe-subscriptions", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        if (data.subscriptions) setStripeSubscriptions(data.subscriptions);
      }
    } catch {}
  }, []);

  const handleStripeCheckout = async (planId: string) => {
    setStripeCheckoutLoading(planId);
    try {
      const r = await fetch("/api/payment/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const data = await r.json();
      if (!r.ok) {
        alert(data.error || "Failed to start checkout");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setStripeCheckoutLoading(null);
  };

  const handleStripeUpgrade = async (stripeSubId: string, newPriceId: string) => {
    setUpgradeLoading(true);
    try {
      const r = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stripeSubId, newPriceId }),
      });
      const data = await r.json();
      if (!r.ok) {
        alert(data.error || "Upgrade failed");
      } else {
        setShowUpgradeModal(null);
        fetchStripeSubscriptions();
        alert("Plan changed successfully!");
      }
    } catch {
      alert("Network error. Please try again.");
    }
    setUpgradeLoading(false);
  };

  useEffect(() => {
    if (activeTab === "billing") {
      fetchBillingData();
      fetchStripePlans();
      fetchStripeSubscriptions();
    }
  }, [activeTab, fetchBillingData, fetchStripePlans, fetchStripeSubscriptions]);

  const sendReferral = async () => {
    if (!referralEmail.trim() || referralSending) return;
    setReferralSending(true);
    setReferralMsg("");
    try {
      const r = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ refereeEmail: referralEmail.trim() }),
      });
      const data = await r.json();
      if (r.ok) {
        setReferralMsg("Referral sent successfully!");
        setReferralEmail("");
        fetchBillingData();
      } else {
        setReferralMsg(data.error || "Failed to send referral.");
      }
    } catch {
      setReferralMsg("Network error.");
    }
    setReferralSending(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await r.json();
      if (!r.ok) setLoginError(data.error || "Login failed. Please try again.");
      else setUser(data.client);
    } catch {
      setLoginError("Network error. Please try again.");
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setOrders([]);
    setNotifications([]);
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  const handleBrandingSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrandingError("");
    setBrandingLoading(true);
    try {
      const r = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(branding),
      });
      const data = await r.json();
      if (!r.ok) setBrandingError(data.error || "Submit failed.");
      else { setBrandingSaved(true); fetchNotifications(); }
    } catch {
      setBrandingError("Network error. Please try again.");
    }
    setBrandingLoading(false);
  };

  const handleTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError("");
    setTicketLoading(true);
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(ticket),
      });
      const data = await r.json();
      if (!r.ok) setTicketError(data.error || "Submit failed.");
      else { setTicketSent(true); setTicketNo(data.ticket.ticketNo); fetchNotifications(); }
    } catch {
      setTicketError("Network error. Please try again.");
    }
    setTicketLoading(false);
  };

  const handleRating = async (orderId: string, rating: number) => {
    setRatings(r => ({ ...r, [orderId]: rating }));
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId, rating }),
    });
  };

  const handleSubAction = async (id: string, action: "pause" | "cancel" | "resume") => {
    setSubActing(true);
    try {
      const r = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, subscriptionId: id }),
      });
      const data = await r.json();
      if (r.ok && data.subscription) {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: data.subscription.status } : s));
      }
    } catch {}
    setSubActing(false);
    setShowCancelConfirm(null);
    setSubAction(null);
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const activeOrders = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");
  const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

  // Confetti: fire once per session when user has a delivered order
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (deliveredOrders.length > 0 && user) {
      const key = `confetti_shown_${user.id}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3200);
      }
    }
  }, [deliveredOrders.length, user]);

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "support", label: "Support", icon: MessageCircle },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "files", label: "Files", icon: Folder },
    { id: "approvals", label: "Approvals", icon: CheckCircle },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  if (checking) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[90vh] bg-[var(--color-bg-secondary)]">
          {/* Portal skeleton: header bar + tab bar + content */}
          <div className="bg-[var(--color-navy)] border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-20 rounded-md" />
                <AvatarSkeleton size="md" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-28 rounded" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            {/* Tab bar skeleton */}
            <div className="flex gap-1.5 flex-wrap mb-7 bg-[var(--color-bg)] rounded-2xl p-1.5 border border-[var(--color-border)] w-fit">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className={`h-9 rounded-xl ${i === 0 ? "w-24" : "w-20"}`} />
              ))}
            </div>
            {/* Content area skeleton */}
            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card p-5 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                    <div className="flex flex-col gap-2 flex-1">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <CardSkeleton lines={5} />
              <CardSkeleton lines={3} />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-[92vh] flex items-center justify-center bg-[var(--color-bg-secondary)]">
          <div className="max-w-md w-full mx-4 py-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="card p-8">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <img src={wl.logo} alt={wl.companyName} className="h-10 w-auto object-contain" />
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_0_8px_rgba(201,162,39,0.06)]">
                    <Shield size={30} className="text-[var(--color-gold)]" />
                  </div>
                  <h1 className="font-display font-bold text-2xl text-[var(--color-text)] mb-1">Client Portal</h1>
                  <p className="text-sm text-[var(--color-text-secondary)]">Track your project, submit branding details</p>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm mb-5">
                      <AlertCircle size={15} className="shrink-0" /> {loginError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={LABEL}>Email Address</label>
                    <input required type="email" value={loginForm.email}
                      onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="you@company.com" className={INPUT} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Password</label>
                      <button type="button" className="text-[10px] text-[var(--color-gold)] hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input required type={showPass ? "text" : "password"} value={loginForm.password}
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="••••••••" className={INPUT + " pr-12"} />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                    {loginLoading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
                    {loginLoading ? "Logging in..." : "Login to Portal"}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[var(--color-border)] space-y-3">
                  <p className="text-center text-xs text-[var(--color-text-muted)]">
                    Demo: <span className="font-mono text-[var(--color-gold)]">demo@client.com</span> / <span className="font-mono text-[var(--color-gold)]">client123</span>
                  </p>
                  <Link href="/contact" className="btn-outline w-full justify-center text-sm">
                    Pehle Product Purchase Karein <ArrowRight size={14} />
                  </Link>
                  <a href="https://wa.me/919942000413?text=I need client portal access" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                    <MessageCircle size={13} style={{ color: "#25D366" }} /> Need help? WhatsApp us
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Confetti trigger={showConfetti} />
      <main className="min-h-screen bg-[var(--color-bg-secondary)]" style={{ paddingTop: "40px" }}>

        <div className="bg-[var(--color-navy)] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={wl.logo} alt={wl.companyName} className="h-7 w-auto object-contain mr-1" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center font-bold text-sm text-white shadow-[var(--shadow-gold)]">
                {user.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-white/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {user.company || "Client Portal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button onClick={() => setNotifOpen(v => !v)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[var(--color-gold)] rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1">{unread}</span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        className="absolute right-0 top-11 w-80 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-luxury)] z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                          <p className="font-display font-semibold text-sm text-[var(--color-text)]">
                            Notifications {unread > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-full text-[10px]">{unread} new</span>}
                          </p>
                          <div className="flex items-center gap-2">
                            {unread > 0 && (
                              <button onClick={markAllRead} className="text-[10px] text-[var(--color-gold)] hover:underline flex items-center gap-1">
                                <RefreshCw size={10} /> Mark all read
                              </button>
                            )}
                            <button onClick={() => setNotifOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifLoading ? (
                            <div className="p-6 flex justify-center"><Loader2 size={20} className="animate-spin text-[var(--color-gold)]" /></div>
                          ) : notifications.length === 0 ? (
                            <p className="p-6 text-center text-xs text-[var(--color-text-muted)]">No notifications</p>
                          ) : notifications.map(n => (
                            <div key={n.id} className={`px-4 py-3 border-b border-[var(--color-border)] last:border-0 flex gap-3 ${!n.isRead ? "bg-[var(--color-gold)]/[0.03]" : ""}`}>
                              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.color }} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold truncate ${n.isRead ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text)]"}`}>{n.title}</p>
                                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{n.body}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                              </div>
                              {!n.isRead && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] shrink-0 mt-1" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleLogout}
                className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 pb-8 sm:pb-7">

          {/* Tab bar — horizontally scrollable on mobile */}
          <div
            className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap mb-7 sm:bg-[var(--color-bg)] sm:rounded-2xl sm:p-1.5 sm:border sm:border-[var(--color-border)] sm:w-fit"
            role="tablist"
            aria-label="Portal sections"
          >
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`tabpanel-${id}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${activeTab === id
                  ? "bg-[var(--color-navy)] text-white shadow-[var(--shadow-card)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]"}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">

                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Active Orders", value: ordersLoading ? "..." : String(activeOrders.length), icon: Package, color: "#0891B2", bg: "#0891B215" },
                    { label: "Delivered", value: ordersLoading ? "..." : String(deliveredOrders.length), icon: CheckCircle2, color: "#16A34A", bg: "#16A34A15" },
                    { label: "Notifications", value: String(unread), icon: Bell, color: "#C9A227", bg: "#C9A22715" },
                  ].map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="card p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon size={22} style={{ color }} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-2xl text-[var(--color-text)]">{value}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {ordersLoading ? (
                  <CardSkeleton lines={5} />
                ) : activeOrders.length > 0 ? (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Active Order</h2>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {STATUS_LABEL[activeOrders[0].status] || activeOrders[0].status}
                      </span>
                    </div>

                    <div className="flex items-start gap-4 mb-6 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-[var(--color-gold)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text)]">{activeOrders[0].product.name}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          #{activeOrders[0].orderNumber} · {activeOrders[0].plan.charAt(0) + activeOrders[0].plan.slice(1).toLowerCase()} Plan
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {activeOrders[0].deliveryEst && (
                          <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 justify-end">
                            <Calendar size={11} /> Est. {new Date(activeOrders[0].deliveryEst).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[var(--color-text)] mt-0.5">₹{activeOrders[0].amount.toLocaleString("en-IN")}</p>
                      </div>
                    </div>

                    {(() => {
                      const currentStep = STATUS_STEP[activeOrders[0].status] ?? 0;
                      return (
                        <>
                          <div className="relative flex items-start justify-between">
                            <div className="absolute top-3.5 left-[10%] right-[10%] h-px bg-[var(--color-border)]" />
                            <div className="absolute top-3.5 left-[10%] h-px bg-[var(--color-gold)] transition-all duration-700"
                              style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }} />
                            {STEPS.map((step, i) => (
                              <div key={step} className="relative flex flex-col items-center z-10" style={{ width: "20%" }}>
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${i <= currentStep ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg)]"}`}>
                                  {i < currentStep ? <CheckCircle2 size={13} className="text-white" />
                                    : i === currentStep ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                      : <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                                </div>
                                <p className={`text-[9px] text-center mt-2 leading-snug hidden sm:block font-medium ${i <= currentStep ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"}`}>{step}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-center text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
                            Current Step: <span className="font-semibold text-[var(--color-text)]">{STATUS_LABEL[activeOrders[0].status]}</span>
                            {activeOrders[0].progress > 0 && ` · ${activeOrders[0].progress}% complete`}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="card overflow-hidden">
                    <NoOrdersEmpty />
                  </div>
                )}

                <div className="card p-6">
                  <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Quick Actions</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Submit Branding", desc: "Logo, colors, details", icon: Palette, color: "#C9A227", bg: "#C9A22715", action: () => setActiveTab("branding") },
                      { label: "Track Orders", desc: "Status & progress", icon: Package, color: "#0891B2", bg: "#0891B215", action: () => setActiveTab("orders") },
                      { label: "WhatsApp Support", desc: "Instant response", icon: MessageCircle, color: "#25D366", bg: "#25D36615", href: "https://wa.me/919942000413" },
                      { label: "Raise Ticket", desc: "Email support", icon: FileText, color: "#7C3AED", bg: "#7C3AED15", action: () => setActiveTab("support") },
                    ].map(({ label, desc, icon: Icon, color, bg, action, href }: any) => (
                      href
                        ? <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div><p className="text-sm font-semibold text-[var(--color-text)]">{label}</p><p className="text-[11px] text-[var(--color-text-muted)]">{desc}</p></div>
                        </a>
                        : <button key={label} onClick={action}
                          className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group text-left">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: bg }}>
                            <Icon size={18} style={{ color }} />
                          </div>
                          <div><p className="text-sm font-semibold text-[var(--color-text)]">{label}</p><p className="text-[11px] text-[var(--color-text-muted)]">{desc}</p></div>
                        </button>
                    ))}
                  </div>
                </div>

                {orders.length > 0 && (
                  <div className="card p-6">
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Recent Activity</h2>
                    <div className="space-y-0">
                      {orders.flatMap(o => o.statusHistory.map(h => ({
                        ...h, product: o.product.name, orderId: o.orderNumber,
                      }))).sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).slice(0, 5).map((item, i) => (
                        <div key={i} className="flex gap-4 py-3.5 border-b border-[var(--color-border)] last:border-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                            <TrendingUp size={14} className="text-[var(--color-gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">{STATUS_LABEL[item.status] || item.status}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{item.product} · #{item.orderId}</p>
                            {item.note && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.note}</p>}
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] shrink-0 mt-0.5 whitespace-nowrap">
                            {new Date(item.changedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "branding" && (
              <motion.div key="branding" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="max-w-2xl">
                  <div className="card p-7">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                        <Palette size={22} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Branding Details</h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">These details will be applied to your website</p>
                      </div>
                    </div>

                    {brandingSaved ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle2 size={32} className="text-[var(--color-success)]" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-[var(--color-text)] mb-2">Branding Submitted!</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                          Our team has received your details. We'll apply them within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <button onClick={() => setActiveTab("orders")} className="btn-gold">
                            <Package size={15} /> View My Orders
                          </button>
                          <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer" className="btn-outline">
                            <MessageCircle size={15} /> Track on WhatsApp
                          </a>
                          <button onClick={() => setBrandingSaved(false)} className="btn-outline">Edit Details</button>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleBrandingSave} className="space-y-5">
                        {orders.length > 0 && (
                          <div>
                            <label className={LABEL}>Related Order</label>
                            <select value={branding.orderId} onChange={e => setBranding(b => ({ ...b, orderId: e.target.value }))} className={INPUT}>
                              <option value="">Select your order (optional)</option>
                              {orders.filter(o => o.status !== "CANCELLED").map(o => (
                                <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Company Name *</label>
                            <input required value={branding.companyName} onChange={e => setBranding(b => ({ ...b, companyName: e.target.value }))}
                              placeholder="Your company name" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Tagline / Slogan</label>
                            <input value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))}
                              placeholder="Quality You Can Trust" className={INPUT} />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Phone Number *</label>
                            <input required type="tel" value={branding.phone} onChange={e => setBranding(b => ({ ...b, phone: e.target.value }))}
                              placeholder="+91 XXXXX XXXXX" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Business Email *</label>
                            <input required type="email" value={branding.email} onChange={e => setBranding(b => ({ ...b, email: e.target.value }))}
                              placeholder="info@yourcompany.com" className={INPUT} />
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className={LABEL}>Business Address</label>
                            <input value={branding.address} onChange={e => setBranding(b => ({ ...b, address: e.target.value }))}
                              placeholder="City, State, Pincode" className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Existing Website</label>
                            <input value={branding.website} onChange={e => setBranding(b => ({ ...b, website: e.target.value }))}
                              placeholder="https://yoursite.com" className={INPUT} />
                          </div>
                        </div>
                        <div>
                          <label className={LABEL}>Brand Colors</label>
                          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                            <div className="flex items-center gap-3">
                              <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))}
                                className="w-11 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-[var(--color-text)]">Primary</p>
                                <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">{branding.primaryColor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="color" value={branding.secondaryColor} onChange={e => setBranding(b => ({ ...b, secondaryColor: e.target.value }))}
                                className="w-11 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-[var(--color-text)]">Secondary</p>
                                <p className="text-[11px] font-mono text-[var(--color-text-secondary)]">{branding.secondaryColor}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className={LABEL}>Font Preference</label>
                          <select value={branding.fontPreference} onChange={e => setBranding(b => ({ ...b, fontPreference: e.target.value }))} className={INPUT}>
                            <option value="">Choose a style</option>
                            <option>Modern & Bold (Plus Jakarta Sans)</option>
                            <option>Professional & Clean (Inter)</option>
                            <option>Elegant & Serif (Playfair Display)</option>
                            <option>Friendly & Rounded (Nunito)</option>
                            <option>No preference — let the team decide</option>
                          </select>
                        </div>
                        <div>
                          <label className={LABEL}>Logo Submission</label>
                          {branding.logoUrl ? (
                            <div className="rounded-xl border border-[var(--color-border)] p-4 flex items-center gap-4">
                              <img src={branding.logoUrl} alt="Logo preview" className="h-16 w-16 object-contain rounded-lg border border-[var(--color-border)] bg-white p-1" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-green-600">✓ Logo uploaded successfully</p>
                                <p className="text-xs text-[var(--color-text-muted)] truncate mt-1">{branding.logoUrl}</p>
                              </div>
                              <button type="button" onClick={() => setBranding(b => ({ ...b, logoUrl: "" }))}
                                className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label
                              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${logoDragOver ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-gold)]"}`}
                              onDragOver={e => { e.preventDefault(); setLogoDragOver(true); }}
                              onDragLeave={() => setLogoDragOver(false)}
                              onDrop={e => { e.preventDefault(); setLogoDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadLogo(f); }}
                            >
                              <input type="file" className="hidden" accept="image/*,.svg,.png,.jpg,.jpeg,.webp,.gif,.avif,.bmp,.tiff,.ico,.heic"
                                onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                              {logoUploading ? (
                                <Loader2 size={28} className="animate-spin text-[var(--color-gold)]" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
                                  <Upload size={22} className="text-[var(--color-gold)]" />
                                </div>
                              )}
                              <div className="text-center">
                                <p className="text-sm font-semibold text-[var(--color-text)]">
                                  {logoUploading ? "Uploading..." : "Click karo ya drag & drop karo"}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                  PNG, SVG, JPG, WebP, GIF, AVIF, BMP, TIFF, ICO, HEIC · Max 10MB
                                </p>
                              </div>
                            </label>
                          )}
                          {logoError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{logoError}</p>}
                        </div>
                        <div>
                          <label className={LABEL}>Additional Notes</label>
                          <textarea rows={3} value={branding.logoNote} onChange={e => setBranding(b => ({ ...b, logoNote: e.target.value }))}
                            placeholder="Any specific requirements? Reference websites, style preferences..." className={INPUT + " resize-none"} />
                        </div>
                        {brandingError && (
                          <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {brandingError}</p>
                        )}
                        <button type="submit" disabled={brandingLoading}
                          className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60">
                          {brandingLoading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                          {brandingLoading ? "Submitting..." : "Submit Branding Details"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-[var(--color-text)]">My Orders</h2>
                  <button onClick={fetchOrders} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1 transition-colors">
                    <RefreshCw size={13} className={ordersLoading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    <CardSkeleton lines={5} />
                    <CardSkeleton lines={5} />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="card overflow-hidden">
                    <NoOrdersEmpty />
                  </div>
                ) : orders.map(order => {
                  const currentStep = STATUS_STEP[order.status] ?? 0;
                  return (
                    <div key={order.id} className="card p-6 space-y-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                            <Package size={22} className="text-[var(--color-gold)]" />
                          </div>
                          <div>
                            <p className="font-display font-semibold text-[var(--color-text)]">{order.product.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              #{order.orderNumber} · {order.plan.charAt(0) + order.plan.slice(1).toLowerCase()} Plan · ₹{order.amount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                          order.status === "DELIVERED" ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : order.status === "CANCELLED" ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                          {order.status === "DELIVERED" ? <CheckCircle2 size={12} />
                            : <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                          {STATUS_LABEL[order.status] || order.status}
                        </span>
                      </div>

                      {order.progress > 0 && (
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-[var(--color-text-secondary)] font-medium">Progress</span>
                            <span className="font-bold text-[var(--color-text)]">{order.progress}%</span>
                          </div>
                          <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${order.progress}%` }} transition={{ duration: 1, delay: 0.2 }}
                              className="h-full rounded-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)]" />
                          </div>
                        </div>
                      )}

                      <div className="relative flex items-start justify-between">
                        <div className="absolute top-3.5 left-[10%] right-[10%] h-px bg-[var(--color-border)]" />
                        <div className="absolute top-3.5 left-[10%] h-px bg-[var(--color-gold)] transition-all duration-700"
                          style={{ width: `${(currentStep / (STEPS.length - 1)) * 80}%` }} />
                        {STEPS.map((step, i) => (
                          <div key={step} className="relative flex flex-col items-center z-10" style={{ width: "20%" }}>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${i <= currentStep ? "border-[var(--color-gold)] bg-[var(--color-gold)]" : "border-[var(--color-border)] bg-[var(--color-bg)]"}`}>
                              {i < currentStep ? <CheckCircle2 size={13} className="text-white" />
                                : i === currentStep ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                  : <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />}
                            </div>
                            <p className={`text-[9px] text-center mt-2 leading-snug hidden sm:block ${i <= currentStep ? "text-[var(--color-text-secondary)] font-medium" : "text-[var(--color-text-muted)]"}`}>{step}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                          <Clock size={12} className="text-[var(--color-text-muted)]" />
                          {order.status === "DELIVERED" ? "Delivered:" : "Est. Delivery:"}{" "}
                          <span className="font-semibold text-[var(--color-text)]">
                            {order.status === "DELIVERED" && order.deliveredAt
                              ? new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : order.deliveryEst
                                ? new Date(order.deliveryEst).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "TBD"}
                          </span>
                        </p>
                        {order.status === "DELIVERED" ? (
                          <div className="flex gap-2 flex-wrap">
                            {order.liveUrl && (
                              <a href={order.liveUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-all">
                                <ExternalLink size={12} /> Live Preview
                              </a>
                            )}
                            <a href={`/api/invoice?orderId=${order.id}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all">
                              <Download size={12} /> Download Invoice
                            </a>
                          </div>
                        ) : (
                          <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                            <MessageCircle size={12} style={{ color: "#25D366" }} /> Ask for update
                          </a>
                        )}
                      </div>

                      {order.status === "DELIVERED" && (
                        <div className="pt-4 border-t border-[var(--color-border)]">
                          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Rate your experience</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button key={s} onClick={() => handleRating(order.id, s)} className="transition-transform hover:scale-110">
                                <Star size={22}
                                  fill={s <= (ratings[order.id] || 0) ? "#C9A227" : "none"}
                                  className={s <= (ratings[order.id] || 0) ? "text-[var(--color-gold)]" : "text-[var(--color-border)]"} />
                              </button>
                            ))}
                            {ratings[order.id] && <span className="ml-2 text-xs text-[var(--color-text-muted)] self-center">Shukriya!</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "support" && (
              <motion.div key="support" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="grid lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 space-y-5">
                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Contact Support</h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { icon: MessageCircle, label: "WhatsApp", sub: "+91 9942000413", time: "Reply in 5 min", color: "#25D366", href: "https://wa.me/919942000413?text=Hi! I need support." },
                          { icon: Phone, label: "Call Us", sub: "+91 9942000413", time: "Mon–Sat 9AM–7PM", color: "#0891B2", href: "tel:+919942000413" },
                          { icon: Mail, label: "Email", sub: wl.supportEmail.length > 18 ? wl.supportEmail.slice(0, 15) + "..." : wl.supportEmail, time: "Reply in 24 hrs", color: "#C9A227", href: `mailto:${wl.supportEmail}` },
                          { icon: MapPin, label: "Office Visit", sub: "Sector 62, Noida", time: "Mon–Sat 10AM–6PM", color: "#7C3AED", href: "#" },
                        ].map(({ icon: Icon, label, sub, time, color, href }) => (
                          <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${color}15` }}>
                              <Icon size={18} style={{ color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)]">{sub}</p>
                              <p className="text-[10px] text-[var(--color-text-muted)]">{time}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-1">Raise a Ticket</h2>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-5">Describe your issue — we reply within 24 hours</p>

                      {ticketSent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                          <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={28} className="text-[var(--color-success)]" />
                          </div>
                          <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-1.5">Ticket Raised!</h3>
                          <p className="text-xs text-[var(--color-text-secondary)] mb-5">
                            Ticket ID: <span className="font-mono font-semibold text-[var(--color-gold)]">#{ticketNo}</span>
                          </p>
                          <div className="flex gap-3 justify-center">
                            <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer" className="btn-gold text-sm">
                              <MessageCircle size={14} /> Follow up
                            </a>
                            <button onClick={() => { setTicketSent(false); setTicket({ subject: "", orderId: "", priority: "Medium", message: "" }); }} className="btn-outline text-sm">
                              New Ticket
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleTicket} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className={LABEL}>Subject *</label>
                              <input required value={ticket.subject} onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                                placeholder="Brief problem description" className={INPUT} />
                            </div>
                            <div>
                              <label className={LABEL}>Related Order</label>
                              <select value={ticket.orderId} onChange={e => setTicket(t => ({ ...t, orderId: e.target.value }))} className={INPUT}>
                                <option value="">Select order (optional)</option>
                                {orders.map(o => <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Priority</label>
                            <div className="flex gap-2">
                              {["Low", "Medium", "High"].map(p => (
                                <button key={p} type="button" onClick={() => setTicket(t => ({ ...t, priority: p }))}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${ticket.priority === p
                                    ? p === "High" ? "bg-red-500/10 border-red-500/30 text-red-500"
                                      : p === "Medium" ? "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[var(--color-gold)]"
                                        : "bg-green-500/10 border-green-500/30 text-green-500"
                                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-gold)]/30"}`}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className={LABEL}>Describe Your Issue *</label>
                            <textarea required rows={4} value={ticket.message} onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                              placeholder="Describe your issue in detail..." className={INPUT + " resize-none"} />
                          </div>
                          {ticketError && <p className="text-sm text-red-500 flex items-center gap-2"><AlertCircle size={14} /> {ticketError}</p>}
                          <button type="submit" disabled={ticketLoading}
                            className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
                            {ticketLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            {ticketLoading ? "Submitting..." : "Submit Ticket"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="card p-6">
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Common Questions</h2>
                      <div className="space-y-2">
                        {FAQS.map((faq, i) => (
                          <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--color-bg-secondary)] transition-colors">
                              <p className="text-sm font-semibold text-[var(--color-text)] pr-3">{faq.q}</p>
                              {openFaq === i ? <ChevronUp size={16} className="text-[var(--color-gold)] shrink-0" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)] shrink-0" />}
                            </button>
                            <AnimatePresence>
                              {openFaq === i && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                  <p className="px-4 pb-4 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-3">{faq.a}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">Aur koi sawaal?</p>
                        <a href="https://wa.me/919942000413" target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text)] hover:text-[var(--color-gold)] transition-colors">
                          <MessageCircle size={13} style={{ color: "#25D366" }} /> WhatsApp: +91 9942000413
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="max-w-3xl space-y-4">
                  {orders.length > 1 && (
                    <div className="card p-4">
                      <label className={LABEL}>Select Order</label>
                      <select value={chatOrderId} onChange={e => { setChatOrderId(e.target.value); setChatMessages([]); }} className={INPUT}>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {orders.length === 0 ? (
                    <div className="card p-10 text-center text-[var(--color-text-muted)]">
                      <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No orders to chat about yet.</p>
                    </div>
                  ) : (
                    <div className="card overflow-hidden flex flex-col" style={{ height: "clamp(380px, 60vh, 560px)" }}>
                      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
                          <MessageSquare size={16} className="text-[var(--color-gold)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{wl.companyName} Team</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">Messages auto-refresh every 5 seconds</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {chatMessages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)]">
                            <MessageSquare size={28} className="mb-2 opacity-20" />
                            <p className="text-sm">No messages yet. Start the conversation!</p>
                          </div>
                        )}
                        {chatMessages.map(msg => {
                          const isClient = msg.senderType === "client";
                          return (
                            <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] ${isClient ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                <p className="text-[10px] text-[var(--color-text-muted)] px-1">{msg.senderName}</p>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm ${isClient
                                  ? "bg-[var(--color-gold)] text-white rounded-tr-sm"
                                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)] rounded-tl-sm"}`}>
                                  {msg.text}
                                  {msg.fileUrl && (
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                      className={`flex items-center gap-1.5 mt-2 text-xs underline ${isClient ? "text-white/80" : "text-[var(--color-gold)]"}`}>
                                      <Paperclip size={11} /> {msg.fileName || "Attachment"}
                                    </a>
                                  )}
                                </div>
                                <p className="text-[9px] text-[var(--color-text-muted)] px-1">
                                  {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatBottomRef} />
                      </div>

                      <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center gap-3">
                        <input
                          value={chatText}
                          onChange={e => setChatText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]"
                        />
                        <button onClick={sendChatMessage} disabled={chatSending || !chatText.trim()}
                          className="w-10 h-10 rounded-xl bg-[var(--color-gold)] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0">
                          {chatSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "files" && (
              <motion.div key="files" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="max-w-3xl space-y-5">
                  {orders.length > 1 && (
                    <div className="card p-4">
                      <label className={LABEL}>Select Order</label>
                      <select value={filesOrderId} onChange={e => { setFilesOrderId(e.target.value); setProjectFiles([]); }} className={INPUT}>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="card p-5">
                    <h3 className="font-display font-semibold text-[var(--color-text)] mb-1">Upload a file for your project</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mb-4">Share documents, images, or any reference files with the team.</p>
                    <div
                      onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                      onDragLeave={() => setFileDrag(false)}
                      onDrop={e => { e.preventDefault(); setFileDrag(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${fileDrag ? "border-[var(--color-gold)] bg-[var(--color-gold)]/5" : "border-[var(--color-border)] hover:border-[var(--color-gold)]/50"}`}
                      onClick={() => document.getElementById("file-upload-input")?.click()}>
                      <input id="file-upload-input" type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                      {fileUploading ? (
                        <Loader2 size={28} className="mx-auto mb-2 text-[var(--color-gold)] animate-spin" />
                      ) : (
                        <Upload size={28} className="mx-auto mb-2 text-[var(--color-text-muted)]" />
                      )}
                      <p className="text-sm font-semibold text-[var(--color-text)]">{fileUploading ? "Uploading..." : "Drop file here or click to browse"}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">Max 50MB · Any file type</p>
                    </div>
                  </div>

                  {/* Meeting Recording Upload */}
                  <div className="card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                        <Mic size={18} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-[var(--color-text)]">Upload Meeting Recording</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Get an AI-generated transcript of your meeting</p>
                      </div>
                    </div>

                    <input
                      ref={recordingInputRef}
                      type="file"
                      className="hidden"
                      accept="audio/webm,audio/mp4,audio/wav,audio/m4a,audio/mpeg,video/mp4"
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadMeetingRecording(f); }}
                    />

                    {recordingUploading ? (
                      <div className="space-y-3 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <div className="flex items-center gap-3">
                          <Loader2 size={18} className="animate-spin text-[var(--color-gold)] shrink-0" />
                          <p className="text-sm font-semibold text-[var(--color-text)]">Transcribing your recording...</p>
                        </div>
                        <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--color-gold)]/70 to-[var(--color-gold)] rounded-full transition-all duration-500"
                            style={{ width: `${recordingProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">{recordingProgress}% — This may take a minute for longer recordings.</p>
                      </div>
                    ) : !recordingTranscript ? (
                      <button
                        onClick={() => recordingInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-gold)]/60 rounded-xl p-6 text-center transition-all group"
                      >
                        <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-muted)] group-hover:text-[var(--color-gold)] transition-colors" />
                        <p className="text-sm font-semibold text-[var(--color-text)]">Click to upload recording</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">audio / video · max 25MB</p>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide flex items-center gap-1.5">
                            <FileText size={12} /> Transcript
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={downloadTranscript}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/20 transition-all"
                            >
                              <Download size={12} /> Download Transcript
                            </button>
                            <button
                              onClick={() => { setRecordingTranscript(""); setRecordingFile(null); setRecordingProgress(0); }}
                              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors px-2"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                        <textarea
                          readOnly
                          value={recordingTranscript}
                          rows={8}
                          className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text)] resize-none font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => { setRecordingTranscript(""); setRecordingFile(null); setRecordingProgress(0); recordingInputRef.current?.click(); }}
                          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                        >
                          <RefreshCw size={12} /> Upload another recording
                        </button>
                      </div>
                    )}

                    {recordingError && (
                      <p className="mt-3 text-xs text-red-500 flex items-center gap-2">
                        <AlertCircle size={13} /> {recordingError}
                      </p>
                    )}
                  </div>

                  <div className="card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
                      <h3 className="font-display font-semibold text-[var(--color-text)]">Project Files</h3>
                      <button onClick={() => fetchProjectFiles(filesOrderId)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1">
                        <RefreshCw size={12} className={filesLoading ? "animate-spin" : ""} /> Refresh
                      </button>
                    </div>
                    {filesLoading ? (
                      <div className="p-5 flex flex-col gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 py-1">
                            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                            <div className="flex-1 flex flex-col gap-1.5">
                              <Skeleton className="h-3.5 w-40" />
                              <Skeleton className="h-2.5 w-28" />
                            </div>
                            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : projectFiles.length === 0 ? (
                      <NoDataEmpty message="No files yet" />
                    ) : (
                      <div className="divide-y divide-[var(--color-border)]">
                        {projectFiles.map(f => {
                          const FileIcon = getFileIcon(f.mimeType, f.name);
                          return (
                            <div key={f.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--color-bg-secondary)] transition-colors">
                              <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                                <FileIcon size={18} className="text-[var(--color-gold)]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{f.name}</p>
                                <p className="text-[11px] text-[var(--color-text-muted)]">
                                  {f.uploaderName} · {formatFileSize(f.size)} · {new Date(f.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <a href={f.url} target="_blank" rel="noopener noreferrer" download={f.name}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all shrink-0">
                                <Download size={12} /> Download
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "approvals" && (
              <motion.div key="approvals" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="max-w-3xl space-y-5">
                  {orders.length > 1 && (
                    <div className="card p-4">
                      <label className={LABEL}>Select Order</label>
                      <select value={approvalsOrderId} onChange={e => { setApprovalsOrderId(e.target.value); setApprovals([]); }} className={INPUT}>
                        {orders.map(o => (
                          <option key={o.id} value={o.id}>#{o.orderNumber} — {o.product.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Design Approvals</h2>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Review and approve design submissions from the team</p>
                    </div>
                    <button onClick={() => fetchApprovals(approvalsOrderId)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1">
                      <RefreshCw size={12} className={approvalsLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>

                  {approvalsLoading ? (
                    <CardSkeleton lines={4} />
                  ) : approvals.length === 0 ? (
                    <div className="card overflow-hidden">
                      <NoDataEmpty message="No design approval requests yet" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {approvals.map(approval => (
                        <div key={approval.id} className="card p-5 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display font-semibold text-[var(--color-text)]">{approval.title}</h3>
                              {approval.description && (
                                <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{approval.description}</p>
                              )}
                            </div>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                              approval.status === "APPROVED" ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : approval.status === "REVISION_REQUESTED" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                              {approval.status === "APPROVED" ? "Approved"
                                : approval.status === "REVISION_REQUESTED" ? "Revision Requested"
                                  : "Pending Review"}
                            </span>
                          </div>

                          {approval.previewUrl && (
                            <div className="rounded-xl overflow-hidden border border-[var(--color-border)] max-h-64">
                              <img src={approval.previewUrl} alt={approval.title} className="w-full object-cover" />
                            </div>
                          )}

                          {approval.fileUrl && (
                            <a href={approval.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 text-xs text-[var(--color-gold)] hover:underline">
                              <Download size={12} /> Download design file
                            </a>
                          )}

                          {approval.status === "APPROVED" && approval.respondedAt && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle size={14} />
                              Approved on {new Date(approval.respondedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          )}

                          {approval.status === "REVISION_REQUESTED" && (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Your revision note:</p>
                              <p className="text-xs text-[var(--color-text-secondary)]">{approval.clientNote || "—"}</p>
                            </div>
                          )}

                          {approval.status === "PENDING" && (
                            <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
                              <div>
                                <label className={LABEL}>Add a note (optional)</label>
                                <textarea rows={2} value={approvalNotes[approval.id] || ""}
                                  onChange={e => setApprovalNotes(n => ({ ...n, [approval.id]: e.target.value }))}
                                  placeholder="Leave feedback or revision instructions..."
                                  className={INPUT + " resize-none"} />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => respondToApproval(approval.id, "APPROVED")}
                                  disabled={approvalSubmitting === approval.id}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-60">
                                  {approvalSubmitting === approval.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => respondToApproval(approval.id, "REVISION_REQUESTED")}
                                  disabled={approvalSubmitting === approval.id}
                                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all disabled:opacity-60">
                                  {approvalSubmitting === approval.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                  Request Revision
                                </button>
                              </div>
                            </div>
                          )}

                          <p className="text-[10px] text-[var(--color-text-muted)]">
                            Sent {new Date(approval.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div key="billing" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

                {/* ── Stripe Plans ── */}
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                      <Sparkles size={18} className="text-[var(--color-gold)]" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Available Plans</h2>
                      <p className="text-xs text-[var(--color-text-secondary)]">Subscribe or upgrade your Stripe billing plan</p>
                    </div>
                    {stripePlansLoading && <Loader2 size={16} className="animate-spin text-[var(--color-gold)] ml-auto" />}
                  </div>

                  {stripeNotConfigured ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <AlertCircle size={18} className="text-[var(--color-text-muted)] shrink-0" />
                      <p className="text-sm text-[var(--color-text-muted)]">Configure Stripe to enable subscriptions</p>
                    </div>
                  ) : !stripePlansLoading && stripePlans.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-muted)]">
                      <CreditCard size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No plans available yet</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stripePlans.map(plan => {
                        const currencySymbol = plan.currency === "inr" ? "₹" : "$";
                        const amountDisplay = (plan.amount / 100).toLocaleString("en-IN");
                        return (
                          <div key={plan.id} className="flex flex-col p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-gold)]/40 hover:shadow-[var(--shadow-card)] transition-all">
                            <div className="mb-3">
                              <h3 className="font-display font-bold text-[var(--color-text)] text-base">{plan.name}</h3>
                              {plan.description && (
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{plan.description}</p>
                              )}
                            </div>
                            <div className="mb-4">
                              <span className="font-display font-bold text-2xl text-[var(--color-gold)]">{currencySymbol}{amountDisplay}</span>
                              <span className="text-xs text-[var(--color-text-muted)] ml-1">/{plan.interval}</span>
                            </div>
                            {plan.features.length > 0 && (
                              <ul className="space-y-1.5 mb-4 flex-1">
                                {plan.features.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                                    <Check size={13} className="text-[var(--color-gold)] mt-0.5 shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <button
                              onClick={() => handleStripeCheckout(plan.id)}
                              disabled={stripeCheckoutLoading === plan.id}
                              className="btn-gold w-full py-2.5 flex items-center justify-center gap-2 text-sm mt-auto disabled:opacity-60"
                            >
                              {stripeCheckoutLoading === plan.id
                                ? <><Loader2 size={14} className="animate-spin" /> Processing...</>
                                : <><CreditCard size={14} /> Subscribe with Stripe</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Stripe Subscription Status ── */}
                {stripeSubscriptions.length > 0 && (
                  <div className="card p-6">
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-4">Stripe Subscriptions</h2>
                    <div className="space-y-3">
                      {stripeSubscriptions.map(sub => {
                        const matchedPlan = stripePlans.find(p => p.id === sub.stripePlanId);
                        const statusColors: Record<string, string> = {
                          active: "bg-green-500/10 text-green-500 border border-green-500/20",
                          trialing: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                          past_due: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
                          cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
                          canceled: "bg-red-500/10 text-red-500 border border-red-500/20",
                        };
                        return (
                          <div key={sub.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                                  <CreditCard size={18} className="text-[var(--color-gold)]" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[var(--color-text)]">
                                    {matchedPlan ? matchedPlan.name : "Stripe Plan"}
                                  </p>
                                  {sub.currentPeriodEnd && (
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                      Next billing: {new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                      {sub.cancelAtPeriodEnd && " · Cancels at period end"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[sub.status] || "bg-gray-500/10 text-gray-400 border border-gray-500/20"}`}>
                                {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                              </span>
                            </div>
                            {sub.status === "active" && stripePlans.length > 1 && (
                              <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                                <button
                                  onClick={() => setShowUpgradeModal(sub.stripeSubId)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/20 transition-all"
                                >
                                  <ArrowRight size={12} /> Upgrade / Downgrade
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upgrade Modal */}
                <AnimatePresence>
                  {showUpgradeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      onClick={() => setShowUpgradeModal(null)}>
                      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                        className="bg-[var(--color-bg)] rounded-2xl p-6 max-w-lg w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Change Plan</h3>
                          <button onClick={() => setShowUpgradeModal(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                            <X size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Select a new plan. Prorations will be applied automatically.</p>
                        <div className="space-y-2">
                          {stripePlans.map(plan => {
                            const currencySymbol = plan.currency === "inr" ? "₹" : "$";
                            const amountDisplay = (plan.amount / 100).toLocaleString("en-IN");
                            return (
                              <button key={plan.id} disabled={upgradeLoading}
                                onClick={() => handleStripeUpgrade(showUpgradeModal, plan.stripePriceId)}
                                className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/50 hover:bg-[var(--color-bg-secondary)] transition-all text-left disabled:opacity-60">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--color-text)]">{plan.name}</p>
                                  {plan.description && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{plan.description}</p>}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-[var(--color-gold)]">{currencySymbol}{amountDisplay}</p>
                                  <p className="text-[10px] text-[var(--color-text-muted)]">/{plan.interval}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {upgradeLoading && (
                          <div className="flex justify-center mt-4">
                            <Loader2 size={20} className="animate-spin text-[var(--color-gold)]" />
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Active Subscriptions</h2>
                    {subsLoading && <Loader2 size={16} className="animate-spin text-[var(--color-gold)]" />}
                  </div>
                  {subscriptions.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-muted)]">
                      <CreditCard size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No active subscriptions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map(sub => (
                        <div key={sub.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                                <CreditCard size={18} className="text-[var(--color-gold)]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[var(--color-text)]">{sub.planName}</p>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  ₹{sub.amount.toLocaleString("en-IN")} / {sub.billingCycle}
                                  {sub.nextBillingAt && ` · Next: ${new Date(sub.nextBillingAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sub.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border border-green-500/20" : sub.status === "PAUSED" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                              {sub.status}
                            </span>
                          </div>
                          {sub.status !== "CANCELLED" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                              {sub.status === "ACTIVE" && (
                                <button
                                  onClick={() => handleSubAction(sub.id, "pause")}
                                  disabled={subActing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all disabled:opacity-60"
                                >
                                  {subActing ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Pause
                                </button>
                              )}
                              {sub.status === "PAUSED" && (
                                <button
                                  onClick={() => handleSubAction(sub.id, "resume")}
                                  disabled={subActing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-60"
                                >
                                  {subActing ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Resume
                                </button>
                              )}
                              <button
                                onClick={() => setShowCancelConfirm(sub.id)}
                                disabled={subActing}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-60"
                              >
                                Cancel Subscription
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cancel confirmation modal */}
                <AnimatePresence>
                  {showCancelConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      onClick={() => setShowCancelConfirm(null)}>
                      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                        className="bg-[var(--color-bg)] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={e => e.stopPropagation()}>
                        <AlertCircle size={28} className="text-red-500 mb-3" />
                        <h3 className="font-display font-bold text-lg text-[var(--color-text)] mb-2">Cancel Subscription?</h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-5">
                          Are you sure? Your subscription will end immediately and you will lose access to all features.
                        </p>
                        <div className="flex gap-3">
                          <button onClick={() => setShowCancelConfirm(null)} className="btn-outline flex-1">Keep It</button>
                          <button
                            onClick={() => handleSubAction(showCancelConfirm, "cancel")}
                            disabled={subActing}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {subActing ? <Loader2 size={14} className="animate-spin" /> : null}
                            Yes, Cancel
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="card p-6">
                  <h2 className="font-display font-bold text-lg text-[var(--color-text)] mb-5">Order History</h2>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-[var(--color-gold)]" /></div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-muted)]">
                      <Package size={28} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div key={order.id} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                              <Package size={16} className="text-[var(--color-gold)]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">{order.product.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">#{order.orderNumber} · {new Date(order.statusHistory[0]?.changedAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-auto">
                            <span className="text-sm font-bold text-[var(--color-text)]">₹{order.amount.toLocaleString("en-IN")}</span>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              order.status === "DELIVERED" ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : order.status === "CANCELLED" ? "bg-red-500/10 text-red-500"
                                  : "bg-blue-500/10 text-blue-400"}`}>
                              {STATUS_LABEL[order.status] || order.status}
                            </span>
                            {order.status === "DELIVERED" && (
                              <a href={`/api/invoice?orderId=${order.id}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-gold)]/40 transition-all shrink-0">
                                <Download size={11} /> Invoice
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Affiliate Dashboard */}
                <div className="card p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center">
                        <Gift size={18} className="text-[var(--color-gold)]" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Affiliate Program</h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">Earn commissions by referring clients to KVL TECH</p>
                      </div>
                    </div>
                    <a href="/marketing-assets" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all shrink-0">
                      <Download size={13} /> Marketing Kit
                    </a>
                  </div>

                  {/* Affiliate Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Total Earnings", value: `₹${referralStats.totalEarned.toLocaleString("en-IN")}`, color: "#16A34A", sub: "PAID commissions" },
                      { label: "Pending Earnings", value: `₹${referralStats.pendingEarnings.toLocaleString("en-IN")}`, color: "#0891B2", sub: "Awaiting payment" },
                      { label: "Direct Referrals", value: String(referralStats.level1Count), color: "#C9A227", sub: "Level 1 (20%)" },
                      { label: "Indirect Referrals", value: String(referralStats.level2Count), color: "#7C3AED", sub: "Level 2 (10%)" },
                    ].map(({ label, value, color, sub }) => (
                      <div key={label} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-center">
                        <p className="font-display font-bold text-xl" style={{ color }}>{value}</p>
                        <p className="text-xs font-semibold text-[var(--color-text)] mt-1">{label}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Referral Link */}
                  <div className="p-4 rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5">
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Your Referral Link</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="flex-1 text-xs font-mono text-[var(--color-gold)] break-all min-w-0">
                        {referralLink || `https://kvlbusinesssolutions.com?ref=${user.id.slice(-8)}`}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(referralLink || `https://kvlbusinesssolutions.com?ref=${user.id.slice(-8)}`);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-gold)]/30 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all">
                          {linkCopied ? <Check size={13} /> : <ExternalLink size={13} />}
                          {linkCopied ? "Copied!" : "Copy Link"}
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`I recommend KVL TECH for professional websites! Get yours at ${referralLink || `https://kvlbusinesssolutions.com?ref=${user.id.slice(-8)}`}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all">
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Commission Structure */}
                  <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-xs font-semibold text-[var(--color-text)] mb-3">Commission Structure</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">L1</div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)]">20% Commission</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Direct referrals</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-500/20 bg-slate-500/5">
                        <div className="w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">L2</div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)]">10% Commission</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Indirect referrals</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]">
                        <div className="w-7 h-7 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                          <TrendingUp size={14} className="text-[var(--color-text-muted)]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)]">Min ₹500</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Minimum payout</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invite by email */}
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Invite by Email</p>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={referralEmail}
                        onChange={e => setReferralEmail(e.target.value)}
                        placeholder="Enter friend's email to invite"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] transition-all placeholder:text-[var(--color-text-muted)]"
                      />
                      <button onClick={sendReferral} disabled={referralSending || !referralEmail.trim()}
                        className="btn-gold px-5 flex items-center gap-2 disabled:opacity-60 shrink-0">
                        {referralSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        Invite
                      </button>
                    </div>
                    {referralMsg && (
                      <p className={`text-xs mt-2 ${referralMsg.includes("success") ? "text-green-500" : "text-red-500"}`}>{referralMsg}</p>
                    )}
                  </div>

                  {/* Referrals table */}
                  {referrals.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3">Referral History</p>
                      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                        <table className="w-full text-xs">
                          <thead className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                            <tr>
                              {["Referee", "Order Amount", "Level", "Commission", "Status", "Date"].map(h => (
                                <th key={h} className="text-left py-2.5 px-3 font-semibold text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap text-[10px]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {referrals.map(r => {
                              const isL1 = (r.level ?? 1) === 1;
                              return (
                                <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors">
                                  <td className="py-2.5 px-3 text-[var(--color-text-secondary)] truncate max-w-[140px]">{r.refereeEmail}</td>
                                  <td className="py-2.5 px-3 text-[var(--color-text)]">
                                    {r.orderAmount ? `₹${r.orderAmount.toLocaleString("en-IN")}` : "—"}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isL1 ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)]" : "bg-slate-500/15 text-slate-400"}`}>
                                      {isL1 ? "L1 · 20%" : "L2 · 10%"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-green-500">
                                    {r.commission > 0 ? `+₹${r.commission.toLocaleString("en-IN")}` : "—"}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      r.status === "PAID" ? "bg-green-500/10 text-green-500"
                                        : r.status === "CONVERTED" ? "bg-blue-500/10 text-blue-500"
                                          : r.status === "REJECTED" ? "bg-red-500/10 text-red-500"
                                            : "bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
                                      {r.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-[var(--color-text-muted)] whitespace-nowrap">
                                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </>
  );
}
