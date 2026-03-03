"use client";

import { useState, useEffect } from "react";
import { Terminal, Cpu, ShieldAlert } from "lucide-react";
import StarField from "@/components/StarField";
import { createOrderAction } from "@/lib/actions/create-order";

export default function Home() {
  // 1. Pattern to fix Hydration Mismatch - Ensures client-side only features (video/stars) don't conflict with SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* 2. INTERACTIVE BACKGROUNDS (Only loads on Client) */}
      {isMounted && (
        <>
          {/* STAR FIELD */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <StarField />
          </div>

          {/* ANIME VIDEO BACKGROUND */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover grayscale-[50%]"
            >
              <source src="https://motionbgs.com/media/4636/cyberpunk-city-street.mp4" type="video/mp4" />
            </video>
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
          </div>
        </>
      )}

      {/* 3. GRID OVERLAY (Static, safe for SSR) */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* 4. MAIN UI CONTENT */}
      <div className="relative z-20 flex flex-col items-center">
        
        {/* ARCHITECT TAG */}
        <div className="flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <Cpu className="w-3 h-3 text-cyan-300" />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">
            Architected by <span className="text-white font-bold">Kirubel</span>
          </span>
        </div>

        {/* HERO TITLE */}
        <h1 className="text-7xl md:text-[11rem] font-black tracking-[-0.05em] leading-none mb-4 uppercase italic bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(125,211,252,0.2)]">
          LUCY<span className="text-cyan-200 not-italic">.</span>GEBEYA
        </h1>
        
        <p className="text-gray-400 max-w-lg font-mono text-[10px] md:text-xs uppercase tracking-[0.5em] mb-12 leading-relaxed">
          The world&apos;s first e-commerce platform <br /> 
          <span className="text-white/40">powered by autonomous AI agents.</span>
        </p>

        {/* 5. INITIATE ACCESS BUTTON (Triggers create-order.ts) */}
        <div className="flex flex-col items-center gap-6">
          <form action={createOrderAction}>
            <button 
              type="submit"
              className="group relative px-14 py-6 transition-all duration-500 overflow-hidden outline-none"
              style={{ clipPath: "polygon(0 15%, 15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%)" }}
            >
              {/* BUTTON BORDER */}
              <div className="absolute inset-0 border border-cyan-900/30 z-20 pointer-events-none group-hover:border-cyan-400/60 transition-colors duration-500" />
              
              {/* BUTTON BASE */}
              <div className="absolute inset-0 bg-cyan-950/10 z-0" />

              {/* HOVER FILL EFFECT */}
              <div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-cyan-500 to-violet-500 group-hover:h-full transition-all duration-500 ease-in-out z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />

              {/* SCANNING LASER EFFECT (Class defined in globals.css) */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-300 z-20 opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity" />

              {/* BUTTON CONTENT */}
              <span className="relative z-30 flex items-center gap-3 text-cyan-400 group-hover:text-white font-black uppercase tracking-[0.4em] text-xs transition-colors duration-500">
                Initiate Access <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </span>

              {/* OUTER GLOW */}
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/25 blur-xl transition-all duration-500 -z-10" />
            </button>
          </form>

          {/* HIDDEN ADMIN ENTRANCE */}
          <div className="mt-16 opacity-0 hover:opacity-100 transition-opacity duration-700">
            <a 
              href="/admin/login" 
              className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.6em] text-white/20 hover:text-red-500 hover:drop-shadow-[0_0_10px_#ff0000] transition-all duration-300"
            >
              <ShieldAlert className="w-3 h-3" /> 
              <span className="transition-colors duration-300">
                Root Terminal Login
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER DECOR */}
      <div className="absolute bottom-8 left-8 flex flex-col items-start gap-1 z-20">
        <div className="w-12 h-[1px] bg-white/20" />
        <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest text-left">
          Origin: Ethiopia<br />Node: 01-Kirubel
        </span>
      </div>
    </main>
  );
}