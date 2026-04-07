"use client";

import { useState, useEffect } from "react";
import { Terminal, Cpu, ShieldAlert } from "lucide-react";
import StarField from "@/components/StarField";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // 1. Pattern to fix Hydration Mismatch - Ensures client-side only features (video/stars) don't conflict with SSR
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/customer/auth/login" : "/api/customer/auth/signup";
      const payload =
        mode === "login"
          ? { email, password }
          : { displayName, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data?.error || "Auth failed.");
        return;
      }

      router.push("/shop");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-5 sm:p-6 text-center relative overflow-hidden">
      
      {/* 2. INTERACTIVE BACKGROUNDS (Only loads on Client) */}
      {isMounted && (
        <>
          {/* STAR FIELD */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <StarField />
          </div>

          {/* ANIME VIDEO BACKGROUND */}
          {!isMobile && (
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
          )}
        </>
      )}

      {/* 3. GRID OVERLAY (Static, safe for SSR) */}
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* 4. MAIN UI CONTENT */}
      <div className="relative z-20 flex flex-col items-center">
        
        {/* ARCHITECT TAG */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
          <Cpu className="w-3 h-3 text-cyan-300" />
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">
            Architected by <span className="text-white font-bold">Kirubel</span>
          </span>
        </div>

        {/* HERO TITLE */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[11rem] font-black tracking-[-0.05em] leading-none mb-4 uppercase italic bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(125,211,252,0.2)]">
          LUCY<span className="text-cyan-200 not-italic">.</span>GEBEYA
        </h1>
        
        <p className="text-gray-400 max-w-lg font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-10 sm:mb-12 leading-relaxed">
          The world&apos;s first e-commerce platform <br /> 
          <span className="text-white/40">powered by autonomous AI agents.</span>
        </p>

        {/* 5. AUTH + ACCESS PANEL */}
        <div className="flex flex-col items-center gap-6 w-full max-w-xl">
          <Link href="/shop">
            <button
              type="button"
              className="group relative px-8 sm:px-14 py-4 sm:py-6 transition-all duration-500 overflow-hidden outline-none"
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
              <span className="relative z-30 flex items-center gap-3 text-cyan-400 group-hover:text-white font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] text-[10px] sm:text-xs transition-colors duration-500">
                Browse Shop <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </span>

              {/* OUTER GLOW */}
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/25 blur-xl transition-all duration-500 -z-10" />
            </button>
          </Link>

          <div className="w-full relative rounded-[2rem] border border-cyan-300/30 bg-[linear-gradient(150deg,rgba(12,18,35,0.86),rgba(10,12,24,0.82))] backdrop-blur-2xl p-5 sm:p-6 shadow-[0_0_55px_rgba(0,242,255,0.16)] overflow-hidden">
            <div className="absolute -top-14 -right-10 w-40 h-40 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-10 w-44 h-44 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between mb-5 gap-4">
              <div className="text-left">
                <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-300 mb-1">Customer Access Node</p>
                <p className="text-[11px] text-white/55">Authenticate to unlock fast checkout and order history.</p>
              </div>

              <div className="flex items-center gap-2 bg-black/35 p-1 rounded-full border border-white/15">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest border transition-all ${
                    mode === "login"
                      ? "bg-brand text-black border-brand shadow-[0_0_15px_rgba(0,242,255,0.45)]"
                      : "border-transparent text-white/65 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-widest border transition-all ${
                    mode === "signup"
                      ? "bg-brand text-black border-brand shadow-[0_0_15px_rgba(0,242,255,0.45)]"
                      : "border-transparent text-white/65 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form onSubmit={handleAuth} className="relative z-10 space-y-3 text-left">
              {mode === "signup" ? (
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="FULL NAME"
                  className="w-full bg-black/45 border border-cyan-200/20 rounded-xl py-3.5 px-4 text-white font-mono text-xs outline-none focus:border-brand placeholder:text-white/35 focus:shadow-[0_0_0_2px_rgba(0,242,255,0.18)] transition-all"
                  required
                />
              ) : null}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL"
                className="w-full bg-black/45 border border-cyan-200/20 rounded-xl py-3.5 px-4 text-white font-mono text-xs outline-none focus:border-brand placeholder:text-white/35 focus:shadow-[0_0_0_2px_rgba(0,242,255,0.18)] transition-all"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="PASSWORD"
                className="w-full bg-black/45 border border-cyan-200/20 rounded-xl py-3.5 px-4 text-white font-mono text-xs outline-none focus:border-brand placeholder:text-white/35 focus:shadow-[0_0_0_2px_rgba(0,242,255,0.18)] transition-all"
                required
              />

              {authError ? <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">{authError}</p> : null}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-brand text-black font-black uppercase tracking-[0.3em] text-[10px] hover:brightness-110 hover:shadow-[0_0_25px_rgba(0,242,255,0.45)] transition disabled:opacity-50"
              >
                {authLoading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>

          {/* HIDDEN ADMIN ENTRANCE */}
          <div className="mt-10 sm:mt-16 opacity-0 hover:opacity-100 transition-opacity duration-700">
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