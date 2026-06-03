'use client';
import { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UrgencyBanner() {
  const [show, setShow] = useState(true);
  const [slots, setSlots] = useState(3);

  useEffect(() => {
    // Simulate real-time slot reduction
    const timer = setTimeout(() => {
      setSlots(Math.floor(Math.random() * 2) + 2); // 2-3 slots
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -60 }}
          animate={{ y: 0 }}
          exit={{ y: -60 }}
          style={{ background: 'linear-gradient(135deg, #1a2035, #2d3a5f)' }}
          className="fixed top-0 left-0 right-0 z-[100] py-2 px-4 flex items-center justify-center text-white text-sm"
        >
          <Zap size={14} className="text-amber-400 mr-2 flex-shrink-0" />
          <span>
            🔥 Is hafte sirf <strong className="text-amber-400">{slots} slots</strong> bacha hai!{' '}
            Premium Plan ke saath <strong className="text-amber-400">FREE Domain + Hosting</strong> pao —{' '}
            <a href="/products" className="underline text-amber-300 ml-1">Abhi Book Karein →</a>
          </span>
          <button onClick={() => setShow(false)} className="ml-4 text-gray-400 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
