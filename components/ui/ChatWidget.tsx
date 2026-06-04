"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, MicOff, Phone, Volume2, VolumeX, ChevronDown, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
  quickReplies?: string[];
}

interface LeadInfo {
  name?: string;
  phone?: string;
  email?: string;
  interest?: string;
}

const INTEREST_QUICK_REPLIES_INR: Record<string, number[]> = {
  restaurant: [12999, 24999],
  school:     [29999, 59999],
  hospital:   [49999, 99999],
  ecommerce:  [15999, 39999],
  hotel:      [14999, 26999],
  realestate: [22999, 44999],
};

function now() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function detectInterest(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("restaurant") || t.includes("food") || t.includes("dhaba") || t.includes("café") || t.includes("cafe")) return "restaurant";
  if (t.includes("school") || t.includes("college") || t.includes("institute") || t.includes("escuela") || t.includes("école")) return "school";
  if (t.includes("hospital") || t.includes("clinic") || t.includes("doctor") || t.includes("hôpital")) return "hospital";
  if (t.includes("shop") || t.includes("ecommerce") || t.includes("store") || t.includes("tienda") || t.includes("boutique") || t.includes("магазин")) return "ecommerce";
  if (t.includes("hotel") || t.includes("resort") || t.includes("stay")) return "hotel";
  if (t.includes("real estate") || t.includes("property") || t.includes("inmueble") || t.includes("недвижимость")) return "realestate";
  return null;
}

