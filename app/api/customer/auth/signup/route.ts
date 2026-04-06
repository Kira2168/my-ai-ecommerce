import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/admin-password";
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
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");

    if (!email || !displayName || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (displayName.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const exists = await dbAny.customerUser.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    const user = await dbAny.customerUser.create({
      data: {
        email,
        displayName,
        passwordHash: hashPassword(password),
      },
    });

    const token = await createCustomerSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ success: true, user: { email: user.email, displayName: user.displayName } });
    response.cookies.set(getCustomerSessionCookieName(), token, cookieOptions());
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Signup failed." }, { status: 500 });
  }
}
