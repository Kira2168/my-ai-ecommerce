import { ShieldCheck } from "lucide-react";
import AdminHeader from "../admin-header";
import { db } from "@/lib/db";
import ProfileEditor from "./profile-editor";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const dbAny = db as any;

  const profile = await dbAny.adminProfile.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      displayName: "Kirubel Adisu",
      mfaEnabled: true,
    },
  });

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [completedOrders, pendingOrders, actions24h] = await Promise.all([
    db.order.count({ where: { status: "COMPLETED" } }),
    db.order.count({ where: { status: "PENDING" } }),
    Promise.all([
      db.order.count({ where: { createdAt: { gte: dayAgo } } }),
      db.product.count({ where: { createdAt: { gte: dayAgo } } }),
    ]).then(([ordersCount, productsCount]) => ordersCount + productsCount),
  ]);

  const stats = {
    completedOrders,
    pendingOrders,
    actions24h,
    riskLevel: pendingOrders > completedOrders ? "Medium" : "Low",
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="text-brand w-5 h-5" />
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Account</h1>
        </div>

        <div className="relative overflow-hidden bg-(--card-bg) border border-(--border-color) rounded-4xl sm:rounded-[3rem] p-6 sm:p-8">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(0,242,255,0.12),transparent_45%)]" />
          <ProfileEditor initialProfile={profile} initialStats={stats} />
        </div>
      </div>
    </div>
  );
}
