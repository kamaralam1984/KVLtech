'use client';
import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const BANNER_H = 40;

export function UrgencyBanner() {
  const { t } = useLanguage();
  const [show, setShow] = useState(true);
  const [slots, setSlots] = useState(3);

  useEffect(() => {
    document.documentElement.style.setProperty('--banner-h', show ? `${BANNER_H}px` : '0px');
    return () => document.documentElement.style.setProperty('--banner-h', '0px');
  }, [show]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSlots(Math.floor(Math.random() * 2) + 2);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -BANNER_H }}
          animate={{ y: 0 }}
          exit={{ y: -BANNER_H }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center px-4 text-white text-sm"
          style={{
            height: BANNER_H,
            background: 'rgba(10, 16, 38, 0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
          }}
        >
          <Zap size={14} className="text-amber-400 mr-2 flex-shrink-0" />
          <span>
            🔥 {t.banner_pre}{' '}
            <strong className="text-amber-400">{slots} {t.banner_unit}</strong>{' '}
            {t.banner_mid}{' '}
            <strong className="text-amber-400">{t.banner_offer}</strong> —{' '}
            <a href="/products" className="underline text-amber-300 ml-1">{t.banner_cta}</a>
          </span>
          <button onClick={() => setShow(false)} className="ml-4 text-gray-400 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
