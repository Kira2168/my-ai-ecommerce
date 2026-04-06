import { SignJWT, jwtVerify } from "jose";

const cookieName = "admin_session";
const secret = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "dev-only-admin-session-secret-change-this"
);

export function getAdminSessionCookieName() {
  return cookieName;
}

export async function createAdminSessionToken(payload: { adminId: string; email: string }) {
  return await new SignJWT({ role: "ADMIN", email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.adminId)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);
}

export async function verifyAdminSessionToken(token: string) {
  const verified = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return {
    adminId: verified.payload.sub,
    email: String(verified.payload.email || ""),
    role: String(verified.payload.role || ""),
  };
}
