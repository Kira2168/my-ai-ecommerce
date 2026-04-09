import nodemailer from "nodemailer";

function getEnv(name: string) {
  return process.env[name]?.trim() || "";
}

export async function sendCustomerResetEmail(email: string, resetUrl: string) {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT") || "587");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const fromName = getEnv("RESET_FROM_NAME") || "Lucy.Gebeya";
  const from = getEnv("RESET_FROM_EMAIL") || getEnv("SMTP_FROM") || "no-reply@localhost";
  const isProd = process.env.NODE_ENV === "production";

  if (!host || !user || !pass) {
    if (isProd) {
      throw new Error("Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RESET_FROM_EMAIL.");
    }

    // Local/dev fallback: do not fail reset flow when SMTP is not configured.
    console.log(`[reset-email:dev-fallback] to=${email} url=${resetUrl}`);
    return { delivered: false as const, mode: "dev-fallback" as const };
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: `${fromName} <${from}>`,
    to: email,
    subject: "Reset your password",
    text: `We received a request to reset your password. Open this link: ${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 12px;">Reset your password</h2>
        <p style="margin: 0 0 12px;">We received a request to reset your password.</p>
        <p style="margin: 0 0 16px;">
          <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#111;color:#fff;text-decoration:none;">Reset Password</a>
        </p>
        <p style="margin: 0 0 8px;">Or copy this URL into your browser:</p>
        <p style="margin: 0 0 12px; word-break: break-all;">${resetUrl}</p>
        <p style="margin: 0; color: #555;">This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return { delivered: true as const, mode: "smtp" as const };
}
