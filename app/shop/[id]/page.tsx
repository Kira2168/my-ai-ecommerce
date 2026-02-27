"use client";

import { useCart } from "@/lib/context/cart-context";
import { ArrowLeft, Zap, ShieldCheck, Globe, ShoppingBag, Radio } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { items, addItem, setIsOpen } = useCart();
  const [product, setProduct] = useState<any>(null);
  
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error("Fetch Error:", err));
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center font-mono text-brand animate-pulse text-xs tracking-[0.5em]">
        CONNECTING TO SECURE NODE...
      </div>
    );
  }

  // Calculate percentage for the stock bar
  const stockPercentage = Math.min(((product.stock || 10) / 20) * 100, 100);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 lg:p-12">
      
      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-[var(--nav-bg)] border border-[var(--border-color)] rounded-full px-8 py-3 shadow-2xl">
          <Link href="/shop" className="group flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
            <span className="text-[var(--foreground)] font-black tracking-tighter text-sm uppercase">
              BACK TO <span className="text-brand">COLLECTION</span>
            </span>
          </Link>

          <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 relative group">
            <div className="p-2 bg-white/5 rounded-full border border-[var(--border-color)] group-hover:border-brand/50 transition-colors">
              <ShoppingBag className="w-4 h-4" />
            </div>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-black text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 pt-32">
        
        {/* LEFT: IMAGE SECTION WITH AMBIENT GLOW */}
        <div className="relative group">
          <div className="absolute -inset-10 bg-brand/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
          <div className="aspect-square rounded-[3.5rem] bg-white/5 border border-[var(--border-color)] overflow-hidden relative backdrop-blur-3xl shadow-2xl">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full bg-[var(--card-bg-secondary)] flex items-center justify-center">
                <span className="text-[var(--foreground)]/5 font-black text-[15rem] select-none uppercase">
                  {product.name?.[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO SECTION */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
               <p className="text-brand font-mono text-[10px] uppercase tracking-[0.3em] font-bold">{product.category}</p>
            </div>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8">
            {product.name}
          </h1>
          
          <div className="flex items-end gap-10 mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-widest mb-1">Unit Valuation</span>
              <span className="text-5xl font-mono font-black tracking-tight">${Number(product.price).toFixed(2)}</span>
            </div>

            {/* NEON STOCK INDICATOR */}
            <div className="flex-1 max-w-[200px] mb-2">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-brand mb-2">
                <span>Vault Status</span>
                <span>{product.stock || 10} Units</span>
              </div>
              <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand shadow-[0_0_15px_#00f2ff] transition-all duration-1000" 
                  style={{ width: `${stockPercentage}%` }} 
                />
              </div>
            </div>
          </div>

          {/* SIGNAL OPTIMAL INDICATOR */}
          <div className="flex items-center gap-2 mb-8 mt-4">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </div>
            <span className="text-[10px] font-mono text-brand uppercase tracking-widest font-bold">Signal: Optimal // Secure Node</span>
          </div>

          <p className="text-[var(--muted-text)] text-lg leading-relaxed mb-12 italic opacity-80 border-l-2 border-brand/20 pl-6">
            "{product.description || "Specifications for this asset are classified."}"
          </p>

          {/* ACTION BUTTON */}
          <button 
            onClick={() => { addItem(product); setIsOpen(true); }}
            className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-brand transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_60px_rgba(255,255,255,0.1)] uppercase tracking-[0.2em] group flex items-center justify-center gap-3"
          >
            Initiate Purchase
            <Zap className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" />
          </button>
          
          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-4 mt-8">
             {[
               { Icon: ShieldCheck, label: "Encrypted" },
               { Icon: Globe, label: "Global" },
               { Icon: Radio, label: "Live Sync" }
             ].map((item, i) => (
               <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5 text-center hover:bg-white/10 transition-colors">
                  <item.Icon className="w-4 h-4 mx-auto mb-2 text-brand" />
                  <p className="text-[8px] uppercase font-bold text-gray-500 tracking-widest">{item.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}