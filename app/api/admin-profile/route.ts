import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const dbAny = db as any;

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
    const [completedOrders, pendingOrders, actions24h] = await Promise.all([
      db.order.count({ where: { status: "COMPLETED" } }),
      db.order.count({ where: { status: "PENDING" } }),
      Promise.all([
        db.order.count({ where: { createdAt: { gte: dayAgo } } }),
        db.product.count({ where: { createdAt: { gte: dayAgo } } }),
      ]).then(([ordersCount, productsCount]) => ordersCount + productsCount),
    ]);

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
