import { db } from "@/lib/db";
import { 
  Package, 
  DollarSign, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  ArrowLeft,
  ShoppingCart,
  History,
  Edit2
} from "lucide-react";
import Link from "next/link";
import NewDropModalWrapper from "./new-drop-wrapper"; 
import EditDropModalWrapper from "@/app/admin/edit-drop-wrapper";
import DeleteButton from "./delete-button"; 

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

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string | null;
  category: string;
  description: string;
  createdAt: Date;
};

type AdminOrder = {
  id: string;
  total: number;
  status: string;
  items: any[];
  createdAt: Date;
};

async function getProductsSafe(): Promise<AdminProduct[]> {
  try {
    const rows = await db.product.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      price: Number(row.price ?? 0),
      stock: Number((row as any).stock ?? 0),
      image: ((row as any).image ?? null) as string | null,
      category: String((row as any).category ?? "TECH"),
      description: String((row as any).description ?? ""),
      createdAt: (row as any).createdAt ? new Date((row as any).createdAt) : new Date(0),
    }));
  } catch (error) {
    console.error("ADMIN_PRODUCT_FETCH_FAILED:", error);

    const cols = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Product'
    `;

    const set = new Set(cols.map((c) => c.column_name));
    const selectParts = [
      set.has("id") ? `"id"` : `''::text AS "id"`,
      set.has("name") ? `"name"` : `''::text AS "name"`,
      set.has("price") ? `"price"` : `0::double precision AS "price"`,
      set.has("stock") ? `"stock"` : `0::integer AS "stock"`,
      set.has("image") ? `"image"` : `NULL::text AS "image"`,
      set.has("category") ? `"category"` : `'TECH'::text AS "category"`,
      set.has("description") ? `"description"` : `''::text AS "description"`,
      set.has("createdAt") ? `"createdAt"` : `NOW() AS "createdAt"`,
    ];

    const orderBy = set.has("createdAt") ? ` ORDER BY "createdAt" DESC` : "";
    const query = `SELECT ${selectParts.join(", ")} FROM "Product"${orderBy}`;
    const rows = await db.$queryRawUnsafe<any[]>(query);

    return rows.map((row) => ({
      id: String(row.id ?? ""),
      name: String(row.name ?? "UNKNOWN"),
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      image: (row.image ?? null) as string | null,
      category: String(row.category ?? "TECH"),
      description: String(row.description ?? ""),
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
    }));
  }
}

async function getOrdersSafe(): Promise<AdminOrder[]> {
  try {
    const rows = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 30 });
    return rows.map((row) => ({
      id: row.id,
      total: Number(row.total ?? 0),
      status: row.status ?? "PENDING",
      items: Array.isArray(row.items) ? (row.items as any[]) : [],
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
    }));
  } catch (error) {
    console.error("ADMIN_ORDER_FETCH_FAILED:", error);

    const cols = await db.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Order'
    `;

    const set = new Set(cols.map((c) => c.column_name));
    const selectParts = [
      set.has("id") ? `"id"` : `''::text AS "id"`,
      set.has("total") ? `"total"` : `0::double precision AS "total"`,
      set.has("status") ? `"status"` : `'PENDING'::text AS "status"`,
      set.has("items") ? `"items"` : `'[]'::jsonb AS "items"`,
      set.has("createdAt") ? `"createdAt"` : `NOW() AS "createdAt"`,
    ];

    const orderBy = set.has("createdAt") ? ` ORDER BY "createdAt" DESC` : "";
    const query = `SELECT ${selectParts.join(", ")} FROM "Order"${orderBy} LIMIT 30`;
    const rows = await db.$queryRawUnsafe<any[]>(query);

    return rows.map((row) => ({
      id: String(row.id ?? ""),
      total: Number(row.total ?? 0),
      status: String(row.status ?? "PENDING"),
      items: Array.isArray(row.items) ? row.items : [],
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(0),
    }));
  }
}

export default async function AdminDashboard() {
  const [products, orders] = await Promise.all([getProductsSafe(), getOrdersSafe()]);

  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  
  const totalRevenue = orders
    .filter(o => o.status === "COMPLETED")
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  const liveCarts = orders.filter(
    o => o.status === "PENDING" && Array.isArray(o.items) && o.items.length > 0
  );

  return (
    <div className="min-h-screen bg-[#05040a] text-white p-8 pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- NAVIGATION --- */}
        <div className="flex justify-between items-center mb-12">
            <Link href="/" className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-brand/30 group-hover:bg-brand/5">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Exit Terminal</span>
            </Link>
            <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Secure Node: 01-Kirubel</div>
        </div>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span className="text-brand font-mono text-[9px] uppercase tracking-[0.4em] font-bold">Terminal Authenticated</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase">Command Center</h1>
          </div>
          <NewDropModalWrapper />
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
            label="Live Carts" 
            value={liveCarts.length} 
            detail="Active Intent Detected" 
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* --- LEFT: ASSET MANIFEST --- */}
          <div className="xl:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.01]">
              <Terminal className="text-brand w-4 h-4" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Asset Manifest</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
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
            </div>
          </div>

          {/* --- RIGHT: TRANSMISSION LOG --- */}
          <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.01]">
              <History className="text-brand w-4 h-4" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Transmission Log</h2>
            </div>
            <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
              {orders.length === 0 ? (
                <div className="p-20 text-center text-white/10 font-mono text-[10px] uppercase tracking-widest">No Signals</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-brand/40 transition-all group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <p className="text-[8px] font-mono text-white/30 uppercase mb-2 tracking-tighter">TRANS_ID: {order.id.slice(-8)}</p>
                        <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                          order.status === "COMPLETED" ? "bg-brand text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {order.status}
                        </div>
                      </div>
                      <p className="text-xl font-mono font-black text-white">${Number(order.total).toFixed(2)}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4 relative z-10">
                      {(order.items as any[])?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] font-mono text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <span className="uppercase truncate max-w-[120px]">{item.name}</span>
                          <span className="text-brand">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-white/20 relative z-10">
                        <div className="flex items-center gap-2"><Activity size={10} className="text-brand/40" /> {formatOrderTime(new Date(order.createdAt))}</div>
                        <span className="uppercase">{formatOrderDate(new Date(order.createdAt))}</span>
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
  );
}

function StatCard({ icon, label, value, detail, isAlert }: any) {
  return (
    <div className={`bg-[#0d0d0d] border ${isAlert ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.1)]' : 'border-white/10'} p-10 rounded-[2.5rem] relative group overflow-hidden transition-all duration-500 hover:border-white/30`}>
      <div className={`absolute top-0 right-0 p-8 ${isAlert ? 'text-red-500/10' : 'text-brand/5'} group-hover:scale-125 transition-transform duration-700`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 font-bold">{label}</p>
      <p className={`text-5xl font-black tracking-tighter mb-2 ${isAlert ? 'text-red-500' : 'text-white'}`}>{value}</p>
      <p className={`text-[10px] font-mono uppercase tracking-widest ${isAlert ? 'text-red-500/70' : 'text-brand/50'}`}>{detail}</p>
      <div className={`absolute bottom-0 right-0 w-10 h-10 opacity-20 ${isAlert ? 'bg-red-500' : 'bg-brand'} [clip-path:polygon(100%_0,100%_100%,0_100%)]`} />
    </div>
  );
}