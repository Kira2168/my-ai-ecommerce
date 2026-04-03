import { ShieldCheck } from "lucide-react";
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

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--card-bg-secondary)]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Operator</p>
              <p className="text-2xl font-black text-foreground">Kirubel</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--card-bg-secondary)]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Access Level</p>
              <p className="text-2xl font-black text-foreground">Admin</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-[var(--card-bg-secondary)]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Node</p>
              <p className="text-2xl font-black text-foreground">01-Kirubel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
