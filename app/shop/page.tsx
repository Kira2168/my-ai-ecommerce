"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import CategoryFilters from "./category-filters";
import Navigation from "./navigation";
import QuickAddButton from "./add-button";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  // 1. Fetch products from your API route on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to sync assets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // 2. Logic: Filter products based on active state
  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin mb-4" />
        <p className="font-mono text-brand text-[10px] uppercase tracking-[0.5em]">Establishing Secure Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden transition-colors duration-700">
      <Navigation />

      {/* HERO SECTION */}
      <section className="pt-52 pb-10 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-600/10 blur-[140px] rounded-full -z-10 animate-pulse" />
        <div className="max-w-4xl mx-auto relative">
          <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-none mb-6 select-none">
            <span className="block text-[var(--foreground)]">THE</span>
            <span className="block italic text-transparent bg-clip-text bg-gradient-to-b from-brand to-brand/20 uppercase">DROP.</span>
          </h1>
          <p className="text-[var(--muted-text)] font-mono text-[10px] uppercase tracking-[0.6em] mb-12 opacity-80">
            Curated Assets // Sector: {activeCategory}
          </p>
        </div>
      </section>

      {/* FILTER SECTION */}
      <section className="px-6 pb-12">
        <CategoryFilters 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </section>

      {/* PRODUCT GALLERY GRID */}
      <main className="px-8 pb-40 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-32 text-center border border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--card-bg)]/20">
            <div className="flex flex-col items-center gap-4">
              <p className="text-[var(--muted-text)] font-mono text-xs uppercase tracking-widest italic">
                No Assets Found in This Sector.
              </p>
            </div>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isSoldOut = product.stock <= 0;

            return (
              <div key={product.id} className="group relative block animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`absolute -inset-[1.5px] rounded-[2.6rem] opacity-0 group-hover:opacity-100 blur-[3px] transition-all duration-500 bg-gradient-to-br ${isSoldOut ? "from-red-600/40 to-red-900/40" : "from-brand/40 to-purple-500/40"}`} />

                <div className={`relative aspect-[4/5] rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-2xl transition-all duration-500 ${!isSoldOut ? "group-hover:-translate-y-2" : "opacity-80"}`}>
                  
                  <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {product.name}</span>
                  </Link>

                  <div className={`absolute top-6 right-6 z-30 px-3 py-1 backdrop-blur-md border rounded-full transition-colors ${isSoldOut ? "bg-red-600/20 border-red-500/50" : "bg-black/60 border-white/10"}`}>
                    <p className={`text-[9px] font-black font-mono uppercase tracking-widest ${isSoldOut ? "text-red-500" : "text-brand animate-pulse"}`}>
                      {isSoldOut ? "Asset Depleted" : `${product.stock} Remaining`}
                    </p>
                  </div>

                  <div className={`w-full h-full bg-[var(--card-bg-secondary)] overflow-hidden transition-all duration-700 ${isSoldOut ? "grayscale opacity-40 scale-100" : "grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100"}`}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/5 font-black text-9xl select-none uppercase">
                        {product.name?.[0]}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-[1px] ${isSoldOut ? "bg-red-500" : "bg-brand"}`} />
                      <p className={`${isSoldOut ? "text-red-500" : "text-brand"} font-mono text-[9px] uppercase tracking-[0.4em] font-bold`}>
                        {isSoldOut ? "ARCHIVE" : product.category}
                      </p>
                    </div>
                    
                    <h2 className={`text-2xl font-bold mb-5 uppercase transition-colors ${isSoldOut ? "text-white/20" : "text-[var(--foreground)] group-hover:text-brand"}`}>
                      {product.name}
                    </h2>

                    <div className="flex justify-between items-center relative z-40">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-[var(--muted-text)] mb-1">MSRP</span>
                        <span className={`text-2xl font-black font-mono tracking-tighter ${isSoldOut ? "text-white/20" : "text-[var(--foreground)]"}`}>
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      {!isSoldOut && <QuickAddButton product={product} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}