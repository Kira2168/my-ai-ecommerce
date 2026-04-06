import { NextResponse } from "next/server";
import { getCustomerSessionCookieName } from "@/lib/auth/customer-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(getCustomerSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
