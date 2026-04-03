import { 
  Package, 
  DollarSign, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  ShoppingCart,
  History
} from "lucide-react";
import NewDropModalWrapper from "./new-drop-wrapper"; 
import EditDropModalWrapper from "@/app/admin/edit-drop-wrapper";
import DeleteButton from "./delete-button"; 
import CategoryManager from "./category-manager";
import AdminHeader from "./admin-header";
import { getOrdersSafe, getProductsSafe } from "./admin-data";
import DeleteOrderButton from "./orders/delete-order-button";

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

export const dynamic = "force-dynamic";


export default async function AdminDashboard() {
  const [products, orders] = await Promise.all([getProductsSafe(), getOrdersSafe()]);

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  
  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  const completedOrders = orders.filter(o => o.status === "COMPLETED");
  const completionRate = orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0;
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  const categoryCounts = products.reduce((acc, p) => {
    const name = p.category || "Uncategorized";
    acc.set(name, (acc.get(name) || 0) + 1);
    return acc;
  }, new Map<string, number>());

  const topCategory = Array.from(categoryCounts.entries()).reduce(
    (acc, [name, count]) => (count > acc.count ? { name, count } : acc),
    { name: "Uncategorized", count: 0 }
  );

  const liveCarts = orders.filter(
    o => o.status === "PENDING" && Array.isArray(o.items) && o.items.length > 0
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <AdminHeader />

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span className="text-brand font-mono text-[9px] uppercase tracking-[0.4em] font-bold">Terminal Authenticated</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase text-foreground">Command Center</h1>
          </div>
          <NewDropModalWrapper />
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 mb-12 sm:mb-16">
          <StatCard 
            icon={<DollarSign />} 
            label="Total Revenue" 
            value={`$${totalRevenue.toLocaleString()}`} 
            detail={`From ${orders.filter(o => o.status === "COMPLETED").length} Sales`} 
          />
          <StatCard 
            icon={<Package />} 
            label="Inventory" 
            value={`${totalStock} Units`} 
            detail={`${products.length} Active Assets`}
            isAlert={totalStock < 10} 
          />
          <StatCard 
            icon={<ShoppingCart />} 
            label="Pending Checkouts" 
            value={liveCarts.length} 
            detail="Carts waiting for payment" 
          />
        </div>

        {/* --- ANALYTICS PULSE --- */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-brand w-4 h-4" />
            <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Analytics Pulse</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Completion Rate</p>
              <p className="text-2xl font-black text-foreground">{completionRate.toFixed(0)}%</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Avg Order</p>
              <p className="text-2xl font-black text-foreground">${avgOrderValue.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-foreground/40 mb-2">Top Category</p>
              <p className="text-2xl font-black text-foreground uppercase">{topCategory.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* --- LEFT: ASSET MANIFEST --- */}
          <div className="xl:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-5 sm:p-8 border-b border-white/5 flex items-center gap-4 bg-[var(--card-bg-secondary)]">
              <Terminal className="text-brand w-4 h-4" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Asset Manifest</h2>
            </div>
            <div className="md:overflow-x-auto">
              <table className="w-full text-left font-mono text-xs hidden md:table">
                <thead>
                  <tr className="text-white/20 border-b border-white/5 uppercase tracking-widest text-[9px]">
                    <th className="p-8">Asset</th>
                    <th className="p-8">Stock</th>
                    <th className="p-8">Unit Price</th>
                    <th className="p-8 text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8 font-black uppercase group-hover:text-brand transition-colors text-sm">{p.name}</td>
                      <td className={`p-8 font-bold ${p.stock <= 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {p.stock}
                      </td>
                      <td className="p-8 text-white/60">${Number(p.price).toFixed(2)}</td>
                      <td className="p-8">
                         <div className="flex justify-end items-center gap-3">
                            {/* EDIT TRIGGER */}
                            <EditDropModalWrapper product={p} />
                            
                            {/* DELETE TRIGGER */}
                            <DeleteButton id={p.id} />
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="md:hidden divide-y divide-white/5">
                {products.map((p) => (
                  <div key={p.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase text-white">{p.name}</p>
                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">
                          {p.category}
                        </p>
                      </div>
                      <span className={`text-xs font-bold ${p.stock <= 0 ? 'text-red-500' : 'text-white'}`}>
                        {p.stock}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-white/60">${Number(p.price).toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <EditDropModalWrapper product={p} />
                        <DeleteButton id={p.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT: CATEGORY + TRANSMISSION --- */}
          <div className="flex flex-col gap-8">
            <CategoryManager />

            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-5 sm:p-8 border-b border-white/5 flex items-center gap-4 bg-[var(--card-bg-secondary)]">
                <History className="text-brand w-4 h-4" />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Transmission Log</h2>
              </div>
              <div className="p-4 sm:p-5 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
                {orders.length === 0 ? (
                  <div className="p-20 text-center text-white/10 font-mono text-[10px] uppercase tracking-widest">No Signals</div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-4 sm:p-5 rounded-[2rem] bg-[var(--card-bg-secondary)] border border-white/5 hover:border-brand/40 transition-all group relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 relative z-10">
                        <div>
                          <p className="text-[8px] font-mono text-white/30 uppercase mb-2 tracking-tighter">TRANS_ID: {order.id.slice(-8)}</p>
                          <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            order.status === "COMPLETED" ? "bg-brand text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}>
                            {order.status}
                          </div>
                        </div>
                        <p className="text-lg sm:text-xl font-mono font-black text-white">${Number(order.total).toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-2 mb-4 relative z-10">
                        {(order.items as any[])?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[9px] sm:text-[10px] font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="uppercase truncate max-w-[120px]">{item.name}</span>
                            <span className="text-brand">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 relative z-10">
                          <div className="flex items-center gap-2"><Activity size={10} className="text-brand/40" /> {formatOrderTime(new Date(order.createdAt))}</div>
                          <div className="flex items-center gap-3">
                            <span className="uppercase">{formatOrderDate(new Date(order.createdAt))}</span>
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
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, detail, isAlert }: any) {
  return (
    <div className={`bg-[#0d0d0d] border ${isAlert ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-white/10'} p-6 sm:p-10 rounded-[2.5rem] relative group overflow-hidden transition-all duration-500 hover:border-white/30`}>
      <div className={`absolute top-0 right-0 p-6 sm:p-8 ${isAlert ? 'text-red-500/10' : 'text-brand/5'} group-hover:scale-125 transition-transform duration-700`}>
        {icon}
      </div>
      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 font-bold">{label}</p>
      <p className={`text-3xl sm:text-5xl font-black tracking-tighter mb-2 ${isAlert ? 'text-red-500' : 'text-white'}`}>{value}</p>
      <p className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-widest ${isAlert ? 'text-red-500/70' : 'text-brand/50'}`}>{detail}</p>
      <div className={`absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 opacity-20 ${isAlert ? 'bg-red-500' : 'bg-brand'} [clip-path:polygon(100%_0,100%_100%,0_100%)]`} />
    </div>
  );
}
