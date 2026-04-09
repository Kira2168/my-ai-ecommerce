"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CustomerResetRequestedPage() {
  const params = useSearchParams();
  const debugResetUrl = params.get("debug") || "";
  const emailSent = params.get("emailSent") === "1";
  const mailMode = params.get("mailMode") || "";

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="w-full max-w-md rounded-4xl border border-(--border-color) bg-(--card-bg) p-8 space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Check your email</h1>
        <p className="text-sm text-foreground/70">
          If the email exists in our system, we sent a password reset link.
        </p>
        <p className="text-sm text-foreground/70">
          Open the email and use the button to continue to the reset password page.
        </p>

        {!emailSent && mailMode === "dev-fallback" ? (
          <p className="text-xs text-amber-300">
            SMTP is not configured yet, so no inbox email was sent. Use the direct reset link below in development.
          </p>
        ) : null}

        {debugResetUrl ? (
          <div className="rounded-xl border border-amber-300/40 bg-amber-400/10 p-3 space-y-2">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-200">
              Dev mode: open reset link directly
            </p>
            <a href={debugResetUrl} className="inline-block text-sm text-brand underline break-all">
              Open Reset Password Link
            </a>
          </div>
        ) : null}

        <div className="pt-2">
          <Link href="/" className="text-brand underline">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
