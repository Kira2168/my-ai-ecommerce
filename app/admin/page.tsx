import { prisma } from "@/lib/db";
import { 
  Package, 
  DollarSign, 
  Activity, 
  Terminal, 
  ShieldCheck, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import NewDropModalWrapper from "./new-drop-wrapper"; 
import DeleteButton from "./delete-button"; 

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const revenue = products.reduce((acc, p) => acc + (Number(p.price) * 1.5), 0); 

  return (
    <div className="min-h-screen bg-[#05040a] text-white p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* --- TOP NAVIGATION: BACK TO SITE --- */}
        <div className="flex justify-between items-center mb-12">
            <Link 
              href="/" 
              className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300"
            >
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-brand/30 group-hover:bg-brand/5">
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Exit Terminal</span>
            </Link>
            <div className="h-[1px] flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              Secure Node: 01-Kirubel
            </div>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
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
            label="Revenue" 
            value={`$${revenue.toLocaleString()}`} 
            detail="Protocol: Active" 
          />
          <StatCard 
            icon={<Package />} 
            label="Stock" 
            value={`${totalStock} Units`} 
            detail={`${products.length} Items`}
            isAlert={totalStock < 0} 
          />
          <StatCard 
            icon={<Activity />} 
            label="Uptime" 
            value="99.9%" 
            detail="Node: Stable" 
          />
        </div>

        {/* --- ASSET MANIFEST TABLE --- */}
        <div className="bg-[#0d0d0d] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <Terminal className="text-brand w-4 h-4" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Asset Manifest</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-white/20 border-b border-white/5 uppercase tracking-widest text-[9px]">
                  <th className="p-8">Asset</th>
                  <th className="p-8">Stock</th>
                  <th className="p-8">Price</th>
                  <th className="p-8 text-right">Protocol</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-white/10 uppercase tracking-widest text-[10px]">
                      No assets detected in current sector.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8 font-black uppercase group-hover:text-brand transition-colors">{p.name}</td>
                      <td className={`p-8 font-bold ${p.stock <= 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {p.stock}
                      </td>
                      <td className="p-8 text-white/60">${Number(p.price).toFixed(2)}</td>
                      <td className="p-8 text-right">
                         <DeleteButton id={p.id} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, detail, isAlert }: any) {
  return (
    <div className={`bg-[#0d0d0d] border ${isAlert ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/10'} p-10 rounded-[2.5rem] relative group overflow-hidden transition-all duration-500 hover:border-white/20`}>
      <div className={`absolute top-0 right-0 p-8 ${isAlert ? 'text-red-500/10' : 'text-brand/5'} group-hover:opacity-100 transition-colors scale-150`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4 font-bold">{label}</p>
      <p className={`text-4xl font-black tracking-tighter mb-2 ${isAlert ? 'text-red-500' : 'text-white'}`}>{value}</p>
      <p className={`text-[9px] font-mono uppercase ${isAlert ? 'text-red-500/70' : 'text-brand/50'}`}>{detail}</p>
      
      {/* Decorative corner accent */}
      <div className={`absolute bottom-0 right-0 w-8 h-8 opacity-20 ${isAlert ? 'bg-red-500' : 'bg-brand'} [clip-path:polygon(100%_0,100%_100%,0_100%)]`} />
    </div>
  );
}