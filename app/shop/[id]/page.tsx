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
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
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
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  
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
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 backdrop-blur-md bg-black/40 border border-white/10 rounded-2xl sm:rounded-full px-4 sm:px-8 py-2.5 sm:py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <Link href="/shop" className="group flex items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
          <span className="text-white font-black tracking-tighter text-[11px] sm:text-sm uppercase">
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

  const currentStock = Number.isFinite(product.stock) ? product.stock : 0;
  const isSoldOut = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const stockPercentage = Math.min((currentStock / 20) * 100, 100);
  const imageList = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const mergedImages = imageList.length > 0 ? imageList : (product.image ? [product.image] : []);
  const mainImage = activeImage || mergedImages[0] || null;
  const currentIndex = mainImage ? Math.max(0, mergedImages.indexOf(mainImage)) : 0;

  const openViewer = (index: number) => {
    if (!mergedImages[index]) return;
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const showPrev = () => {
    if (mergedImages.length === 0) return;
    const nextIndex = (viewerIndex - 1 + mergedImages.length) % mergedImages.length;
    setViewerIndex(nextIndex);
  };

  const showNext = () => {
    if (mergedImages.length === 0) return;
    const nextIndex = (viewerIndex + 1) % mergedImages.length;
    setViewerIndex(nextIndex);
  };

  const handleSwipe = () => {
    if (touchStartX === null || touchEndX === null) return;
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) < 40) return;
    const nextIndex = delta > 0 ? currentIndex + 1 : currentIndex - 1;
    if (mergedImages[nextIndex]) setActiveImage(mergedImages[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-12 transition-colors duration-700 overflow-x-hidden">
      <TopNav />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 pt-24 sm:pt-28 lg:pt-32">
        <div className="relative group">
          <div className={`absolute -inset-10 ${isSoldOut ? 'bg-red-600/10' : 'bg-brand/5'} blur-[120px] rounded-full opacity-50 pointer-events-none`} />
          <div
            className={`aspect-square rounded-[2.5rem] sm:rounded-[3.5rem] bg-white/5 border ${isSoldOut ? 'border-red-600/40 shadow-[0_0_50px_rgba(220,38,38,0.15)]' : 'border-white/10'} overflow-hidden relative backdrop-blur-3xl shadow-2xl`}
            onTouchStart={(e) => setTouchStartX(e.changedTouches[0].clientX)}
            onTouchMove={(e) => setTouchEndX(e.changedTouches[0].clientX)}
            onTouchEnd={() => {
              handleSwipe();
              setTouchStartX(null);
              setTouchEndX(null);
            }}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                onClick={() => openViewer(currentIndex)}
                className={`w-full h-full object-cover transition-all duration-700 ${isSoldOut ? 'grayscale opacity-20 scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'} ${mergedImages.length > 0 ? "cursor-zoom-in" : ""}`}
              />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/5 font-black text-[10rem] sm:text-[15rem] uppercase">
                {product.name?.[0]}
              </div>
            )}
            
            {isSoldOut && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-5 sm:px-8 py-2 sm:py-3 border-[4px] sm:border-[6px] border-red-600 text-red-600 font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] -rotate-12 text-2xl sm:text-4xl bg-black/40 backdrop-blur-sm">
                  Asset Depleted
                </div>
              </div>
            )}
          </div>
          {mergedImages.length > 1 ? (
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mergedImages.map((img: string, index: number) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`h-20 w-20 shrink-0 rounded-2xl border ${img === mainImage ? "border-brand" : "border-white/10"} overflow-hidden bg-white/5`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 justify-center">
                {mergedImages.map((img: string, index: number) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? "bg-brand shadow-[0_0_10px_#00f2ff]" : "bg-white/20"}`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-center">
          <div className={`px-3 py-1 border rounded-full w-fit mb-4 ${isSoldOut ? "bg-red-600/10 border-red-600/40" : "bg-brand/10 border-brand/20"}`}>
            <p className={`font-mono text-[10px] uppercase tracking-[0.3em] font-bold ${isSoldOut ? "text-red-500" : "text-brand"}`}>
              {isSoldOut ? "VAULT STATUS: LOCKED" : (product.category || "General Asset")}
            </p>
          </div>
          
          <h1 className={`text-4xl sm:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter leading-none mb-8 ${isSoldOut ? 'text-white/10' : 'text-white'}`}>
            {product.name}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-10 mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unit Valuation</span>
              <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${isSoldOut ? "text-red-900/30" : "text-white"}`}>
                ${Number(product.price).toFixed(2)}
              </span>
              <span className={`mt-2 text-[10px] font-mono font-bold uppercase tracking-widest ${isSoldOut ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.45)]" : isLowStock ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]" : "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.45)]"}`}>
                {isSoldOut ? "Out of stock" : `${currentStock} remaining`}
              </span>
            </div>

            <div className="flex-1 sm:max-w-[200px] mb-2">
              <div className={`flex justify-between text-[9px] font-black uppercase tracking-widest mb-2 ${isSoldOut ? "text-red-500" : "text-brand"}`}>
                <span>Vault Density</span>
                <span>{isSoldOut ? "0%" : `${currentStock} Units`}</span>
              </div>
              <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${isSoldOut ? "bg-red-600" : "bg-brand shadow-[0_0_15px_#00f2ff]"}`} style={{ width: `${isSoldOut ? 100 : stockPercentage}%` }} />
              </div>
            </div>
          </div>

          <p className={`text-gray-400 text-base sm:text-lg leading-relaxed mb-10 sm:mb-12 italic border-l-2 pl-4 sm:pl-6 mt-8 ${isSoldOut ? 'opacity-20 border-red-900' : 'opacity-80 border-brand/20'}`}>
            "{product.description || "Specifications for this asset are classified."}"
          </p>

          <button 
            onClick={handlePurchase} 
            disabled={isSoldOut || isSyncing} 
            className={`w-full py-5 sm:py-6 font-black rounded-2xl transition-all duration-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] group flex items-center justify-center gap-3 relative overflow-hidden ${!isSoldOut ? "bg-white text-black hover:bg-brand hover:scale-[1.02] shadow-xl" : "bg-red-950/20 text-red-600 cursor-not-allowed border-2 border-red-600/50"}`}
          >
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : isAdded ? <><Check className="w-5 h-5" /> ASSET SECURED</> : isSoldOut ? "Asset Depleted" : <>{'Initiate Purchase'} <Zap className="w-5 h-5 fill-current transition-transform group-hover:rotate-12" /></>}
          </button>
        </div>
      </div>

      {viewerOpen && mergedImages.length > 0 ? (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeViewer}
            className="absolute top-6 right-6 rounded-full border border-white/10 bg-black/60 p-2 text-white/80 hover:text-white"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={showPrev}
            className="absolute left-4 sm:left-8 rounded-full border border-white/10 bg-black/60 p-2 text-white/80 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-4 sm:right-8 rounded-full border border-white/10 bg-black/60 p-2 text-white/80 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="max-w-4xl w-full">
            <img
              src={mergedImages[viewerIndex]}
              alt={`Full view ${viewerIndex + 1}`}
              className="w-full max-h-[80vh] object-contain rounded-3xl border border-white/10"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}