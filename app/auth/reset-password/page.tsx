"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function CustomerResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing reset token.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customer/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }

      setMessage("Password updated. You can now log in with the new password.");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/"), 1200);
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
          <h1 className="text-2xl font-bold text-cyan-100">Reset password</h1>
          <p className="text-sm text-cyan-100/80">Create a new password for your account.</p>
        </div>

        <label className="space-y-1 text-sm text-white/90">
          <span>New password</span>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-cyan-200/30 bg-black/30 px-3 py-2 pr-10 text-white outline-none transition focus:border-cyan-200/70"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="space-y-1 text-sm text-white/90">
          <span>Confirm password</span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-cyan-200/30 bg-black/30 px-3 py-2 pr-10 text-white outline-none transition focus:border-cyan-200/70"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl border border-cyan-200/70 bg-cyan-300/25 px-4 py-2 font-semibold text-cyan-100 transition hover:bg-cyan-300/35 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>

        {message && <p className="text-sm text-green-300">{message}</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        <p className="text-sm text-cyan-100/80">
          Back to <Link href="/" className="text-cyan-200 underline">home</Link>
        </p>
      </form>
    </main>
  );
}
