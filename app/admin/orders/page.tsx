import { History } from "lucide-react";
import AdminHeader from "../admin-header";
import { getOrdersSafe } from "../admin-data";
import ClearTransactionsButton, { OrderStatusButton } from "./clear-transactions-button";
import CleanupEmptyOrdersButton from "./cleanup-empty-orders-button";
import Link from "next/link";
import DeleteOrderButton from "./delete-order-button";

export const dynamic = "force-dynamic";

const formatOrderTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatOrderDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = (await searchParams) || {};
  const activeFilter = params.status === "COMPLETED" || params.status === "PENDING" ? params.status : "ALL";
  const orders = await getOrdersSafe();
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const visibleOrders =
    activeFilter === "ALL" ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <History className="text-brand w-5 h-5" />
            <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <CleanupEmptyOrdersButton />
            <ClearTransactionsButton />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/admin/orders"
            className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${
              activeFilter === "ALL"
                ? "bg-brand text-black border-brand"
                : "bg-(--card-bg) text-foreground/70 border-(--border-color)"
            }`}
          >
            All ({orders.length})
          </Link>
          <Link
            href="/admin/orders?status=COMPLETED"
            className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${
              activeFilter === "COMPLETED"
                ? "bg-brand text-black border-brand"
                : "bg-(--card-bg) text-foreground/70 border-(--border-color)"
            }`}
          >
            Completed ({completedCount})
          </Link>
          <Link
            href="/admin/orders?status=PENDING"
            className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${
              activeFilter === "PENDING"
                ? "bg-amber-500/20 text-amber-400 border-amber-400/40"
                : "bg-(--card-bg) text-foreground/70 border-(--border-color)"
            }`}
          >
            Pending ({pendingCount})
          </Link>
        </div>

        <div className="bg-(--card-bg) border border-(--border-color) rounded-4xl sm:rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-8 border-b border-white/5 flex items-center gap-4 bg-(--card-bg-secondary)">
            <History className="text-brand w-4 h-4" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-foreground/40">Transmission Log</h2>
          </div>
          <div className="p-4 sm:p-5 space-y-4 max-h-180 overflow-y-auto custom-scrollbar">
            {visibleOrders.length === 0 ? (
              <div className="p-20 text-center text-foreground/20 font-mono text-[10px] uppercase tracking-widest">No Signals</div>
            ) : (
              visibleOrders.map((order) => (
                <div key={order.id} className="p-4 sm:p-5 rounded-4xl bg-(--card-bg-secondary) border border-white/5 hover:border-brand/40 transition-all group relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 relative z-10">
                    <div>
                      <p className="text-[8px] font-mono text-foreground/40 uppercase mb-2 tracking-tighter">TRANS_ID: {order.id.slice(-8)}</p>
                      <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        order.status === "COMPLETED" ? "bg-brand text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {order.status}
                      </div>
                    </div>
                    <p className="text-lg sm:text-xl font-mono font-black text-foreground">${Number(order.total).toFixed(2)}</p>
                  </div>

                  <div className="space-y-2 mb-4 relative z-10">
                    {(order.items as any[])?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-[9px] sm:text-[10px] font-mono text-foreground/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="uppercase truncate max-w-30">{item.name}</span>
                        <span className="text-brand">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-foreground/30 relative z-10">
                    <div className="flex items-center gap-2">{formatOrderTime(new Date(order.createdAt))}</div>
                    <div className="flex items-center gap-3">
                      <span className="uppercase">{formatOrderDate(new Date(order.createdAt))}</span>
                      <OrderStatusButton id={order.id} status={order.status} />
                      <DeleteOrderButton id={order.id} />
                    </div>
                  </div>

                  {order.status === "COMPLETED" && (
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand/5 blur-3xl rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
