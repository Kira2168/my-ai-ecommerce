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

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.total));
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

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8">
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

          <div className="w-full overflow-x-auto">
            <div className="min-w-[520px]">
              <svg viewBox="0 0 100 100" className="w-full h-56">
                <defs>
                  <linearGradient id="pulse" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
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

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[720px] grid grid-cols-6 sm:grid-cols-8 gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/50">
              {revenueByDay.map((d) => (
                <div key={d.label} className="flex flex-col gap-2">
                  <span>{d.label}</span>
                  <span className="text-foreground text-xs">${d.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
