"use client";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/context/cart-context";
import { Terminal as TerminalIcon, CheckCircle2, ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import * as htmlToImage from 'html-to-image';
import { processOrder } from "@/lib/actions/checkout"; 
import { useSearchParams } from "next/navigation";

// TYPEWRITER COMPONENT FOR HIGH-TECH FEEL
const TypewriterText = ({ text, delay = 40 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);
  return <span>{displayText}</span>;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId"); // Extracting the real Order ID from URL
  
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState("INITIALIZING SECURE LINK...");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authId, setAuthId] = useState("");
  const [creditNode, setCreditNode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // FIXED: Store values before clearing the cart
  const [finalTotal, setFinalTotal] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setStatus("ENCRYPTION ESTABLISHED. READY FOR PROTOCOL.");
          return 100;
        }
        return Math.min(oldProgress + 10, 100);
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const totalPrice = mounted ? items.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;

  const handleExecute = async () => {
  if (!authId || !creditNode) return;
  
  setFinalTotal(totalPrice);
  setPurchasedItems([...items]);
  setIsProcessing(true);
  
  // CRITICAL FIX: Pass the orderId from the URL to the server action
  // This tells Neon: "Update THIS specific order row to COMPLETED"
  const result = await processOrder(items, orderId); 
  
  if (result.success) {
    setIsProcessing(false);
    setIsComplete(true);
    clearCart(); 
  } else {
    setIsProcessing(false);
    alert(result.error || "TERMINAL ERROR: Asset allocation failed.");
  }
};

  const downloadPDF = async () => {
    if (!receiptRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await htmlToImage.toPng(receiptRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0d0d0d',
      });

      const pdf = new jsPDF('p', 'px', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`MANIFEST_${orderId || Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Export Failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  if (isComplete) {
    return (
      <div className="min-h-screen bg-[#05040a] text-white p-8 flex items-center justify-center animate-in fade-in zoom-in duration-1000">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-brand blur-3xl opacity-20 animate-pulse" />
            <CheckCircle2 className="w-24 h-24 text-brand relative z-10 mx-auto drop-shadow-[0_0_15px_#00f2ff]" />
          </div>
          
          <h1 className="text-5xl font-black italic text-white mb-2 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            <TypewriterText text="Access Granted." />
          </h1>
          <p className="text-white/40 font-mono text-[9px] uppercase tracking-[0.4em] mb-12">
            <TypewriterText text="Transaction Signed // Assets Allocated" delay={20} />
          </p>
          
          <div ref={receiptRef} className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-10 mb-8 text-left shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-brand/50" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/30 mb-1 font-bold">Manifest ID</p>
                <p className="font-mono text-xs text-white">#{orderId?.substring(0, 12).toUpperCase() || "INTERNAL-01"}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.4em] text-white/30 mb-1 font-bold">Status</p>
                <p className="font-mono text-[10px] text-brand italic font-bold uppercase">Authorized</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
               {purchasedItems.map(item => (
                 <div key={item.id} className="flex flex-col border-b border-white/5 pb-4 last:border-0">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[11px] font-black uppercase text-white tracking-tight">{item.name}</p>
                        <p className="text-[9px] font-mono text-white/40 uppercase mt-1">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-[11px] font-mono text-brand">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                 </div>
               ))}
            </div>

            <div className="border-t border-brand/20 pt-6 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Credits</span>
              <span className="text-3xl font-black text-brand tracking-tighter">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={downloadPDF} 
              disabled={isGenerating}
              className="w-full py-6 bg-brand text-black font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,242,255,0.2)] transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGenerating ? "ENCRYPTING..." : "DOWNLOAD PDF MANIFEST"}
            </button>
            <Link href="/shop" className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-[8px] hover:bg-white/10 transition-all">
              <ArrowLeft className="w-3 h-3" /> Return to Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TERMINAL VIEW (BEFORE COMPLETION)
  return (
    <div className="min-h-screen bg-[#05040a] text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-[#111] border border-white/10 rounded-t-3xl p-6 flex items-center gap-3">
            <TerminalIcon className="text-brand w-4 h-4 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/40 font-bold">Secure Terminal // AUTH_PROC</span>
          </div>

          <div className="bg-[#0d0d0d] border-x border-b border-white/10 rounded-b-3xl p-8 md:p-12 shadow-2xl relative">
            {isProcessing ? (
              <div className="py-24 text-center">
                <div className="w-12 h-12 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-8" />
                <p className="text-brand font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing with Neon Node...</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="font-mono">
                  <p className="text-brand text-[10px] mb-3 uppercase tracking-widest"> {status} </p>
                  <div className="w-full bg-white/5 h-[2px] rounded-full overflow-hidden">
                    <div className="bg-brand h-full transition-all duration-700 shadow-[0_0_10px_#00f2ff]" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {progress === 100 && (
                  <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[8px] uppercase tracking-[0.3em] text-white/40 font-black">Auth Identifier</label>
                        <input value={authId} onChange={(e) => setAuthId(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-xs font-mono text-brand" placeholder="ID_NODE_9" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[8px] uppercase tracking-[0.3em] text-white/40 font-black">Credit Node</label>
                        <input value={creditNode} onChange={(e) => setCreditNode(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-xs font-mono text-brand" placeholder="XXXX XXXX XXXX XXXX" />
                      </div>
                    </div>
                    <button 
                      onClick={handleExecute} 
                      disabled={!authId || !creditNode} 
                      className="w-full py-6 bg-brand text-black font-black rounded-2xl hover:scale-[1.01] transition-all uppercase tracking-[0.4em] text-[10px] disabled:opacity-20"
                    >
                      Authorize — ${totalPrice.toFixed(2)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="lg:col-span-5">
          <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 sticky top-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.4em] mb-8 text-white/40 font-bold flex items-center gap-2">
              <FileText className="w-3 h-3 text-brand" /> Manifest Buffer
            </h3>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 overflow-hidden">
                       <img src={item.image || "/placeholder.jpg"} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white/80">{item.name}</p>
                      <p className="text-[9px] text-white/40 font-mono">x{item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-brand/80">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/30">Total</span>
              <span className="text-brand font-mono text-2xl font-black">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}