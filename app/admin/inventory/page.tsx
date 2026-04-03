import { Terminal } from "lucide-react";
import AdminHeader from "../admin-header";
import { getProductsSafe } from "../admin-data";
import EditDropModalWrapper from "../edit-drop-wrapper";
import DeleteButton from "../delete-button";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const products = await getProductsSafe();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 font-sans">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />

        <div className="flex items-center gap-3 mb-6">
          <Terminal className="text-brand w-5 h-5" />
          <h1 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-foreground">Inventory</h1>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
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
                    <td className={`p-8 font-bold ${p.stock <= 0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                      {p.stock}
                    </td>
                    <td className="p-8 text-white/60">${Number(p.price).toFixed(2)}</td>
                    <td className="p-8">
                      <div className="flex justify-end items-center gap-3">
                        <EditDropModalWrapper product={p} />
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
                    <span className={`text-xs font-bold ${p.stock <= 0 ? "text-red-500" : "text-white"}`}>
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
      </div>
    </div>
  );
}
