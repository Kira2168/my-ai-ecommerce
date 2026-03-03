"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, ShieldCheck, Terminal, Search, Activity } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CategoryFilters from "./category-filters";
import Navigation from "./navigation";
import QuickAddButton from "./add-button";

function ShopContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Asset Sync Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

 // This logic now checks the name AND the category for your search word
const filteredProducts = products.filter(p => {
  const searchTerm = searchQuery.toLowerCase();
  
  // Check if search matches Name OR Category (e.g., "shirt" matches "Apparel")
  const matchesSearch = 
    p.name.toLowerCase().includes(searchTerm) || 
    p.category?.toLowerCase().includes(searchTerm);

  // Still respect the category buttons
  const matchesCategory = 
    activeCategory === "All" || 
    p.category?.toLowerCase() === activeCategory.toLowerCase();

  return matchesSearch && matchesCategory;
});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
        <p className="font-mono text-brand text-[10px] uppercase tracking-[0.5em]">Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-700 relative">
      
      {/* RESTORED: Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <Navigation />

      {/* SESSION INDICATOR */}
      {orderId && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-500">
          <div className="bg-background/40 backdrop-blur-xl border border-brand/30 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-xl">
            <ShieldCheck className="w-3 h-3 text-brand" />
            <span className="text-[9px] font-mono text-brand uppercase tracking-[0.2em]">
              Secure Link: <span className="text-foreground/70">{orderId.slice(0, 8)}</span>
            </span>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="pt-52 pb-10 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-150 bg-brand/10 blur-[140px] rounded-full -z-10 animate-pulse" />
        <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-none mb-6">
          <span className="block text-foreground uppercase">THE</span>
          <span className="block italic text-transparent bg-clip-text bg-gradient-to-b from-brand to-brand/20 uppercase">DROP.</span>
        </h1>

        {/* FUNCTIONAL SEARCH BAR */}
        <div className="max-w-md mx-auto mt-12 relative group">
          <div className="absolute -inset-1 bg-brand/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
          <div className="relative flex items-center bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3 backdrop-blur-md">
            <Terminal className="w-4 h-4 text-brand/50 mr-3" />
            <input 
              type="text"
              placeholder="QUERY_ASSET_DATABASE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] font-mono tracking-widest w-full text-foreground placeholder:text-foreground/20 uppercase"
            />
            <Search className="w-4 h-4 text-foreground/20" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-12 mt-10">
        <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </section>

      {/* PRODUCT GRID */}
      <main className="px-8 pb-40 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredProducts.map((product) => {
          const isSoldOut = product.stock <= 0;
          return (
            <div key={product.id} className="group relative block animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* RESTORED: Hover Glow */}
              <div className={`absolute -inset-[1.5px] rounded-[2.6rem] opacity-0 group-hover:opacity-100 blur-[3px] transition-all duration-500 bg-gradient-to-br ${isSoldOut ? "from-red-600/40 to-red-900/40" : "from-brand/40 to-purple-500/40"}`} />

              <div className={`relative aspect-4/5 rounded-[2.5rem] bg-foreground/5 border border-foreground/10 overflow-hidden shadow-2xl transition-all duration-500 ${!isSoldOut ? "group-hover:-translate-y-2" : "opacity-80"}`}>
                <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" />
                
                {/* RESTORED: Image Zoom Effect */}
                <div className={`w-full h-full overflow-hidden transition-all duration-700 ${isSoldOut ? "grayscale opacity-40" : "grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100"}`}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/5 font-black text-9xl">{product.name[0]}</div>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-background via-background/80 to-transparent">
                  <p className={`font-mono text-[9px] uppercase tracking-[0.4em] font-bold mb-2 ${isSoldOut ? 'text-red-500' : 'text-brand'}`}>
                    {isSoldOut ? "ARCHIVE" : product.category}
                  </p>
                  <h2 className="text-2xl font-bold mb-5 uppercase text-foreground group-hover:text-brand transition-colors">{product.name}</h2>
                  <div className="flex justify-between items-center relative z-40">
                    <span className="text-2xl font-black font-mono text-foreground">${Number(product.price).toFixed(2)}</span>
                    {!isSoldOut && <QuickAddButton product={product} orderId={orderId} />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ShopContent />
    </Suspense>
  );
}