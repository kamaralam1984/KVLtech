"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Lock, Bell, Globe, Palette, Shield,
  Save, Eye, EyeOff, CheckCircle2, AlertCircle,
  Phone, Mail, MapPin, MessageCircle,
} from "lucide-react";
import { AdminTopbar } from "@/components/admin/AdminSidebar";

type Section = "profile" | "security" | "notifications" | "business" | "appearance";

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold)]/10 transition-all";
const LABEL = "block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rahul Sharma", email: "admin@kvlbusinesssolutions.com",
    phone: "+91 9942000413", role: "Super Admin",
  });
  const [business, setBusiness] = useState({
    companyName: "KVL TECH Pvt. Ltd.", website: "kvlbusinesssolutions.com",
    address: "INDIA",
    whatsapp: "+91 9942000413", supportEmail: "support@kvlbusinesssolutions.com",
    gst: "09AABCK1234A1Z5",
  });
  const [notifications, setNotifications] = useState({
    newOrder: true, newLead: true, payment: true,
    support: true, brandingSubmit: true, emailDigest: false,
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SECTIONS: { id: Section; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "business", label: "Business Info", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <>
      <AdminTopbar title="Settings" />
      <div className="p-6 max-w-5xl">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Sidebar nav */}
          <div className="lg:col-span-1">
            <div className="card p-2 space-y-1">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeSection === id
                    ? "bg-[var(--color-navy)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]"}`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-7 space-y-6">

              {/* ── PROFILE ── */}
              {activeSection === "profile" && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Profile Settings</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Apni admin profile update karein</p>
                  </div>
                  <div className="flex items-center gap-5 pb-5 border-b border-[var(--color-border)]">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] flex items-center justify-center text-white font-display font-bold text-2xl shadow-[var(--shadow-luxury)]">
                      {profile.name[0]}
                    </div>
                    <div>
                      <p className="font-display font-bold text-lg text-[var(--color-text)]">{profile.name}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{profile.role}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Full Name</label>
                      <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Role</label>
                      <input value={profile.role} readOnly className={INPUT + " opacity-60 cursor-not-allowed"} />
                    </div>
                    <div>
                      <label className={LABEL}>Email Address</label>
                      <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Phone Number</label>
                      <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className={INPUT} />
                    </div>
                  </div>
                </>
              )}

              {/* ── BUSINESS ── */}
              {activeSection === "business" && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Business Information</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Company details jo website aur invoices mein use hote hain</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Company Name</label>
                      <input value={business.companyName} onChange={e => setBusiness(b => ({ ...b, companyName: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Website</label>
                      <input value={business.website} onChange={e => setBusiness(b => ({ ...b, website: e.target.value }))} className={INPUT} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={LABEL}>Office Address</label>
                      <input value={business.address} onChange={e => setBusiness(b => ({ ...b, address: e.target.value }))} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>WhatsApp Number</label>
                      <div className="relative">
                        <MessageCircle size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#25D366]" />
                        <input value={business.whatsapp} onChange={e => setBusiness(b => ({ ...b, whatsapp: e.target.value }))} className={INPUT + " pl-10"} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Support Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input type="email" value={business.supportEmail} onChange={e => setBusiness(b => ({ ...b, supportEmail: e.target.value }))} className={INPUT + " pl-10"} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>GST Number</label>
                      <input value={business.gst} onChange={e => setBusiness(b => ({ ...b, gst: e.target.value }))} className={INPUT} />
                    </div>
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === "notifications" && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Notification Preferences</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Kaunse events pe alerts chahiye</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: "newOrder", label: "New Order", desc: "Jab koi naya order aaye" },
                      { key: "newLead", label: "New Lead", desc: "Contact form submission" },
                      { key: "payment", label: "Payment Received", desc: "Successful payment alert" },
                      { key: "support", label: "Support Ticket", desc: "Naya support ticket" },
                      { key: "brandingSubmit", label: "Branding Submitted", desc: "Client ne branding details di" },
                      { key: "emailDigest", label: "Daily Email Digest", desc: "Roz subah summary email" },
                    ].map(({ key, label, desc }) => (
                      <label key={key} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-gold)]/40 transition-all cursor-pointer">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
                        </div>
                        <div className="relative shrink-0">
                          <input type="checkbox" className="sr-only peer"
                            checked={notifications[key as keyof typeof notifications]}
                            onChange={e => setNotifications(n => ({ ...n, [key]: e.target.checked }))} />
                          <div className="w-11 h-6 bg-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-gold)] transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* ── SECURITY ── */}
              {activeSection === "security" && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Security Settings</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Password aur account security</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={LABEL}>Current Password</label>
                      <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>New Password</label>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={passwords.newPass}
                          onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} placeholder="Min 8 characters" className={INPUT + " pr-12"} />
                        <button type="button" onClick={() => setShowPass(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                          {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Confirm New Password</label>
                      <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Dobara likhein" className={INPUT} />
                      {passwords.confirm && passwords.newPass !== passwords.confirm && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> Passwords match nahi kar rahe</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={18} className="text-[var(--color-gold)]" />
                      <p className="text-sm font-semibold text-[var(--color-text)]">Two-Factor Authentication</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-semibold">Off</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">Extra security layer — login pe OTP verify hoga</p>
                    <button className="btn-outline text-sm">Enable 2FA</button>
                  </div>
                </>
              )}

              {/* ── APPEARANCE ── */}
              {activeSection === "appearance" && (
                <>
                  <div>
                    <h2 className="font-display font-bold text-lg text-[var(--color-text)]">Appearance</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Dashboard look and feel customize karein</p>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className={LABEL}>Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Light", bg: "#FFFFFF", text: "#111827" },
                          { label: "Dark", bg: "#0A0A0F", text: "#E8E8F0" },
                          { label: "System", bg: "linear-gradient(135deg, #FFFFFF 50%, #0A0A0F 50%)", text: "#C9A227" },
                        ].map(({ label, bg, text }) => (
                          <button key={label}
                            className="p-4 rounded-xl border-2 border-[var(--color-gold)] flex flex-col items-center gap-2 hover:shadow-[var(--shadow-card)] transition-all">
                            <div className="w-10 h-10 rounded-lg border border-[var(--color-border)]" style={{ background: bg }} />
                            <p className="text-xs font-semibold text-[var(--color-text)]">{label}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>Admin Sidebar Color</label>
                      <div className="flex gap-3">
                        {["#0F172A", "#1E293B", "#312E81", "#064E3B", "#7C2D12"].map(color => (
                          <button key={color} className="w-8 h-8 rounded-full border-2 border-[var(--color-gold)] transition-transform hover:scale-110"
                            style={{ background: color }} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={LABEL}>Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input type="color" defaultValue="#C9A227"
                          className="w-12 h-10 rounded-lg border border-[var(--color-border)] cursor-pointer p-0.5" />
                        <span className="text-sm font-mono text-[var(--color-text-secondary)]">#C9A227 — KVL Gold</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Save button */}
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                {saved ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-500 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Settings saved successfully!
                  </motion.p>
                ) : <span />}
                <button onClick={handleSave} className="btn-gold flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
