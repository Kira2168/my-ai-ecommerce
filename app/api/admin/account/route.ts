import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth/admin-session";
import { hashPassword, verifyPassword } from "@/lib/auth/admin-password";

const dbAny = db as any;

async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminSessionCookieName())?.value;
  if (!token) return null;

  const session = await verifyAdminSessionToken(token);
  if (session.role !== "ADMIN" || !session.adminId || !session.mfa) return null;

  const admin = await dbAny.adminUser.findUnique({ where: { id: session.adminId } });
  return admin || null;
}

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      mfaEnabled: Boolean(admin.mfaEnabled),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load account." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const nextDisplayName = typeof body.displayName === "string" ? body.displayName.trim() : undefined;
    const nextEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    const updates: Record<string, any> = {};

    if (nextDisplayName !== undefined) {
      if (nextDisplayName.length < 2) {
        return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
      }
      updates.displayName = nextDisplayName;
    }

    if (nextEmail !== undefined) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail);
      if (!emailOk) {
        return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
      }

      const existing = await dbAny.adminUser.findUnique({ where: { email: nextEmail } });
      if (existing && existing.id !== admin.id) {
        return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
      }
      updates.email = nextEmail;
    }

    const wantsPasswordChange = Boolean(newPassword);
    if (wantsPasswordChange) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }
      if (!verifyPassword(currentPassword, admin.passwordHash)) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }

      updates.passwordHash = hashPassword(newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No account changes submitted." }, { status: 400 });
    }

    const updatedAdmin = await dbAny.adminUser.update({
      where: { id: admin.id },
      data: updates,
    });

    if (updates.displayName) {
      await dbAny.adminProfile.upsert({
        where: { id: "main" },
        update: { displayName: updates.displayName },
        create: { id: "main", displayName: updates.displayName, mfaEnabled: true },
      });
    }

    return NextResponse.json({
      success: true,
      account: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        displayName: updatedAdmin.displayName,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update account." }, { status: 500 });
  }
}
