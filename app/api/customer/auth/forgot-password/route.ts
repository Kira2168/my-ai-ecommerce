import { NextResponse } from "next/server";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { sendCustomerResetEmail } from "@/lib/auth/customer-reset-email";

const dbAny = db as any;

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await dbAny.customerUser.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    await db.$executeRaw`
      UPDATE "CustomerPasswordResetToken"
      SET "usedAt" = NOW()
      WHERE "email" = ${email} AND "usedAt" IS NULL
    `;

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await db.$executeRaw`
      INSERT INTO "CustomerPasswordResetToken" ("id", "email", "tokenHash", "expiresAt", "createdAt")
      VALUES (${randomUUID()}, ${email}, ${tokenHash}, ${expiresAt}, NOW())
    `;

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${origin}/auth/reset-password?token=${rawToken}`;

    await sendCustomerResetEmail(email, resetUrl);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = String(error?.message || "");
    if (message.includes("42P01") || message.includes("CustomerPasswordResetToken") || message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Password reset is being set up. Please try again in a minute." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message || "Failed to start reset." }, { status: 500 });
  }
}
