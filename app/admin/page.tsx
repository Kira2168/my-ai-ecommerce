"use client";
import { useState } from "react";
import { Plus, Package, DollarSign, Activity, Terminal } from "lucide-react";
import NewDropModal from "./new-drop"; // Ensure this filename matches your modal file

export default function AdminDashboard() {
  // 1. ADD STATE TO TRACK MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 pt-32 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">Command Center</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--muted-text)]">Root Access Granted // System Stable</p>
          </div>

          {/* 2. ADD ONCLICK TO OPEN MODAL */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-brand text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)]"
          >
            <Plus className="w-4 h-4" /> Initialize New Drop
          </button>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard icon={<DollarSign className="text-brand" />} label="Total Revenue" value="$42,090.00" />
          <StatCard icon={<Package className="text-brand" />} label="Active Inventory" value="12 Units" />
          <StatCard icon={<Activity className="text-brand" />} label="System Uptime" value="99.9%" />
        </div>

        {/* INVENTORY TERMINAL */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[var(--border-color)] flex items-center gap-4 bg-[var(--card-bg-secondary)]/50">
            <Terminal className="text-brand w-5 h-5" />
            <h2 className="font-mono text-xs uppercase tracking-[0.4em] font-bold">Active Manifest</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-[var(--muted-text)] border-b border-[var(--border-color)]">
                  <th className="p-6 uppercase tracking-widest">Identifier</th>
                  <th className="p-6 uppercase tracking-widest">Category</th>
                  <th className="p-6 uppercase tracking-widest">Price</th>
                  <th className="p-6 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <TableRow name="NEURAL LINK V1" category="TECH" price="$2,400" />
                <TableRow name="OBSIDIAN CLOAK" category="APPAREL" price="$850" />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. RENDER MODAL ONLY WHEN OPEN */}
      {isModalOpen && (
        <NewDropModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

// Sub-components kept as they were (added alignment fixes)
function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--muted-text)] mb-2 font-bold">{label}</p>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}

function TableRow({ name, category, price }: { name: string, category: string, price: string }) {
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="p-6 font-bold group-hover:text-brand transition-colors">{name}</td>
      <td className="p-6 text-[var(--muted-text)]">{category}</td>
      <td className="p-6">{price}</td>
      <td className="p-6 text-right">
        <button className="text-red-500/50 hover:text-red-500 uppercase text-[10px] tracking-widest font-bold transition-colors">Decommission</button>
      </td>
    </tr>
  );
}