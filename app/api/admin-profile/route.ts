import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verify } from "otplib";
import { getAdminSessionCookieName, verifyAdminSessionToken } from "@/lib/auth/admin-session";

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

async function ensureProfile() {
  return dbAny.adminProfile.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      displayName: "Kirubel Adisu",
      mfaEnabled: true,
    },
  });
}

export async function GET() {
  try {
    const profile = await ensureProfile();

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [completedOrders, pendingRows, actions24h] = await Promise.all([
      db.order.count({ where: { status: "COMPLETED" } }),
      db.order.findMany({ where: { status: "PENDING" }, select: { total: true, items: true } }),
      Promise.all([
        db.order.count({ where: { createdAt: { gte: dayAgo } } }),
        db.product.count({ where: { createdAt: { gte: dayAgo } } }),
      ]).then(([ordersCount, productsCount]) => ordersCount + productsCount),
    ]);

    const pendingOrders = pendingRows.filter((row) => {
      const total = Number((row as any).total || 0);
      const items = Array.isArray((row as any).items) ? ((row as any).items as any[]) : [];
      return total > 0 || items.length > 0;
    }).length;

    const riskLevel = pendingOrders > completedOrders ? "Medium" : "Low";

    return NextResponse.json({
      profile,
      stats: {
        completedOrders,
        pendingOrders,
        actions24h,
        riskLevel,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    await ensureProfile();

    const updates: Record<string, any> = {};
    if (typeof body.displayName === "string") updates.displayName = body.displayName.trim() || "Kirubel Adisu";
    if (typeof body.image === "string") updates.image = body.image || null;
    if (typeof body.mfaEnabled === "boolean") updates.mfaEnabled = body.mfaEnabled;
    if (body.touchLastLogin === true) updates.lastLoginAt = new Date();

    const profile = await dbAny.adminProfile.update({
      where: { id: "main" },
      data: updates,
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestBody: any = {};
    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const mfaCode = String(requestBody?.mfaCode || "").replace(/\s+/g, "");

    if (admin.mfaEnabled) {
      if (!/^\d{6}$/.test(mfaCode)) {
        return NextResponse.json({ error: "6-digit MFA code is required to delete profile." }, { status: 400 });
      }
      if (!admin.mfaSecret) {
        return NextResponse.json({ error: "MFA is enabled but secret is missing." }, { status: 400 });
      }

      const mfaResult = await verify({ token: mfaCode, secret: admin.mfaSecret, epochTolerance: 60 });
      if (!(mfaResult as any)?.valid) {
        return NextResponse.json({ error: "Invalid MFA code." }, { status: 401 });
      }
    }

    await dbAny.adminProfile.deleteMany({ where: { id: "main" } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
