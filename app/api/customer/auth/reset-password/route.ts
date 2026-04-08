import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/admin-password";

const dbAny = db as any;

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body.token || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const tokenHash = sha256(token);
    const row = await dbAny.customerPasswordResetToken.findUnique({ where: { tokenHash } });

    if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }

    await db.$transaction([
      dbAny.customerUser.update({
        where: { email: row.email },
        data: { passwordHash: hashPassword(newPassword) },
      }),
      dbAny.customerPasswordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
      dbAny.customerPasswordResetToken.updateMany({
        where: { email: row.email, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset password." }, { status: 500 });
  }
}
