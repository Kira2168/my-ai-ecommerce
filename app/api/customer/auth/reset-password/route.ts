import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/admin-password";

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
    const rows = await db.$queryRaw<Array<{ id: string; email: string; expiresAt: Date; usedAt: Date | null }>>`
      SELECT "id", "email", "expiresAt", "usedAt"
      FROM "CustomerPasswordResetToken"
      WHERE "tokenHash" = ${tokenHash}
      LIMIT 1
    `;
    const row = rows[0];

    if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or expired." }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        UPDATE "CustomerUser"
        SET "passwordHash" = ${hashPassword(newPassword)}, "updatedAt" = NOW()
        WHERE "email" = ${row.email}
      `;

      await tx.$executeRaw`
        UPDATE "CustomerPasswordResetToken"
        SET "usedAt" = NOW()
        WHERE "id" = ${row.id}
      `;

      await tx.$executeRaw`
        UPDATE "CustomerPasswordResetToken"
        SET "usedAt" = NOW()
        WHERE "email" = ${row.email} AND "usedAt" IS NULL
      `;
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const message = String(error?.message || "");
    if (message.includes("42P01") || message.includes("CustomerPasswordResetToken") || message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Password reset is being set up. Please request a new reset link shortly." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message || "Failed to reset password." }, { status: 500 });
  }
}
