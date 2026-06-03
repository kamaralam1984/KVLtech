'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock } from 'lucide-react';

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minute countdown

  useEffect(() => {
    if (typeof window === 'undefined' || dismissed) return;

    // Check if shown in last 24 hours
    const lastShown = localStorage.getItem('exitPopupShown');
    if (lastShown && Date.now() - parseInt(lastShown) < 86400000) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !show && !dismissed) {
        setShow(true);
        localStorage.setItem('exitPopupShown', Date.now().toString());
      }
    };

    // Also show after 45 seconds if user hasn't seen it
    const timer = setTimeout(() => {
      if (!show && !dismissed) {
        setShow(true);
        localStorage.setItem('exitPopupShown', Date.now().toString());
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [show, dismissed]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [show]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await fetch('/api/marketing/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'welcome', to: email, name: 'Visitor', service: 'General Inquiry' }),
    });
    setSubmitted(true);
    setTimeout(() => { setShow(false); setDismissed(true); }, 3000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) { setShow(false); setDismissed(true); } }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => { setShow(false); setDismissed(true); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #1a2035, #2d3a5f)' }} className="p-8 text-center">
              <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="h-8 w-auto object-contain mx-auto mb-3" />
              <div className="text-5xl mb-3">🎁</div>
              <h2 className="text-2xl font-bold text-white mb-1">Ruko! Ek Special Offer Hai!</h2>
              <p className="text-gray-300 text-sm">Sirf aaj ke liye — exclusive discount</p>
            </div>

            {/* Countdown */}
            <div style={{ background: '#d4a017' }} className="py-2 text-center">
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <Clock size={16} /> Offer expires in: <span className="font-mono text-lg">{formatTime(countdown)}</span>
              </p>
            </div>

            {/* Body */}
            <div className="p-8">
              {!submitted ? (
                <>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
                    <p className="font-bold text-gray-800 text-lg">🔥 FREE Domain + Hosting (1 Year)</p>
                    <p className="text-gray-600 text-sm">Kisi bhi Premium Plan ke saath — aaj order karo!</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">Value: ₹5,999 — BILKUL FREE!</p>
                  </div>

                  <p className="text-gray-600 mb-4 text-sm">Apna email dein, hum aapko exclusive offer bhejenge:</p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Aapka email address"
                      required
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      style={{ background: 'linear-gradient(135deg, #d4a017, #b8860b)' }}
                      className="w-full text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <Zap size={20} /> Haan! Free Offer Chahiye!
                    </button>
                  </form>

                  <button
                    onClick={() => { setShow(false); setDismissed(true); }}
                    className="w-full text-center text-gray-400 text-xs mt-3 hover:text-gray-600"
                  >
                    Nahi chahiye, miss karna hai mujhe
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Shukriya!</h3>
                  <p className="text-gray-600">Offer details aapke email pe bhej diye hain. Jaldi check karein!</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
