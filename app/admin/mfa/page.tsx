"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminMfaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/auth/mfa", { cache: "no-store" });
      if (!res.ok) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setSetupRequired(Boolean(data.setupRequired));
      setEmail(String(data.email || ""));
      setSecret(String(data.secret || ""));
      setLoading(false);
    };
    load();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed.");
        return;
      }
      router.replace("/admin");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-background text-foreground grid place-items-center">Loading MFA...</main>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-4xl border border-(--border-color) bg-(--card-bg)">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="w-5 h-5 text-brand" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Admin MFA</h1>
        </div>

        {setupRequired ? (
          <div className="mb-5 p-4 rounded-2xl border border-amber-400/30 bg-amber-500/10">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-300 mb-2">Setup Required</p>
            <p className="text-sm text-foreground/80">Add this account to your Authenticator app, then enter the 6-digit code.</p>
            <p className="text-xs font-mono mt-3 break-all text-foreground/70">{email}</p>
            <p className="text-xs font-mono mt-1 break-all text-brand">Secret: {secret}</p>
          </div>
        ) : (
          <p className="text-sm text-foreground/70 mb-5">Enter your 6-digit authenticator code to continue.</p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            placeholder="123456"
            className="w-full bg-(--card-bg-secondary) border border-(--border-color) rounded-xl py-3 px-4 text-lg tracking-[0.35em] font-mono text-center outline-none focus:border-brand"
            required
          />
          {error ? <p className="text-red-400 text-xs font-mono uppercase tracking-widest">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting || code.length !== 6}
            className="w-full py-3 rounded-xl bg-brand text-black font-black uppercase tracking-[0.2em] disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify MFA"}
          </button>
        </form>
      </div>
    </main>
  );
}
