"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/checkout";

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
      const res = await fetch("/api/customer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed.");
        return;
      }
      setSuccess("Sign in successful. Redirecting...");
      setTimeout(() => router.replace(next), 900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-color) bg-(--card-bg) p-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Customer Login</h1>
        <p className="text-sm text-foreground/60 mb-6">Sign in to continue to checkout.</p>

        <form onSubmit={submit} className="space-y-4">
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
              placeholder="Password"
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
          <div className="text-right text-sm">
            <Link href="/auth/forgot-password" className="text-brand">
              Forgot password?
            </Link>
          </div>
          {success ? (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-emerald-200 animate-pulse">
              <p className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </p>
            </div>
          ) : null}
          {error ? <p className="text-xs font-mono uppercase tracking-widest text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand text-black py-3 font-black uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-foreground/60">
          New customer? <Link href={`/auth/signup?next=${encodeURIComponent(next)}`} className="text-brand">Create account</Link>
        </p>
      </div>
    </main>
  );
}
