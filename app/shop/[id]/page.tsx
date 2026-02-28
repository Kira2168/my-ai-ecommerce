"use client";

import { useCart } from "@/lib/context/cart-context";
import { 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ShoppingBag, 
  Radio, 
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const { items, addToCart, setIsOpen } = useCart(); 
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Asset not found");
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, [id]);

  const TopNav = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-[var(--nav-bg)] border border-[var(--border-color)] rounded-full px-8 py-3 shadow-2xl">
        <Link href="/shop" className="group flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
          <span className="text-[var(--foreground)] font-black tracking-tighter text-sm uppercase">
            BACK TO <span className="text-brand">COLLECTION</span>
          </span>
        </Link>

        <button 
          onClick={() => setIsOpen(true)} 
          className="flex items-center gap-2 relative group"
        >
          <div className="p-2 bg-white/5 rounded-full border border-[var(--border-color)] group-hover:border-brand/50 transition-colors">
            <ShoppingBag className="w-4 h-4 text-[var(--foreground)]" />
          </div>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-black text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)] animate-in zoom-in">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <TopNav />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="font-mono text-brand text-[10px] uppercase tracking-[0.5em] animate-pulse">
            CONNECTING TO SECURE NODE...
          </p>
        </div>
      </div>
    );
  }

  const currentStock = product.stock || 0;
  const isSoldOut = currentStock <= 0;
  const stockPercentage = Math.min((currentStock / 20) * 100, 100);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 lg:p-12 transition-colors duration-700">
      <TopNav />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 pt-32">
        
        {/* LEFT: IMAGE SECTION */}
        <div className="relative group">
          <div className={`absolute -inset-10 ${isSoldOut ? 'bg-red-600/10' : 'bg-brand/5'} blur-[120px] rounded-full opacity-50 pointer-events-none`} />
          <div className={`aspect-square rounded-[3.5rem] bg-white/5 border ${isSoldOut ? 'border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.15)]' : 'border-[var(--border-color)]'} overflow-hidden relative backdrop-blur-3xl shadow-2xl transition-all duration-700`}>
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-all duration-700 ${isSoldOut ? 'grayscale opacity-20 scale-110 blur-[2px]' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`} 
              />
            ) : (
              <div className="w-full h-full bg-[var(--card-bg-secondary)] flex items-center justify-center">
                <span className="text-[var(--foreground)]/5 font-black text-[15rem] select-none uppercase">
                  {product.name?.[0]}
                </span>
              </div>
            )}
            
            {/* VIBRANT RED OVERLAY STAMP */}
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Outer Glow for the stamp */}
                  <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative px-8 py-3 border-[6px] border-red-600 text-red-600 font-black uppercase tracking-[0.4em] rotate-[-12deg] text-4xl shadow-[0_0_40px_rgba(220,38,38,0.6)] bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
                    Asset Depleted
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO SECTION */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 border rounded-full ${isSoldOut ? "bg-red-600/10 border-red-600/40" : "bg-brand/10 border-brand/20"}`}>
               <p className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold ${isSoldOut ? "text-red-500" : "text-brand"}`}>
                 {isSoldOut ? "VAULT STATUS: LOCKED" : (product.category || "General Asset")}
               </p>
            </div>
          </div>
          
          <h1 className={`text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8 ${isSoldOut ? 'text-white/10' : ''}`}>
            {product.name}
          </h1>
          
          <div className="flex items-end gap-10 mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-widest mb-1">Unit Valuation</span>
              <span className={`text-5xl font-mono font-black tracking-tight ${isSoldOut ? "text-red-900/30" : ""}`}>
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            {/* NEON STOCK INDICATOR */}
            <div className="flex-1 max-w-[200px] mb-2">
              <div className={`flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 ${isSoldOut ? "text-red-500" : "text-brand"}`}>
                <span>Vault Density</span>
                <span>{isSoldOut ? "0%" : `${currentStock} Units`}</span>
              </div>
              <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isSoldOut ? "bg-red-600 shadow-[0_0_15px_#dc2626]" : "bg-brand shadow-[0_0_15px_#00f2ff]"}`} 
                  style={{ width: `${isSoldOut ? 100 : stockPercentage}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8 mt-4">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSoldOut ? "bg-red-600" : "bg-brand"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSoldOut ? "bg-red-600" : "bg-brand"}`}></span>
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isSoldOut ? "text-red-600" : "text-brand"}`}>
              {isSoldOut ? "SIGNAL: ACCESS TERMINATED" : "SIGNAL: OPTIMAL // SECURE NODE"}
            </span>
          </div>

          <p className={`text-[var(--muted-text)] text-lg leading-relaxed mb-12 italic border-l-2 pl-6 transition-all ${isSoldOut ? 'opacity-20 border-red-900' : 'opacity-80 border-brand/20'}`}>
            "{product.description || "Specifications for this asset are classified."}"
          </p>

          {/* ACTION BUTTON */}
          <button 
            onClick={() => { if(!isSoldOut) { addToCart(product); setIsOpen(true); } }}
            disabled={isSoldOut}
            className={`w-full py-6 font-black rounded-2xl transition-all duration-500 uppercase tracking-[0.2em] group flex items-center justify-center gap-3 ${
              !isSoldOut 
                ? "bg-white text-black hover:bg-brand hover:scale-[1.02] shadow-[0_20px_60px_rgba(0,242,255,0.1)]" 
                : "bg-red-950/20 text-red-600 cursor-not-allowed border-2 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.1)]"
            }`}
          >
            {isSoldOut ? "Asset Depleted // Out of Stock" : "Initiate Purchase"}
            {!isSoldOut && <Zap className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" />}
          </button>
          
          {/* TRUST BADGES */}
          <div className={`grid grid-cols-3 gap-4 mt-8 transition-opacity duration-700 ${isSoldOut ? 'opacity-10' : ''}`}>
             {[
               { Icon: ShieldCheck, label: "Encrypted" },
               { Icon: Globe, label: "Global" },
               { Icon: Radio, label: "Live Sync" }
             ].map((badge, i) => (
               <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5 text-center">
                  <badge.Icon className="w-4 h-4 mx-auto mb-2 text-brand" />
                  <p className="text-[8px] uppercase font-bold text-gray-500 tracking-widest">{badge.label}</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}