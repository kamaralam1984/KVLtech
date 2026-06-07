"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mic,
  MicOff,
  Phone,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  User,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number; // epoch ms
  quickReplies?: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function now() {
  return Date.now();
}

const MAX_CHARS = 500;
const SESSION_KEY = "kaviya_chat";
const SESSION_NAME_KEY = "kaviya_name";

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatWidget() {
  const { t, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [nameAsked, setNameAsked] = useState(false);
  const [awaitingName, setAwaitingName] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Session persistence (TASK 4) ──────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (parsed.length > 0) {
          setMessages(parsed);
          setMessageCount(parsed.filter(m => m.role === "user").length);
        }
      }
      const savedName = sessionStorage.getItem(SESSION_NAME_KEY);
      if (savedName) {
        setSessionName(savedName);
        setNameAsked(true);
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-20)));
    } catch { /* silent */ }
  }, [messages]);

  // ── Initial greeting ───────────────────────────────────────────────────────
  useEffect(() => {
    setMessages(prev => {
      if (prev.length > 0) return prev;
      const greeting = t.chat_initial_msg || "Hello! 👋 I'm Kaviya, KVL TECH's AI assistant. How can I help you today?";
      return [
        {
          role: "assistant",
          content: greeting,
          timestamp: now(),
          quickReplies: [
            t.chat_qr_restaurant || "Website Development",
            t.chat_qr_school || "Mobile App",
            t.chat_qr_store || "Software / SaaS",
            t.chat_qr_price || "Pricing",
          ],
        },
      ];
    });
  }, [t]);

  // ── Badge cycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (messageCount > 0 || open) { setShowBadge(false); return; }
    let hideTimer: ReturnType<typeof setTimeout>;
    let reshowTimer: ReturnType<typeof setTimeout>;
    const startCycle = () => {
      setShowBadge(true);
      hideTimer = setTimeout(() => {
        setShowBadge(false);
        reshowTimer = setTimeout(startCycle, 60000);
      }, 30000);
    };
    const initial = setTimeout(startCycle, 4000);
    return () => { clearTimeout(initial); clearTimeout(hideTimer); clearTimeout(reshowTimer); };
  }, [messageCount, open]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (open && !minimized) setTimeout(() => textareaRef.current?.focus(), 300);
  }, [open, minimized]);

  // ── Inactivity follow-up ──────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (!open) return;
    inactivityTimerRef.current = setTimeout(() => {
      if (!loading) {
        const followUps = [
          t.chat_proactive_1 || "Still there? I can help you find the perfect solution for your business! 😊",
          t.chat_proactive_2 || "Feel free to ask me anything about our services or pricing.",
          t.chat_proactive_3 || "Need help? Our team is ready — just ask!",
        ];
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: followUps[Math.floor(Math.random() * followUps.length)], timestamp: now() },
        ]);
      }
    }, 30000);
  }, [open, loading, t]);

  useEffect(() => {
    resetInactivityTimer();
    return () => { if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current); };
  }, [messages, open, resetInactivityTimer]);

  // ── Text-to-speech ────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.code === "hi" ? "hi-IN" : language.code === "ar" ? "ar-SA" : language.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    const voices = synth.getVoices();
    const langVoice =
      voices.find(v => v.lang.startsWith(language.code) && v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.lang.startsWith(language.code)) ||
      voices.find(v => v.name.toLowerCase().includes("female"));
    if (langVoice) utterance.voice = langVoice;
    synth.speak(utterance);
  }, [voiceEnabled, language.code]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    resetInactivityTimer();

    const userMsg: Message = { role: "user", content: trimmed, timestamp: now() };
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    // Name capture flow
    if (awaitingName) {
      setAwaitingName(false);
      const name = trimmed;
      setSessionName(name);
      try { sessionStorage.setItem(SESSION_NAME_KEY, name); } catch { /* silent */ }
      setMessages(prev => [
        ...prev,
        userMsg,
        {
          role: "assistant",
          content: `Nice to meet you, ${name}! 😊 How can I help you today?`,
          timestamp: now(),
          quickReplies: ["Website Development", "Mobile App", "Pricing Plans", "Contact Team"],
        },
      ]);
      return;
    }

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          sessionId: typeof window !== "undefined" ? sessionStorage.getItem("kaviya_sid") || Math.random().toString(36).slice(2, 10) : undefined,
          sessionName: sessionName || undefined,
          lang: language.code,
        }),
      });

      const data = await res.json() as {
        message?: string;
        reply?: string;
        quickReplies?: string[];
        intent?: string;
        leadCaptured?: boolean;
      };

      const aiText = data.message || data.reply || (t.error_try_again || "Sorry, I couldn't process that. Please try again.");
      const quickReplies = data.quickReplies || [];

      const aiMsg: Message = { role: "assistant", content: aiText, timestamp: now(), quickReplies };
      setMessages(prev => [...prev, aiMsg]);
      speak(aiText);

      // Ask name after 2nd message if not yet collected
      if (newCount === 2 && !sessionName && !nameAsked) {
        setNameAsked(true);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              role: "assistant",
              content: "May I know your name? It'll help me assist you better. 😊",
              timestamp: now(),
            },
          ]);
          setAwaitingName(true);
        }, 1000);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: t.chat_network_error || "Sorry, I'm having trouble connecting. Please try again or WhatsApp us at +91 9942000413.",
          timestamp: now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, speak, messageCount, sessionName, nameAsked, awaitingName, resetInactivityTimer, t, language.code]);

  // ── Escalation ────────────────────────────────────────────────────────────
  const handleEscalate = useCallback(async () => {
    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
    try {
      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sessionName || undefined,
          message: "Visitor requested human agent via chat button",
          conversationHistory: history,
        }),
      });
    } catch { /* silent */ }
    window.open(`https://wa.me/919942000413?text=${encodeURIComponent("Hi, I need to speak with a KVL TECH team member.")}`, "_blank");
  }, [messages, sessionName]);

  // ── Close handler ─────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (messageCount >= 2) {
      const exitOffer = t.chat_exit_offer || "Wait! Before you go — can I help you with pricing or a free demo? 🙏";
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.content === exitOffer) { setOpen(false); return prev; }
        return [
          ...prev,
          {
            role: "assistant",
            content: exitOffer,
            timestamp: now(),
            quickReplies: [t.chat_qr_price || "Pricing", t.chat_qr_more || "Learn more"],
          },
        ];
      });
    } else {
      setOpen(false);
    }
  }, [messageCount, t]);

  // ── Voice input ───────────────────────────────────────────────────────────
  const toggleVoiceInput = useCallback(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
      const recognition = new SR();
      recognition.lang = language.code === "hi" ? "hi-IN" : language.code;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
        sendMessage(transcript);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognition.start();
      recognitionRef.current = recognition;
      return;
    }
    if (listening) { mediaRecorderRef.current?.stop(); setListening(false); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        if (audioBlob.size < 1000) return;
        try {
          const fd = new FormData();
          fd.append("audio", audioBlob, "audio.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const { transcript: deepgramText } = await res.json();
          if (deepgramText) { setInput(deepgramText); sendMessage(deepgramText); }
        } catch { /* silent */ }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setListening(true);
    }).catch(() => alert("Microphone access denied."));
  }, [listening, sendMessage, language.code]);

  // ── Keyboard handler (Shift+Enter = newline, Enter = send) ────────────────
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating launcher */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        <AnimatePresence>
          {showBadge && !open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="glass-card px-4 py-3 max-w-[220px] shadow-[var(--shadow-luxury)] cursor-pointer"
              onClick={() => { setOpen(true); setShowBadge(false); }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-[var(--color-navy)] flex items-center justify-center">
                  <img src="/kvl-tech-logo-white.png" alt="KVL" className="w-5 h-5 object-contain" />
                </div>
                <span className="text-xs font-semibold text-[var(--color-text)]">Kaviya — KVL TECH</span>
                <div className="live-dot ml-auto" />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">{t.chat_preview || "Hi! How can I help you today?"}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { setOpen(!open); setShowBadge(false); }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full shadow-[var(--shadow-gold)] flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A227, #E8C547)" }}
          aria-label="Chat with Kaviya"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={22} className="text-white" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <img src="/kvl-tech-logo-white.png" alt="KVL" className="h-7 w-auto object-contain" />
              </motion.div>
            )}
          </AnimatePresence>
          {!open && <span className="absolute inset-0 rounded-full border-2 border-[var(--color-gold)] animate-ping opacity-40" />}
          {!open && messageCount === 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">1</span>
          )}
        </motion.button>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 left-6 z-50 w-[360px] sm:w-[390px] flex flex-col rounded-2xl overflow-hidden border border-[var(--color-border)]"
            style={{
              maxHeight: minimized ? "64px" : "calc(100dvh - 5rem - 6rem)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(201,162,39,0.15)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0 cursor-pointer select-none"
              style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}
              onClick={() => setMinimized(!minimized)}
            >
              {/* Avatar with online dot */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white font-bold text-base font-display shadow-[var(--shadow-gold)]">
                  K
                </div>
                {/* Green online dot */}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A1628]" />
              </div>

              {/* Name + subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-display font-semibold text-white text-sm">Kaviya</p>
                  <Sparkles size={12} className="text-[var(--color-gold)]" />
                </div>
                <p className="text-[11px] text-white/60">
                  KVL TECH AI &middot; <span className="text-green-400 font-medium">Online</span>
                </p>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  title={voiceEnabled ? "Mute" : "Unmute"}
                >
                  {voiceEnabled ? <Volume2 size={14} className="text-white/70" /> : <VolumeX size={14} className="text-white/40" />}
                </button>
                <a href="tel:+919942000413" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Phone size={14} className="text-white/70" />
                </a>
                {/* Minimize button */}
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  title={minimized ? "Expand" : "Minimize"}
                >
                  <ChevronDown
                    size={16}
                    className="text-white/70 transition-transform duration-300"
                    style={{ transform: minimized ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X size={14} className="text-white/70" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* ── Messages ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg)] min-h-0">
                  {messages.map((msg, i) => {
                    const isLast = i === messages.length - 1;
                    return (
                      <div key={i}>
                        <div className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                          {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1E293B] flex items-center justify-center text-[var(--color-gold)] text-[10px] font-bold shrink-0 mt-0.5 border border-[var(--color-gold)]/30">
                              K
                            </div>
                          )}
                          <div className={`flex flex-col gap-0.5 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === "user"
                                  ? "text-white rounded-tr-sm"
                                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-tl-sm border border-[var(--color-border)]"
                              }`}
                              style={msg.role === "user" ? { background: "linear-gradient(135deg, #C9A227, #E8C547)" } : {}}
                            >
                              {msg.content}
                            </div>
                            {/* Timestamp */}
                            <span className="text-[10px] text-[var(--color-text-muted)] px-1">
                              {timeAgo(msg.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Quick replies (only on last assistant message) */}
                        {msg.role === "assistant" && msg.quickReplies && msg.quickReplies.length > 0 && isLast && (
                          <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                            {msg.quickReplies.map(qr => (
                              <button
                                key={qr}
                                onClick={() => sendMessage(qr)}
                                disabled={loading}
                                className="px-3 py-1 text-xs rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-colors disabled:opacity-40 whitespace-nowrap"
                              >
                                {qr}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {loading && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1E293B] flex items-center justify-center text-[var(--color-gold)] text-[10px] font-bold shrink-0 border border-[var(--color-gold)]/30">
                        K
                      </div>
                      <div className="flex gap-1 items-center p-3 bg-[var(--color-bg-secondary)] rounded-2xl rounded-tl-sm border border-[var(--color-border)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* ── Static quick replies (when last msg has none) ── */}
                {(() => {
                  const lastMsg = messages[messages.length - 1];
                  if (lastMsg?.role === "assistant" && lastMsg.quickReplies?.length) return null;
                  return (
                    <div className="px-3 py-2 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-2 overflow-x-auto scrollbar-hide">
                      {[
                        t.chat_static_price || "Pricing",
                        t.chat_static_demo || "Free Demo",
                        t.chat_static_call || "Call Us",
                      ].map(qr => (
                        <button
                          key={qr}
                          onClick={() => sendMessage(qr)}
                          disabled={loading}
                          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all whitespace-nowrap disabled:opacity-40"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* ── Input area ── */}
                <div className="px-3 pt-2 pb-1 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
                  <div className="flex items-end gap-2">
                    {/* Voice input button */}
                    <button
                      onClick={toggleVoiceInput}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all mb-1 ${
                        listening
                          ? "bg-red-500 text-white animate-pulse"
                          : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                      }`}
                    >
                      {listening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    {/* Textarea (Shift+Enter = newline, Enter = send) */}
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                        onKeyDown={handleKey}
                        placeholder={
                          awaitingName
                            ? "Type your name..."
                            : listening
                            ? (t.chat_placeholder_voice || "Listening...")
                            : (t.chat_placeholder || "Ask me anything...")
                        }
                        disabled={loading || listening}
                        rows={1}
                        className="w-full px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-gold)] transition-all resize-none leading-5"
                        style={{ minHeight: "36px", maxHeight: "96px" }}
                        onInput={e => {
                          const el = e.currentTarget;
                          el.style.height = "auto";
                          el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
                        }}
                      />
                      {/* Character counter */}
                      {input.length > 400 && (
                        <span className="absolute right-2 bottom-1.5 text-[9px] text-[var(--color-text-muted)]">
                          {MAX_CHARS - input.length}
                        </span>
                      )}
                    </div>

                    {/* Send button */}
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 mb-1"
                      style={{ background: input.trim() ? "linear-gradient(135deg, #C9A227, #E8C547)" : "var(--color-bg-secondary)" }}
                    >
                      <Send size={15} className={input.trim() ? "text-white" : "text-[var(--color-text-muted)]"} />
                    </button>
                  </div>

                  {/* ── Footer row: Talk to human + powered by ── */}
                  <div className="flex items-center justify-between py-1.5 mt-0.5">
                    <button
                      onClick={handleEscalate}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gold)] flex items-center gap-1 transition-colors"
                    >
                      <User size={12} /> Talk to a human
                    </button>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Powered by <span className="font-semibold text-[var(--color-gold)]">KVL TECH AI</span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
