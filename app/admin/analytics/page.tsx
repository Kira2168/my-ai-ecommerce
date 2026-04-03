import { Activity, BarChart2 } from "lucide-react";
import AdminHeader from "../admin-header";
import { getOrdersSafe } from "../admin-data";

export const dynamic = "force-dynamic";
const DAYS_RANGE = 35;

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminAnalyticsPage() {
  const orders = await getOrdersSafe();
  const completed = orders.filter((o) => o.status === "COMPLETED");
  const totalRevenue = completed.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0;

  const days = Array.from({ length: DAYS_RANGE }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS_RANGE - 1 - idx));
    return d;
  });

  const revenueByDay = days.map((d) => {
    const label = d.toDateString();
    const total = completed
      .filter((o) => new Date(o.createdAt).toDateString() === label)
      .reduce((acc, o) => acc + Number(o.total || 0), 0);
    return { label: formatDayLabel(d), total };
  });

  const activeRevenueDays = revenueByDay.filter((d) => d.total > 0);
  const hasRevenue = activeRevenueDays.length > 0;

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.total));
  const barWidth = 100 / Math.max(1, revenueByDay.length);
  const points = revenueByDay
    .map((d, idx) => {
      const x = (idx / (revenueByDay.length - 1)) * 100;
      const y = 100 - (d.total / maxRevenue) * 70 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex items-center gap-3 mb-6">
          <BarChart2 className="text-brand w-5 h-5" />
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Analytics</h1>
        </div>

        <div className="bg-(--card-bg) border border-(--border-color) rounded-4xl sm:rounded-[3rem] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-brand w-4 h-4" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-foreground/40">Revenue Pulse</h2>
            <span className="ml-auto text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/50">
              Last {DAYS_RANGE} days
            </span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/50 mb-4">
            Completed orders only
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-3xl border border-(--border-color) bg-(--card-bg-secondary)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40">Total Revenue</p>
              <p className="text-2xl font-black text-foreground mt-2">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-3xl border border-(--border-color) bg-(--card-bg-secondary)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40">Completed Orders</p>
              <p className="text-2xl font-black text-foreground mt-2">{completed.length}</p>
            </div>
            <div className="p-4 rounded-3xl border border-(--border-color) bg-(--card-bg-secondary)">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40">Average Order</p>
              <p className="text-2xl font-black text-foreground mt-2">${avgOrder.toFixed(2)}</p>
            </div>
          </div>

          {hasRevenue ? (
            <div className="w-full overflow-x-auto">
              <div className="min-w-215">
                <svg viewBox="0 0 100 100" className="w-full h-56">
                  <defs>
                    <linearGradient id="pulse" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {revenueByDay.map((d, idx) => {
                    const x = idx * barWidth + barWidth * 0.15;
                    const h = (d.total / maxRevenue) * 70;
                    const y = 90 - h;
                    return (
                      <rect
                        key={d.label}
                        x={x}
                        y={y}
                        width={barWidth * 0.7}
                        height={Math.max(1, h)}
                        rx={0.8}
                        fill="rgba(0,242,255,0.18)"
                      />
                    );
                  })}
                  <polyline
                    fill="none"
                    stroke="#00f2ff"
                    strokeWidth="2"
                    points={points}
                  />
                  <polygon
                    fill="url(#pulse)"
                    points={`0,100 ${points} 100,100`}
                  />
                </svg>
              </div>
            </div>
          ) : null}

          {hasRevenue ? (
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-180 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/50">
                {activeRevenueDays.map((d) => (
                  <div key={d.label} className="flex flex-col gap-2">
                    <span>{d.label}</span>
                    <span className="text-foreground text-xs">${d.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-2xl border border-(--border-color) bg-(--card-bg-secondary) text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/50">
                No completed orders yet. Revenue timeline will appear after your first completed order.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