export function ChatWidget() {
  const { t, formatPrice, language } = useLanguage();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [autoOpenDone, setAutoOpenDone] = useState(false);
  const [leadInfo, setLeadInfo] = useState<LeadInfo>({});
  const [leadCollected, setLeadCollected] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).slice(2, 10));
  const [messageCount, setMessageCount] = useState(0);
  const [isCollectingName, setIsCollectingName] = useState(false);
  const [isCollectingPhone, setIsCollectingPhone] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [exitOfferShown, setExitOfferShown] = useState(false);
  const [currentInterest, setCurrentInterest] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kaviya's greeting changes with selected language (Hinglish / Arabic / English)
  const GREETINGS: Record<string, { msg: string; qr: string[] }> = {
    en: {
      msg: "Hello! 🙏 I'm Kaviya, KVL TECH's business consultant. I'd love to help find the best digital solution for your business. What kind of business do you have?",
      qr: ["Restaurant website needed", "School management system", "Build an online store", "Tell me the price first"],
    },
    hi: {
      msg: "Adaab! 🙏 Main Kaviya hoon — KVL TECH ki aapki apni consultant. Aapke business ke liye dil se kaam karna chahti hoon. Batayein, kya khayal hai aapka? 😊",
      qr: ["Restaurant ki website chahiye", "School management system", "Online store banana hai", "Pehle price batao"],
    },
    ar: {
      msg: "أهلاً! 🙏 أنا كافيا، مستشارة KVL TECH. أود مساعدتك في إيجاد أفضل حل رقمي لعملك. ما نوع عملك؟",
      qr: ["أحتاج موقع مطعم", "نظام إدارة مدرسة", "إنشاء متجر إلكتروني", "أخبرني بالأسعار أولاً"],
    },
    ru: {
      msg: "Здравствуйте! 🙏 Я Kaviya, консультант KVL TECH. Рада помочь вам найти лучшее цифровое решение. Какой у вас бизнес?",
      qr: ["Нужен сайт ресторана", "Система управления школой", "Создать интернет-магазин", "Сначала скажите цену"],
    },
    de: {
      msg: "Hallo! 🙏 Ich bin Kaviya, KVL TECH Beraterin. Ich helfe Ihnen gerne, die beste digitale Lösung zu finden. Was für ein Unternehmen haben Sie?",
      qr: ["Restaurant-Website benötigt", "Schulverwaltungssystem", "Online-Shop erstellen", "Erst Preise nennen"],
    },
  };

  useEffect(() => {
    const g = GREETINGS[language.code] || GREETINGS.en;
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{ role: "assistant", content: g.msg, time: now(), quickReplies: g.qr }];
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language.code]);

  // Kaviya badge cycle: show → 30s → hide → 60s → show → repeat until user responds
  useEffect(() => {
    if (messageCount > 0 || open) {
      setShowBadge(false);
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout>;
    let reshowTimer: ReturnType<typeof setTimeout>;

    const startCycle = () => {
      setShowBadge(true);
      hideTimer = setTimeout(() => {
        setShowBadge(false);
        reshowTimer = setTimeout(startCycle, 60000); // 1 minute baad phir aaye
      }, 30000); // 30 second me hat jaye
    };

    const initialTimer = setTimeout(startCycle, 4000); // page load ke 4s baad pehli baar

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimer);
      clearTimeout(reshowTimer);
    };
  }, [messageCount, open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 300); }, [open, minimized]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (!open) return;
    inactivityTimerRef.current = setTimeout(() => {
      if (!loading) {
        const followUps = [t.chat_proactive_1, t.chat_proactive_2, t.chat_proactive_3];
        setMessages(prev => [...prev, { role: "assistant", content: followUps[Math.floor(Math.random() * followUps.length)], time: now() }]);
      }
    }, 30000);
  }, [open, loading, t]);

  useEffect(() => {
    resetInactivityTimer();
    return () => { if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current); };
  }, [messages, open, resetInactivityTimer]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.code === "hi" ? "hi-IN" : language.code === "ar" ? "ar-SA" : language.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    const voices = synth.getVoices();
    const langVoice = voices.find(v => v.lang.startsWith(language.code) && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith(language.code))
      || voices.find(v => v.name.toLowerCase().includes("female"));
    if (langVoice) utterance.voice = langVoice;
    synth.speak(utterance);
  }, [voiceEnabled, language.code]);

  const getInterestQR = useCallback((interest: string): string[] => {
    const prices = INTEREST_QUICK_REPLIES_INR[interest];
    if (!prices) return [];
    return [`${t.product_basic}: ${formatPrice(prices[0])}`, `${t.product_premium}: ${formatPrice(prices[1])}`, t.chat_static_demo];
  }, [t, formatPrice]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    resetInactivityTimer();

    const userMsg: Message = { role: "user", content: text, time: now() };
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    const detected = detectInterest(text);
    if (detected) setCurrentInterest(detected);

    if (isCollectingName) {
      setIsCollectingName(false);
      const updatedLead = { ...leadInfo, name: text.trim() };
      setLeadInfo(updatedLead);
      setMessages(prev => [...prev, userMsg, {
        role: "assistant",
        content: t.chat_name_response.replace("{name}", text.trim()),
        time: now(),
      }]);
      setIsCollectingPhone(true);
      return;
    }

    if (isCollectingPhone) {
      const phoneRegex = /[6-9]\d{9}/;
      const phoneMatch = text.match(phoneRegex);
      if (phoneMatch) {
        setIsCollectingPhone(false);
        const updatedLead = { ...leadInfo, phone: phoneMatch[0] };
        setLeadInfo(updatedLead);
        setLeadCollected(true);
        setShowWhatsApp(true);
        setMessages(prev => [...prev, userMsg, {
          role: "assistant",
          content: t.chat_phone_thanks,
          time: now(),
          quickReplies: [t.chat_qr_wa, t.chat_qr_more],
        }]);
        try {
          await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: "lead collected" }], sessionId, leadInfo: updatedLead }),
          });
        } catch { /* silent */ }
        return;
      } else {
        setMessages(prev => [...prev, userMsg, { role: "assistant", content: t.chat_phone_bad, time: now() }]);
        return;
      }
    }

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Last 6 messages as history (excluding the new userMsg already being sent)
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, sessionId, leadInfo: leadInfo.phone ? leadInfo : undefined }),
      });
      const data = await res.json() as { reply: string; content?: string; fallback?: boolean };
      const aiText = data.reply || data.content || t.error_try_again;

      let qr: string[] | undefined;
      const detectedNow = detected || currentInterest;
      if (detectedNow) qr = getInterestQR(detectedNow);

      const aiMsg: Message = { role: "assistant", content: aiText, time: now(), quickReplies: qr };
      setMessages(prev => [...prev, aiMsg]);
      speak(aiText);

      if (newCount === 3 && !leadInfo.name && !isCollectingName) {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: t.chat_ask_name, time: now() }]);
          setIsCollectingName(true);
        }, 1500);
      }

      if (newCount >= 5 && !leadInfo.phone && !isCollectingPhone && !isCollectingName && (detected || currentInterest)) {
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: t.chat_phone_ask, time: now() }]);
          setIsCollectingPhone(true);
        }, 1500);
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t.chat_network_error, time: now() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, speak, messageCount, sessionId, leadInfo, isCollectingName, isCollectingPhone, currentInterest, resetInactivityTimer, t, getInterestQR]);

  const handleClose = useCallback(() => {
    if (!exitOfferShown && messageCount >= 2) {
      setExitOfferShown(true);
      setMessages(prev => [...prev, { role: "assistant", content: t.chat_exit_offer, time: now(), quickReplies: [t.chat_qr_price, t.chat_qr_more] }]);
      return;
    }
    setOpen(false);
  }, [exitOfferShown, messageCount, t]);

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
      recognition.onresult = (e: any) => { const transcript = e.results[0][0].transcript; setInput(transcript); setListening(false); sendMessage(transcript); };
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

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* Floating launcher */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
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
              <p className="text-xs text-[var(--color-text-secondary)]">{t.chat_preview}</p>
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
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[390px] flex flex-col rounded-2xl overflow-hidden border border-[var(--color-border)]"
            style={{ maxHeight: minimized ? "64px" : "calc(100dvh - 5rem - 6rem)", boxShadow: "0 24px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(201,162,39,0.15)" }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 shrink-0 cursor-pointer select-none"
              style={{ background: "linear-gradient(135deg, #0A1628, #1E293B)" }}
              onClick={() => setMinimized(!minimized)}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold)] flex items-center justify-center text-white font-bold text-sm font-display shadow-[var(--shadow-gold)]">K</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0A1628]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-5 w-auto object-contain mr-2" />
                  <p className="font-display font-semibold text-white text-sm">Kaviya</p>
                  <Sparkles size={12} className="text-[var(--color-gold)]" />
                </div>
                <p className="text-[11px] text-white/60">KVL TECH Consultant • <span className="text-green-400 font-medium">Online</span></p>
              </div>
              <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" title={voiceEnabled ? "Mute" : "Unmute"}>
                  {voiceEnabled ? <Volume2 size={14} className="text-white/70" /> : <VolumeX size={14} className="text-white/40" />}
                </button>
                <a href="tel:+919942000413" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Phone size={14} className="text-white/70" />
                </a>
                <button onClick={() => setMinimized(!minimized)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ChevronDown size={16} className="text-white/70 transition-transform duration-300" style={{ transform: minimized ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                <button onClick={handleClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X size={14} className="text-white/70" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--color-bg)] min-h-0">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        {msg.role === "assistant" && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1E293B] flex items-center justify-center text-[var(--color-gold)] text-[10px] font-bold shrink-0 mt-0.5 border border-[var(--color-gold)]/30">K</div>
                        )}
                        <div className={`flex flex-col gap-0.5 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "text-white rounded-tr-sm" : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-tl-sm border border-[var(--color-border)]"}`}
                            style={msg.role === "user" ? { background: "linear-gradient(135deg, #C9A227, #E8C547)" } : {}}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-[var(--color-text-muted)] px-1">{msg.time}</span>
                        </div>
                      </div>
                      {msg.role === "assistant" && msg.quickReplies && msg.quickReplies.length > 0 && i === messages.length - 1 && (
                        <div className="ml-9 mt-2 flex flex-wrap gap-1.5">
                          {msg.quickReplies.map(qr => (
                            <button key={qr} onClick={() => sendMessage(qr)} disabled={loading}
                              className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--color-gold)]/50 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all whitespace-nowrap disabled:opacity-40">
                              {qr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0A1628] to-[#1E293B] flex items-center justify-center text-[var(--color-gold)] text-[10px] font-bold shrink-0 border border-[var(--color-gold)]/30">K</div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center gap-1.5">
                        <span className="text-[10px] text-[var(--color-text-muted)] mr-1">{t.chat_typing}</span>
                        {[0, 1, 2].map(dot => (
                          <span key={dot} className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]"
                            style={{ animation: "typingDot 1.4s ease-in-out infinite", animationDelay: `${dot * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* WhatsApp CTA */}
                {showWhatsApp && (
                  <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                    <a href={`https://wa.me/919942000413?text=${encodeURIComponent(t.wa_message)}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      {t.chat_wa_btn}
                    </a>
                  </div>
                )}

                {/* Static quick replies */}
                {(() => {
                  const lastMsg = messages[messages.length - 1];
                  if (lastMsg?.role === "assistant" && lastMsg.quickReplies?.length) return null;
                  return (
                    <div className="px-3 py-2 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-2 overflow-x-auto scrollbar-hide">
                      {[t.chat_static_price, t.chat_static_demo, t.chat_static_call].map(qr => (
                        <button key={qr} onClick={() => sendMessage(qr)} disabled={loading}
                          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all whitespace-nowrap disabled:opacity-40">
                          {qr}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* Input row */}
                <div className="px-3 py-3 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex items-center gap-2">
                  <button onClick={toggleVoiceInput}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${listening ? "bg-red-500 text-white animate-pulse" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"}`}>
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={isCollectingName ? t.chat_placeholder_name : isCollectingPhone ? t.chat_placeholder_phone : listening ? t.chat_placeholder_voice : t.chat_placeholder}
                    disabled={loading || listening}
                    className="flex-1 px-3 py-2 rounded-xl text-sm border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-gold)] transition-all"
                  />
                  <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                    style={{ background: input.trim() ? "linear-gradient(135deg, #C9A227, #E8C547)" : "var(--color-bg-secondary)" }}>
                    <Send size={15} className={input.trim() ? "text-white" : "text-[var(--color-text-muted)]"} />
                  </button>
                </div>

                {/* Footer */}
                <div className="text-center py-1.5 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
                  <p className="text-[10px] text-[var(--color-text-muted)]">Powered by <span className="font-semibold text-[var(--color-gold)]">KVL TECH AI</span></p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
