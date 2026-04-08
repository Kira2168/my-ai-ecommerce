import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";

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

    await dbAny.customerPasswordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await dbAny.customerPasswordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
      },
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${origin}/auth/reset-password?token=${rawToken}`;

    // TODO: send resetUrl via email provider.
    return NextResponse.json({ success: true, resetUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to start reset." }, { status: 500 });
  }
}
