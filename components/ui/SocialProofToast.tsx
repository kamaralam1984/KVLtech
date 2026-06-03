'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

const NOTIFICATIONS = [
  { name: 'Ramesh Kumar', city: 'Delhi', product: 'Restaurant Website', time: '2 min' },
  { name: 'Priya Sharma', city: 'Mumbai', product: 'E-commerce Platform', time: '5 min' },
  { name: 'Dr. Anil Verma', city: 'Bangalore', product: 'Hospital Management System', time: '8 min' },
  { name: 'Sunita Patel', city: 'Ahmedabad', product: 'School Management System', time: '12 min' },
  { name: 'Rohit Mehta', city: 'Pune', product: 'Hotel Booking Website', time: '15 min' },
  { name: 'Kavita Singh', city: 'Jaipur', product: 'Real Estate Website', time: '3 min' },
  { name: 'Vikram Gupta', city: 'Hyderabad', product: 'Restaurant Website', time: '7 min' },
  { name: 'Neha Agarwal', city: 'Chennai', product: 'E-commerce Platform', time: '20 min' },
  { name: 'Suresh Reddy', city: 'Kolkata', product: 'Hospital Management System', time: '25 min' },
  { name: 'Meera Joshi', city: 'Lucknow', product: 'School Management System', time: '30 min' },
];

export function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(NOTIFICATIONS[0]);

  useEffect(() => {
    let notifIndex = 0;

    // First show after 15 seconds
    const firstTimer = setTimeout(() => {
      setCurrent(NOTIFICATIONS[0]);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 15000);

    // Then show every 35 seconds
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          className="fixed bottom-24 left-4 z-50 max-w-xs"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div
              style={{ background: 'linear-gradient(135deg, #1a2035, #2d3a5f)' }}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden p-1"
            >
              <img src="/kvl-tech-logo-white.png" alt="KVL TECH" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs text-gray-500">🔥 Abhi purchase kiya</p>
              <p className="text-sm font-bold text-gray-800">{current.name}, {current.city}</p>
              <p className="text-xs text-amber-600 font-medium">{current.product}</p>
              <p className="text-xs text-gray-400">{current.time} pehle</p>
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
