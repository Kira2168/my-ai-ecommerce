"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/checkout";

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
      router.replace(next);
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            className="w-full rounded-xl border border-(--border-color) bg-(--card-bg-secondary) px-4 py-3 outline-none focus:border-brand"
            required
          />
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
