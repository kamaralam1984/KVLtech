'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NOTIFICATIONS = [
  { name: 'Ramesh Kumar', city: 'Delhi', product: 'Restaurant Website', timeNum: 2 },
  { name: 'Priya Sharma', city: 'Mumbai', product: 'E-commerce Platform', timeNum: 5 },
  { name: 'Dr. Anil Verma', city: 'Bangalore', product: 'Hospital Management System', timeNum: 8 },
  { name: 'Sunita Patel', city: 'Ahmedabad', product: 'School Management System', timeNum: 12 },
  { name: 'Rohit Mehta', city: 'Pune', product: 'Hotel Booking Website', timeNum: 15 },
  { name: 'Kavita Singh', city: 'Jaipur', product: 'Real Estate Website', timeNum: 3 },
  { name: 'Vikram Gupta', city: 'Hyderabad', product: 'Restaurant Website', timeNum: 7 },
  { name: 'Neha Agarwal', city: 'Chennai', product: 'E-commerce Platform', timeNum: 20 },
  { name: 'Suresh Reddy', city: 'Kolkata', product: 'Hospital Management System', timeNum: 25 },
  { name: 'Meera Joshi', city: 'Lucknow', product: 'School Management System', timeNum: 30 },
];

export function SocialProofToast() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(NOTIFICATIONS[0]);

  useEffect(() => {
    let notifIndex = 0;

    const firstTimer = setTimeout(() => {
      setCurrent(NOTIFICATIONS[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 15000);

    const interval = setInterval(() => {
      notifIndex = (notifIndex + 1) % NOTIFICATIONS.length;
      setCurrent(NOTIFICATIONS[notifIndex]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 35000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, []);

  // German word order: "vor X min" (ago comes first)
  const timeText = t.toast_ago.startsWith('vor')
    ? `${t.toast_ago} ${current.timeNum} ${t.toast_min}`
    : `${current.timeNum} ${t.toast_min} ${t.toast_ago}`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 max-w-xs"
        >
          <div className="bg-white dark:bg-[var(--color-bg-secondary)] rounded-xl shadow-2xl border border-gray-100 dark:border-[var(--color-border)] p-4 flex items-center gap-3">
            <div
              style={{ background: 'linear-gradient(135deg, #1a2035, #2d3a5f)' }}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden p-1"
            >
              <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-[var(--color-text-muted)]">{t.toast_just_bought}</p>
              <p className="text-sm font-bold text-gray-800 dark:text-[var(--color-text)]">{current.name}, {current.city}</p>
              <p className="text-xs text-amber-600 font-medium">{current.product}</p>
              <p className="text-xs text-gray-400 dark:text-[var(--color-text-muted)]">{timeText}</p>
            </div>
            <div className="flex-shrink-0">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
