import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateSecret, generateURI, verify } from "otplib";
import { db } from "@/lib/db";
import {
  createAdminSessionToken,
  getAdminPreauthCookieName,
  getAdminSessionCookieName,
  verifyAdminPreauthToken,
} from "@/lib/auth/admin-session";

const dbAny = db as any;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminPreauthCookieName())?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preauth = await verifyAdminPreauthToken(token);
    if (preauth.role !== "ADMIN" || !preauth.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await dbAny.adminUser.findUnique({ where: { id: preauth.adminId } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    let secret = admin.mfaSecret as string | null;
    if (!secret) {
      secret = generateSecret();
      await dbAny.adminUser.update({ where: { id: admin.id }, data: { mfaSecret: secret } });
    }

    const issuer = process.env.ADMIN_MFA_ISSUER || "FutureShop Admin";
    const otpauth = generateURI({ issuer, label: admin.email, secret });

    return NextResponse.json({
      setupRequired: !admin.mfaEnabled,
      secret,
      otpauth,
      email: admin.email,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "MFA setup failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getAdminPreauthCookieName())?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preauth = await verifyAdminPreauthToken(token);
    if (preauth.role !== "ADMIN" || !preauth.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const code = String(body.code || "").replace(/\s+/g, "");

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter a valid 6-digit code." }, { status: 400 });
    }

    const admin = await dbAny.adminUser.findUnique({ where: { id: preauth.adminId } });
    if (!admin || !admin.mfaSecret) {
      return NextResponse.json({ error: "MFA secret not initialized." }, { status: 400 });
    }

    const result = await verify({ token: code, secret: admin.mfaSecret, epochTolerance: 60 });
    if (!(result as any)?.valid) {
      return NextResponse.json({ error: "Invalid code." }, { status: 401 });
    }

    await dbAny.adminUser.update({
      where: { id: admin.id },
      data: { mfaEnabled: true },
    });

    const sessionToken = await createAdminSessionToken({ adminId: admin.id, email: admin.email });
    const response = NextResponse.json({ success: true });

    response.cookies.set(getAdminSessionCookieName(), sessionToken, {
      ...cookieOptions(),
      maxAge: 60 * 60 * 12,
    });
    response.cookies.set(getAdminPreauthCookieName(), "", {
      ...cookieOptions(),
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "MFA verification failed" }, { status: 500 });
  }
}
