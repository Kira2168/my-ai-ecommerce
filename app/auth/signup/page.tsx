"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Sparkles } from "lucide-react";

export default function CustomerSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/checkout";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/customer/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Signup failed.");
        return;
      }
      setSuccess("Account created successfully. Entering store...");
      setTimeout(() => router.replace(next), 900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-color) bg-(--card-bg) p-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Create Account</h1>
        <p className="text-sm text-foreground/60 mb-6">Sign up to purchase products.</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl border border-(--border-color) bg-(--card-bg-secondary) px-4 py-3 outline-none focus:border-brand"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-(--border-color) bg-(--card-bg-secondary) px-4 py-3 outline-none focus:border-brand"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="w-full rounded-xl border border-(--border-color) bg-(--card-bg-secondary) px-4 py-3 pr-12 outline-none focus:border-brand"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {success ? (
            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/35 bg-[linear-gradient(140deg,rgba(6,28,40,0.95),rgba(20,10,44,0.9))] px-4 py-3 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.28)]">
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-300/20 blur-2xl" />
              <div className="absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-fuchsia-400/20 blur-2xl" />
              <p className="relative flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em]">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
                {success}
              </p>
              <div className="relative mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-full animate-pulse bg-linear-to-r from-cyan-300 via-emerald-300 to-fuchsia-300" />
              </div>
            </div>
          ) : null}
          {error ? <p className="text-xs font-mono uppercase tracking-widest text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand text-black py-3 font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-foreground/60">
          Already have an account? <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="text-brand">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
