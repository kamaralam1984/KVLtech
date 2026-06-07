"use client"

import { useState } from "react"
import {
  Mail, Clock, CheckCircle2, Loader2, Play, Pause,
  ArrowRight, Users, Zap,
} from "lucide-react"
import { AdminTopbar } from "@/components/admin/AdminSidebar"

interface SequenceStep {
  day: number
  subject: string
  preview: string
}

interface Sequence {
  id: string
  name: string
  description: string
  emailCount: number
  durationDays: number
  steps: SequenceStep[]
  trigger: string
  action: string
  channel: string
}

const SEQUENCES: Sequence[] = [
  {
    id: "new-lead-nurture",
    name: "New Lead Nurture",
    description: "Engage new leads immediately and follow up over 14 days",
    emailCount: 5,
    durationDays: 14,
    trigger: "lead_created",
    action: "send_email",
    channel: "email",
    steps: [
      { day: 0, subject: "Welcome to KVL TECH — Let's Build Something Great!", preview: "Namaste! Shukriya KVL TECH se contact karne ke liye. Hamare expert 24 ghante mein aapko call karenge..." },
      { day: 2, subject: "See What We've Built for Businesses Like Yours", preview: "Aapne 2 din pehle humse contact kiya tha. Yahan kuch success stories hain jo aapke business jaisi hain..." },
      { day: 5, subject: "FREE Consultation — Sirf Aapke Liye", preview: "Kya aap 30 minute ki FREE consultation ke liye taiyaar hain? Hum aapka project discuss karenge..." },
      { day: 9, subject: "Special Offer: Get Your Website in 3 Days", preview: "Limited time offer — is hafte order karo aur FREE domain + hosting (1 saal) pao..." },
      { day: 14, subject: "Last Chance — KVL TECH Offer Expires Today", preview: "Aaj aakhri din hai hamare special offer ka. Aapke jaisa business nahi chahta ki competitors aage nikal jaayein..." },
    ],
  },
  {
    id: "post-demo-followup",
    name: "Post-Demo Follow-up",
    description: "Convert prospects who attended a demo over 7 days",
    emailCount: 3,
    durationDays: 7,
    trigger: "lead_status_changed",
    action: "send_email",
    channel: "email",
    steps: [
      { day: 0, subject: "Demo ke baad ka summary — Aapke liye tailored plan", preview: "Aaj demo dekh ke kaisa laga? Hum aapke specific requirements ke saath ek plan banaate hain..." },
      { day: 3, subject: "Proposal Ready: Aapke Business ke liye Custom Website", preview: "Aapke demo ke baad humne aapke business ke liye ek special proposal taiyaar kiya hai..." },
      { day: 7, subject: "Kya aap taiyaar hain? Aapki project slot abhi available hai", preview: "Hum aapka project shuru karna chahte hain. Sirf ek confirmation chahiye..." },
    ],
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Win back leads who went quiet for 30 days",
    emailCount: 2,
    durationDays: 30,
    trigger: "no_contact_days",
    action: "send_email",
    channel: "email",
    steps: [
      { day: 0, subject: "Aapko yaad kiya — Kya sab theek hai?", preview: "Kaafi time ho gaya! KVL TECH mein bahut kuch naya aaya hai aapke baad. Kya abhi bhi help chahiye..." },
      { day: 30, subject: "Last attempt — Hum still yahan hain", preview: "Yeh hamaari taraf se aakhri email hai. Agar aap kabhi bhi ready hon, hum 24 ghante available hain..." },
    ],
  },
  {
    id: "post-purchase-onboarding",
    name: "Post-Purchase Onboarding",
    description: "Onboard new clients smoothly over the first 7 days",
    emailCount: 4,
    durationDays: 7,
    trigger: "order_placed",
    action: "send_email",
    channel: "email",
    steps: [
      { day: 0, subject: "Order Confirm! Ab kaam shuru hota hai", preview: "Shukriya! Aapka order receive ho gaya. Hamare team ne aapka project assign kar diya hai..." },
      { day: 1, subject: "Project kickoff: Aapko kya share karna hai", preview: "Kal se design phase start hogi. Please logo, brand colors aur content share karein..." },
      { day: 3, subject: "Design ready for review — Aapki approval chahiye", preview: "Pehla design draft ready hai! Please client portal mein dekh ke approve/changes suggest karein..." },
      { day: 7, subject: "Aapki website launch ke liye almost ready!", preview: "Testing almost done hai. 24-48 ghante mein aapki website live ho jaayegi..." },
    ],
  },
  {
    id: "amc-renewal-reminder",
    name: "AMC Renewal Reminder",
    description: "Remind clients to renew their Annual Maintenance Contract",
    emailCount: 3,
    durationDays: 30,
    trigger: "time_after_lead",
    action: "send_email",
    channel: "email",
    steps: [
      { day: 0, subject: "Aapka AMC Contract 30 din mein expire ho raha hai", preview: "Namaste! Aapka Annual Maintenance Contract 30 din mein expire hoga. Renew karein aur uninterrupted support pate rahein..." },
      { day: 15, subject: "AMC Reminder: Sirf 15 din baaki hain", preview: "Renewal ki yaad dilaane ke liye — Sirf 15 din bache hain. Early renewal pe special discount milega..." },
      { day: 30, subject: "URGENT: AMC aaj expire ho raha hai!", preview: "Aaj aakhri din hai. Abhi renew karein warna support interrupted ho sakta hai..." },
    ],
  },
]

