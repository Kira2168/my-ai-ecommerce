import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCustomerSessionCookieName, verifyCustomerSessionToken } from "@/lib/auth/customer-session";

const dbAny = db as any;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCustomerSessionCookieName())?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const session = await verifyCustomerSessionToken(token);
    if (session.role !== "CUSTOMER" || !session.userId) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await dbAny.customerUser.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
