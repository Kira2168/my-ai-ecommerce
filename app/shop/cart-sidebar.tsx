"use client";
import { useCart } from "@/lib/context/cart-context";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartSidebar() {
  const { items, isOpen, setIsOpen } = useCart();
  const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <>
      {/* Dark Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-500" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[var(--card-bg)] border-l border-[var(--border-color)] z-[70] transition-transform duration-500 ease-in-out shadow-2xl ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-8 h-full flex flex-col">
          
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black italic flex items-center gap-3 text-[var(--foreground)]">
              <ShoppingBag className="text-brand w-6 h-6" /> YOUR BAG
            </h2>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--foreground)]"
            >
              <X className="w-6 h-6" />
            </button>
          </header>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <ShoppingBag className="w-12 h-12 mb-4" />
                <p className="font-mono text-xs uppercase tracking-[0.3em]">Bag is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="group flex justify-between items-center p-5 bg-[var(--card-bg-secondary)] rounded-3xl border border-[var(--border-color)] hover:border-brand/30 transition-all">
                  <div>
                    <p className="font-bold text-[var(--foreground)] text-lg tracking-tight">{item.name}</p>
                    <p className="text-brand font-mono text-xs italic mt-1">
                      ${item.price.toFixed(2)} <span className="text-[var(--muted-text)] ml-2">x {item.quantity}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[var(--foreground)]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Area */}
          <footer className="pt-8 border-t border-[var(--border-color)] mt-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-[var(--muted-text)] uppercase font-bold text-[10px] tracking-[0.2em] block mb-1">Subtotal</span>
                <span className="text-4xl font-black text-[var(--foreground)] tracking-tighter">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/shop/checkout"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between w-full py-6 px-8 bg-brand text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,242,255,0.2)]"
            >
              <span className="uppercase tracking-widest text-sm">Initiate Checkout</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <p className="text-center mt-6 text-[8px] uppercase tracking-[0.4em] text-[var(--muted-text)] opacity-50">
              Encrypted Session // Port 443
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}