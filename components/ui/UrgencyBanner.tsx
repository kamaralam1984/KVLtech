'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNER_H = 40;
const SHOW_DURATION = 30 * 1000;   // 30 seconds visible
const HIDE_DURATION = 60 * 1000;   // 1 minute hidden

const OFFERS = [
  {
    text: "This week only",
    highlight: "3 slots left!",
    mid: "Get",
    offer: "FREE Domain + Hosting",
    cta: "Book Now →",
    link: "/contact",
  },
  {
    text: "Limited time:",
    highlight: "50% OFF",
    mid: "on Premium Plan —",
    offer: "Save ₹12,000 today",
    cta: "Claim Now →",
    link: "/pricing",
  },
  {
    text: "Today only:",
    highlight: "Free Branding",
    mid: "worth ₹5,000 with every",
    offer: "website purchase",
    cta: "Grab Deal →",
    link: "/products",
  },
  {
    text: "Flash Sale:",
    highlight: "Restaurant Website",
    mid: "at just",
    offer: "₹9,999 (was ₹12,999)",
    cta: "Order Now →",
    link: "/products/restaurant-website",
  },
];

export function UrgencyBanner() {
  const [show, setShow] = useState(true);
  const [offerIndex, setOfferIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Set CSS variable for navbar offset
  useEffect(() => {
    document.documentElement.style.setProperty('--banner-h', show ? `${BANNER_H}px` : '0px');
    return () => { document.documentElement.style.setProperty('--banner-h', '0px'); };
  }, [show]);

  // Interval cycle: 30s show → 1min hide → new offer → repeat
  useEffect(() => {
    if (dismissed) {
      document.documentElement.style.setProperty('--banner-h', '0px');
      return;
    }

    // After 30s, hide the banner
    cycleRef.current = setTimeout(() => {
      setShow(false);

      // After 1 min hidden, show next offer
      cycleRef.current = setTimeout(() => {
        setOfferIndex(i => (i + 1) % OFFERS.length);
        setShow(true);
      }, HIDE_DURATION);

    }, SHOW_DURATION);

    return () => { if (cycleRef.current) clearTimeout(cycleRef.current); };
  }, [offerIndex, dismissed]);

  const offer = OFFERS[offerIndex];

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          key={offerIndex}
          initial={{ y: -BANNER_H, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -BANNER_H, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center px-4 text-white text-sm"
          style={{
            height: BANNER_H,
            background: 'rgba(10, 16, 38, 0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(201, 162, 39, 0.2)',
          }}
        >
          <Zap size={13} className="text-amber-400 mr-2 flex-shrink-0" />
          <span className="text-center text-xs sm:text-sm">
            🔥 {offer.text}{' '}
            <strong className="text-amber-400">{offer.highlight}</strong>{' '}
            {offer.mid}{' '}
            <strong className="text-amber-300">{offer.offer}</strong> —{' '}
            <a href={offer.link} className="underline text-amber-300 hover:text-amber-200 ml-1 font-semibold">
              {offer.cta}
            </a>
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="ml-4 text-gray-400 hover:text-white flex-shrink-0 transition-colors"
            aria-label="Close banner"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
