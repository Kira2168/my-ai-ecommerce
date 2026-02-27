"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import ThemeToggle from "./theme-toggle";

export default function Navigation({ minimal = false }: { minimal?: boolean }) {
  const { items, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  
  // Fixes the Hydration Mismatch error
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  if (!mounted) return <div className="h-[100px]" />; // Spacer while loading

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none">
     <div className="max-w-7xl mx-auto flex justify-between items-center 
                backdrop-blur-md bg-[var(--nav-bg)] 
                border border-[var(--border-color)] 
                rounded-full px-8 py-4 shadow-xl 
                pointer-events-auto transition-all duration-500">
        
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-brand blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.5)]">
              <span className="text-black font-black text-sm">FS</span>
            </div>
          </div>
          <span className="text-[var(--foreground)] font-black tracking-tighter text-2xl uppercase">
            FUTURE<span className="text-brand">SHOP</span>
          </span>
        </Link>

        {/* ACTIONS */}
        <div className="flex gap-4 items-center">
          <ThemeToggle />
          {!minimal && (
            <>
              <div className="h-4 w-px bg-[var(--border-color)]" />
              <button onClick={() => setIsOpen(true)} className="relative group active:scale-90 transition-transform p-2">
                <ShoppingBag className="w-5 h-5 text-[var(--foreground)] group-hover:text-brand transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}