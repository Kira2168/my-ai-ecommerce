"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/context/cart-context";
import { Lock, ShieldCheck, Terminal as TerminalIcon, CheckCircle2, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, clearCart } = useCart(); 
  const [status, setStatus] = useState("INITIALIZING SECURE LINK...");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setStatus("ENCRYPTION ESTABLISHED. READY FOR PROTOCOL.");
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const handleExecute = () => {
    setIsProcessing(true);
    // Simulate Blockchain Verification
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      clearCart(); // Wipe the bag after successful purchase
    }, 3000);
  };

  if (isComplete) {
    return (
     <div className="min-h-screen bg-[#05040a] text-white p-8 flex items-center justify-center">
   {/* This forces the checkout to stay dark even if we adjust global colors */}
   <div className="bg-[#0d0b1a] border-[#ffffff10] ...">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-brand blur-3xl opacity-20 animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-brand relative z-10 mx-auto" />
          </div>
          
          <h1 className="text-5xl font-black italic text-[var(--foreground)] mb-4 tracking-tighter uppercase">Access Granted.</h1>
          <p className="text-[var(--muted-text)] font-mono text-xs uppercase tracking-[0.4em] mb-12">Transaction Signed // Assets Allocated</p>
          
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 mb-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand/30" />
            <div className="flex justify-between text-left mb-6">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] mb-1">Receipt ID</p>
                <p className="font-mono text-xs text-[var(--foreground)]">#FS-2026-X99</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] mb-1">Status</p>
                <p className="font-mono text-xs text-brand italic">PAID</p>
              </div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-6 flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--foreground)]">Total Credits Charged</span>
              <span className="text-2xl font-black text-brand">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/shop" className="w-full py-5 bg-[var(--foreground)] text-[var(--background)] font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
              <ArrowLeft className="w-4 h-4" /> Return to Hub
            </Link>
            <button className="text-[var(--muted-text)] font-mono text-[9px] uppercase tracking-widest hover:text-brand transition-colors flex items-center justify-center gap-2">
              <Download className="w-3 h-3" /> Download Encrypted Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 flex items-center justify-center transition-colors duration-500">
      <div className="max-w-2xl w-full">
        
        {/* TERMINAL HEADER */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl p-6 flex items-center gap-3 backdrop-blur-md">
          <TerminalIcon className="text-brand w-5 h-5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--muted-text)] font-bold">
            SECURE TERMINAL // V.2026
          </span>
        </div>

        {/* TERMINAL BODY */}
        <div className="bg-[var(--card-bg-secondary)] border-x border-b border-[var(--border-color)] rounded-b-3xl p-10 relative overflow-hidden shadow-2xl">
          
          <div className="relative z-10">
            {isProcessing ? (
              <div className="py-20 text-center animate-pulse">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-8" />
                <p className="text-brand font-mono text-sm uppercase tracking-[0.5em]">Verifying Biometrics...</p>
              </div>
            ) : (
              <>
                <div className="mb-10 font-mono text-sm">
                  <p className="text-brand mb-3">{">"} {status}</p>
                  <div className="w-full bg-[var(--foreground)]/5 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(0,242,255,0.8)]" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>

                {progress === 100 && (
                  <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--muted-text)] font-bold">Auth Key</label>
                        <input className="w-full bg-[var(--background)]/50 border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm" placeholder="ID_IDENTIFIER" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-[var(--muted-text)] font-bold">Credit Node</label>
                        <input className="w-full bg-[var(--background)]/50 border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm" placeholder="0000 0000 0000 0000" />
                      </div>
                    </div>

                    <button 
                      onClick={handleExecute}
                      className="w-full py-6 bg-brand text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.3em] shadow-[0_0_40px_rgba(0,242,255,0.3)] text-xs"
                    >
                      Execute Transaction (${totalPrice.toFixed(2)})
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-6 text-[9px] font-mono text-[var(--muted-text)] uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Lock className="w-3 h-3 text-brand" /> Encrypted</span>
                      <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-brand" /> Verified</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}