export default function SequencesPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)
  const [activated, setActivated] = useState<Set<string>>(new Set())

  const activate = async (seq: Sequence) => {
    setActivating(seq.id)
    try {
      const res = await fetch("/api/admin/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: seq.name,
          trigger: seq.trigger,
          triggerValue: seq.trigger === "no_contact_days" ? "30" : "",
          action: seq.action,
          channel: seq.channel,
          template: seq.steps.map(s => `Day ${s.day}: ${s.subject}\n${s.preview}`).join("\n\n---\n\n"),
          delayHours: 0,
        }),
      })
      if (res.ok) {
        setActivated(prev => new Set([...prev, seq.id]))
      }
    } catch { }
    setActivating(null)
  }

  return (
    <>
      <AdminTopbar title="Email Sequence Builder" />
      <div className="p-6 space-y-6 max-w-[1100px]">

        <div>
          <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Email Sequence Builder</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Pre-built drip sequences — activate to create automation rules
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Pre-built Sequences", value: SEQUENCES.length, icon: Zap, color: "var(--color-gold)" },
            { label: "Total Emails", value: SEQUENCES.reduce((s, seq) => s + seq.emailCount, 0), icon: Mail, color: "#0891B2" },
            { label: "Activated", value: activated.size, icon: CheckCircle2, color: "#16A34A" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-[var(--color-text)]">{value}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {SEQUENCES.map(seq => {
            const isExpanded = expanded === seq.id
            const isActivated = activated.has(seq.id)
            const isActivating = activating === seq.id

            return (
              <div
                key={seq.id}
                className="card overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-gold)]/30 transition-all"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-bold text-base text-[var(--color-text)]">{seq.name}</h3>
                        {isActivated && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                            Activated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">{seq.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                          <Mail size={11} /> {seq.emailCount} emails
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                          <Clock size={11} /> {seq.durationDays} days
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                          <Users size={11} /> {seq.trigger.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : seq.id)}
                        className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] px-3 py-1.5 rounded-xl transition-all"
                      >
                        {isExpanded ? "Hide steps" : "View steps"}
                      </button>
                      <button
                        onClick={() => activate(seq)}
                        disabled={isActivating || isActivated}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all disabled:opacity-60 ${
                          isActivated
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "btn-gold"
                        }`}
                      >
                        {isActivating ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isActivated ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Play size={12} />
                        )}
                        {isActivated ? "Active" : isActivating ? "Activating..." : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-4">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-4 uppercase tracking-wide">Sequence Timeline</p>
                    <div className="space-y-3">
                      {seq.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/10 border-2 border-[var(--color-gold)]/30 flex items-center justify-center flex-shrink-0">
                              <Mail size={13} style={{ color: "var(--color-gold)" }} />
                            </div>
                            {idx < seq.steps.length - 1 && (
                              <div className="w-0.5 h-full bg-[var(--color-border)] mt-1 mb-1 min-h-[20px]" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                                Day {step.day}
                              </span>
                              <ArrowRight size={11} className="text-[var(--color-text-muted)]" />
                              <span className="text-xs font-semibold text-[var(--color-text)] truncate">{step.subject}</span>
                            </div>
                            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">{step.preview}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="card p-5 border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center flex-shrink-0">
              <Zap size={16} style={{ color: "var(--color-gold)" }} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[var(--color-text)] mb-1">How sequences work</h4>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Activating a sequence creates an automation rule in the database. The rule is triggered when
                the matching event occurs (e.g., new lead, order placed). Each email in the sequence fires at
                the specified delay. Manage active sequences from the{" "}
                <a href="/admin/automation" className="text-[var(--color-gold)] hover:underline">Automation Rules</a>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
