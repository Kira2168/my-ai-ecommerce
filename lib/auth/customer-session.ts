import { SignJWT, jwtVerify } from "jose";

const cookieName = "customer_session";
const secret = new TextEncoder().encode(
  process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "dev-only-customer-session-secret"
);

export function getCustomerSessionCookieName() {
  return cookieName;
}

export async function createCustomerSessionToken(payload: { userId: string; email: string }) {
  return await new SignJWT({ role: "CUSTOMER", email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret);
}

export async function verifyCustomerSessionToken(token: string) {
  const verified = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return {
    userId: String(verified.payload.sub || ""),
    email: String(verified.payload.email || ""),
    role: String(verified.payload.role || ""),
  };
}
