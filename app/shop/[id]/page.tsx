"use client";

import React, { useEffect, useState, useTransition, use } from "react";
import { useCart } from "@/lib/context/cart-context";
import { 
  ArrowLeft, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ShoppingBag, 
  Radio, 
  Loader2,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { addItemToOrder, createDraftOrder } from "@/lib/actions/checkout";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React 'use' hook
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();
  const pathname = usePathname();

  const { items, addToCart, setIsOpen } = useCart(); 
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, startTransition] = useTransition();
  const [isAdded, setIsAdded] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  // Optimized Fetch Logic
  useEffect(() => {
    let isCancelled = false;

    async function fetchProduct() {
      // Robust ID validation
      if (!id || id === "undefined" || typeof id !== "string") return;

      setLoading(true);
      setError(false);
      
      try {
        const res = await fetch(`/api/products/${id}`, {
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error("Asset not found");
        }

        const data = await res.json();
        
        if (!isCancelled) {
          setProduct(data);
        }
      } catch (err) {
        console.error("FETCH_CRITICAL_FAILURE:", err);
        if (!isCancelled) setError(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => { isCancelled = true; };
  }, [id]);

  const handlePurchase = async () => {
    if (!product || product.stock <= 0 || isSyncing) return;

    addToCart(product);
    setIsOpen(true);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    startTransition(async () => {
      let currentOrderId = orderId;

      if (!currentOrderId) {
        const created = await createDraftOrder();
        if (created.success && created.orderId) {
          currentOrderId = created.orderId;
          const params = new URLSearchParams(searchParams.toString());
          params.set("orderId", currentOrderId);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
      }

      if (currentOrderId) {
        await addItemToOrder(currentOrderId, {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image ?? null,
          category: product.category,
        });
      }
    });
  };

  const TopNav = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center backdrop-blur-md bg-black/40 border border-white/10 rounded-full px-8 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <Link href="/shop" className="group flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
          <span className="text-white font-black tracking-tighter text-sm uppercase">
            BACK TO <span className="text-brand">COLLECTION</span>
          </span>
        </Link>

        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 relative group">
          <div className="p-2 bg-white/5 rounded-full border border-white/10 group-hover:border-brand/50 transition-colors">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand text-black text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_10px_#00f2ff]">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <TopNav />
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
        <h2 className="text-4xl font-black uppercase italic mb-2">Signal Lost</h2>
        <p className="text-white/40 font-mono text-xs tracking-[0.3em] mb-8 uppercase">
          ID: {id?.slice(0, 12)}... NOT FOUND
        </p>
        <Link href="/shop" className="px-8 py-3 bg-brand text-black font-bold rounded-xl uppercase text-xs tracking-widest hover:scale-105 transition-transform">
          Return to Hub
        </Link>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <TopNav />
        <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="font-mono text-brand text-[10px] uppercase tracking-[0.5em] animate-pulse">Establishing Secure Link...</p>
      </div>
    );
  }

  const currentStock = product.stock || 0;
  const isSoldOut = currentStock <= 0;
  const stockPercentage = Math.min((currentStock / 20) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 transition-colors duration-700 overflow-x-hidden">
      <TopNav />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 pt-32">
        <div className="relative group">
          <div className={`absolute -inset-10 ${isSoldOut ? 'bg-red-600/10' : 'bg-brand/5'} blur-[120px] rounded-full opacity-50 pointer-events-none`} />
          <div className={`aspect-square rounded-[3.5rem] bg-white/5 border ${isSoldOut ? 'border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.15)]' : 'border-white/10'} overflow-hidden relative backdrop-blur-3xl shadow-2xl`}>
            {product.image ? (
              <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-all duration-700 ${isSoldOut ? 'grayscale opacity-20 scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`} />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/5 font-black text-[15rem] uppercase">
                {product.name?.[0]}
              </div>
            )}
            
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-8 py-3 border-[6px] border-red-600 text-red-600 font-black uppercase tracking-[0.4em] -rotate-12 text-4xl bg-black/40 backdrop-blur-sm">
                  Asset Depleted
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className={`px-3 py-1 border rounded-full w-fit mb-4 ${isSoldOut ? "bg-red-600/10 border-red-600/40" : "bg-brand/10 border-brand/20"}`}>
            <p className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold ${isSoldOut ? "text-red-500" : "text-brand"}`}>
              {isSoldOut ? "VAULT STATUS: LOCKED" : (product.category || "General Asset")}
            </p>
          </div>
          
          <h1 className={`text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8 ${isSoldOut ? 'text-white/10' : 'text-white'}`}>
            {product.name}
          </h1>
          
          <div className="flex items-end gap-10 mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unit Valuation</span>
              <span className={`text-5xl font-mono font-black tracking-tight ${isSoldOut ? "text-red-900/30" : "text-white"}`}>
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            <div className="flex-1 max-w-50 mb-2">
              <div className={`flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 ${isSoldOut ? "text-red-500" : "text-brand"}`}>
                <span>Vault Density</span>
                <span>{isSoldOut ? "0%" : `${currentStock} Units`}</span>
              </div>
              <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${isSoldOut ? "bg-red-600" : "bg-brand shadow-[0_0_15px_#00f2ff]"}`} style={{ width: `${isSoldOut ? 100 : stockPercentage}%` }} />
              </div>
            </div>
          </div>

          <p className={`text-gray-400 text-lg leading-relaxed mb-12 italic border-l-2 pl-6 mt-8 ${isSoldOut ? 'opacity-20 border-red-900' : 'opacity-80 border-brand/20'}`}>
            "{product.description || "Specifications for this asset are classified."}"
          </p>

          <button 
            onClick={handlePurchase} 
            disabled={isSoldOut || isSyncing} 
            className={`w-full py-6 font-black rounded-2xl transition-all duration-500 uppercase tracking-[0.2em] group flex items-center justify-center gap-3 relative overflow-hidden ${!isSoldOut ? "bg-white text-black hover:bg-brand hover:scale-[1.02] shadow-xl" : "bg-red-950/20 text-red-600 cursor-not-allowed border-2 border-red-600/50"}`}
          >
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : isAdded ? <><Check className="w-5 h-5" /> ASSET SECURED</> : isSoldOut ? "Asset Depleted" : <>{'Initiate Purchase'} <Zap className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}