"use client";

import { PublicBookingWidget } from "@/components/ui/PublicBookingWidget";
import { Calendar, Clock, Star, Users } from "lucide-react";

export default function MeetingsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero */}
      <div className="bg-[var(--color-navy)] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 text-[var(--color-gold)] text-xs font-semibold uppercase tracking-wide mb-6">
            <Calendar size={13} /> Free Consultation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">
            Book a Meeting with KVL TECH
          </h1>
          <p className="text-base text-blue-200 max-w-xl mx-auto leading-relaxed">
            Get expert advice on your website, software, or digital transformation project.
            Choose a time that works for you.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: Clock,  text: "30-min free call"         },
              { icon: Star,   text: "200+ happy clients"        },
              { icon: Users,  text: "Dedicated project manager" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-blue-200">
                <Icon size={15} className="text-[var(--color-gold)]" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Widget */}
      <div className="py-12 px-4">
        <PublicBookingWidget />
      </div>

      {/* Bottom info */}
      <div className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "No commitment",
                body:  "Just a friendly chat to understand your needs. No pressure, no sales tactics.",
              },
              {
                title: "Expert advice",
                body:  "Talk directly with our senior developers and project managers.",
              },
              {
                title: "Instant quote",
                body:  "Walk away with a clear scope, timeline, and budget estimate.",
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <p className="font-bold text-[var(--color-text)] mb-1">{item.title}</p>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
