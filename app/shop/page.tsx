import { prisma } from "@/lib/db";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CategoryFilters from "./category-filters";
import Navigation from "./navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

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
            Curated Assets // Obsidian Grade
          </p>
        </div>
      </section>

      <section className="px-6 pb-12">
        <CategoryFilters />
      </section>

      {/* PRODUCT GALLERY GRID */}
      <main className="px-8 pb-40 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.length === 0 ? (
          <div className="col-span-full py-32 text-center border border-dashed border-[var(--border-color)] rounded-[3rem] bg-[var(--card-bg)]/20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
              <p className="text-[var(--muted-text)] font-mono text-xs uppercase tracking-widest italic">
                System Searching for Assets...
              </p>
            </div>
          </div>
        ) : (
          products.map((product: any) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="group relative block">
              <div className="absolute -inset-[1.5px] bg-gradient-to-br from-brand/40 to-purple-500/40 rounded-[2.6rem] opacity-0 group-hover:opacity-100 blur-[3px] transition-all duration-500" />

              <div className="relative aspect-[4/5] rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                
                {/* STOCK BADGE */}
                <div className="absolute top-6 right-6 z-30 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                  <p className="text-[9px] font-black font-mono text-brand animate-pulse uppercase">
                    {product.stock || 5} Remaining
                  </p>
                </div>

                {/* PRODUCT IMAGE */}
                <div className="w-full h-full bg-[var(--card-bg-secondary)] overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/5 font-black text-9xl select-none uppercase">
                      {product.name ? product.name[0] : "A"}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-8 left-8 right-8 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-[1px] bg-brand" />
                    <p className="text-brand font-mono text-[9px] uppercase tracking-[0.4em] font-bold">
                      {product.category}
                    </p>
                  </div>
                  <h2 className="text-2xl font-bold mb-5 text-[var(--foreground)] group-hover:text-brand transition-colors uppercase">
                    {product.name}
                  </h2>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-[var(--muted-text)] mb-1">MSRP</span>
                      <span className="text-2xl font-black font-mono tracking-tighter">${Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] group-hover:bg-brand group-hover:text-black transition-all shadow-xl">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}