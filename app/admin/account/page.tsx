import { ShieldCheck, User, Fingerprint, Activity, KeyRound, Sparkles } from "lucide-react";
import AdminHeader from "../admin-header";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-brand w-5 h-5" />
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Account</h1>
        </div>

        <div className="relative overflow-hidden bg-(--card-bg) border border-(--border-color) rounded-4xl sm:rounded-[3rem] p-6 sm:p-8">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(0,242,255,0.12),transparent_45%)]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Operator Profile</p>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">Kirubel Adisu</h2>
                  <p className="text-sm text-foreground/60 mt-2 max-w-xl">
                    Primary system maintainer. Handles drops, inventory control, order operations, and AI storefront tuning.
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center">
                  <User className="w-7 h-7 text-brand" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Access Level</p>
                  <p className="text-xl font-black text-foreground">Admin</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Node</p>
                  <p className="text-xl font-black text-foreground">01-Kirubel</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                  <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Status</p>
                  <p className="text-xl font-black text-emerald-400">Online</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-4">Security Posture</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-brand" /> MFA</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60 flex items-center gap-2"><KeyRound className="w-4 h-4 text-brand" /> API Key</span>
                  <span className="text-amber-400 font-bold">Rotated 7d ago</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60 flex items-center gap-2"><Sparkles className="w-4 h-4 text-brand" /> Session Integrity</span>
                  <span className="text-emerald-400 font-bold">Stable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 p-5 sm:p-6 rounded-3xl border border-white/10 bg-(--card-bg-secondary)">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-brand" />
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40">Recent Operator Activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Last Login</p>
                <p className="mt-2 text-lg font-black">Today, 09:42</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Actions (24h)</p>
                <p className="mt-2 text-lg font-black">37 Commands</p>
              </div>
              <div className="p-4 rounded-2xl border border-white/5 bg-(--card-bg)">
                <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">Risk Level</p>
                <p className="mt-2 text-lg font-black text-emerald-400">Low</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
