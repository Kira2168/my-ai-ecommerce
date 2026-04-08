"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/checkout";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      router.replace(next);
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-(--border-color) bg-(--card-bg-secondary) px-4 py-3 outline-none focus:border-brand"
            required
          />
          <div className="text-right text-sm">
            <Link href="/auth/forgot-password" className="text-brand">
              Forgot password?
            </Link>
          </div>
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
