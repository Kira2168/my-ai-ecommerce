"use client";

import Link from "next/link";
import { useState } from "react";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugResetUrl, setDebugResetUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugResetUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/customer/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to request reset link.");
        return;
      }

      setMessage("If an account exists for that email, a reset link is ready.");
      if (data.resetUrl) setDebugResetUrl(String(data.resetUrl));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[72vh] w-full max-w-md items-center px-4 py-12">
      <form onSubmit={onSubmit} className="w-full space-y-5 rounded-2xl border border-cyan-200/25 bg-black/35 p-6 backdrop-blur-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cyan-100">Forgot password</h1>
          <p className="text-sm text-cyan-100/80">Enter your account email and we will create a reset link.</p>
        </div>

        <label className="space-y-1 text-sm text-white/90">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-cyan-200/30 bg-black/30 px-3 py-2 text-white outline-none transition focus:border-cyan-200/70"
            required
          />
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl border border-cyan-200/70 bg-cyan-300/25 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300/35 disabled:opacity-60"
        >
          {loading ? "Requesting..." : "Send reset link"}
        </button>

        {message && <p className="text-sm text-green-300">{message}</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {debugResetUrl && (
          <p className="rounded-lg border border-cyan-200/20 bg-black/25 p-2 text-xs text-cyan-100/85 break-all">
            Dev reset link: <a className="underline" href={debugResetUrl}>{debugResetUrl}</a>
          </p>
        )}

        <p className="text-sm text-cyan-100/80">
          Back to <Link href="/auth/login" className="text-cyan-200 underline">login</Link>
        </p>
      </form>
    </main>
  );
}
