import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/admin-password";
import {
  createAdminPreauthToken,
  getAdminPreauthCookieName,
  getAdminSessionCookieName,
} from "@/lib/auth/admin-session";

const dbAny = db as any;

async function ensureBootstrapAdmin() {
  const count = await dbAny.adminUser.count();
  if (count > 0) return;

  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = process.env.ADMIN_BOOTSTRAP_NAME || "Admin";

  if (!email || !password) return;

  await dbAny.adminUser.create({
    data: {
      email: email.toLowerCase(),
      displayName: name,
      passwordHash: hashPassword(password),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await ensureBootstrapAdmin();

    const admin = await dbAny.adminUser.findUnique({ where: { email } });
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createAdminPreauthToken({ adminId: admin.id, email: admin.email });

    const response = NextResponse.json({ success: true });
    response.cookies.set(getAdminPreauthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 10,
    });
    response.cookies.set(getAdminSessionCookieName(), "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 500 });
  }
}
