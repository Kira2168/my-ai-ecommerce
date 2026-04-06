import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/admin-password";
import { createCustomerSessionToken, getCustomerSessionCookieName } from "@/lib/auth/customer-session";

const dbAny = db as any;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await dbAny.customerUser.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createCustomerSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ success: true, user: { email: user.email, displayName: user.displayName } });
    response.cookies.set(getCustomerSessionCookieName(), token, cookieOptions());
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login failed." }, { status: 500 });
  }
}
