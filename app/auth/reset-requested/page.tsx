import Link from "next/link";

export default function CustomerResetRequestedPage() {
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
        <div className="pt-2">
          <Link href="/auth/login" className="text-brand underline">Back to login</Link>
        </div>
      </div>
    </main>
  );
}
