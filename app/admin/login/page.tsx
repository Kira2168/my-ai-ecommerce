"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, AlertOctagon, ZapOff, Radio } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSelfDestructing, setIsSelfDestructing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 second countdown
  const router = useRouter();

  // Handle the countdown timer logic
  useEffect(() => {
    if (isSelfDestructing && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSelfDestructing, timeLeft]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      router.push("/admin");
    } else {
      const nextAttempt = attempts + 1;
      setAttempts(nextAttempt);
      setPassword("");
      if (nextAttempt >= 3) {
        setIsSelfDestructing(true);
      }
    }
  };

  if (isSelfDestructing) {
    return (
      <main className={`min-h-screen bg-black flex flex-col items-center justify-center p-6 text-red-600 overflow-hidden ${timeLeft === 0 ? 'animate-glitch' : ''}`}>
        {/* Pulsing Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 pointer-events-none bg-[length:100%_2px,3px_100%]" />
        
        <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl text-center">
          <div className="relative">
            <ZapOff size={80} className={`${timeLeft > 0 ? 'animate-pulse' : 'animate-ping'}`} />
            <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
              {timeLeft > 0 ? "TERMINATING" : "WIPED"}
            </h1>
            <p className="font-mono text-sm tracking-[0.4em] uppercase opacity-60">
              {timeLeft > 0 ? `Encryption keys purging in ${timeLeft}s` : "Core database deleted."}
            </p>
          </div>

          {/* THE PROGRESS BAR */}
          <div className="w-64 h-1 bg-red-950 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-red-600 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>

          {timeLeft === 0 && (
            <button 
              onClick={() => window.location.href = "/"}
              className="mt-12 px-10 py-4 border-2 border-red-600 text-red-600 font-black hover:bg-red-600 hover:text-black transition-all duration-500 uppercase tracking-widest text-sm animate-in fade-in zoom-in"
            >
              Emergency Evacuate
            </button>
          )}
        </div>

        {/* Floating background noise data */}
        <div className="absolute bottom-10 left-10 font-mono text-[8px] opacity-20 hidden md:block">
            {Array.from({length: 5}).map((_, i) => (
                <div key={i}>ERR_BLOCK_0x00{i}_PURGED</div>
            ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-10 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden">
        <div className={`absolute top-0 left-0 h-1 transition-all duration-500 bg-gradient-to-r from-transparent via-red-500 to-transparent ${attempts > 0 ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <Lock className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Secure Terminal</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
             <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Level 4 Clearance Required</p>
             {attempts > 0 && (
                <span className="text-[10px] font-mono text-red-500 font-bold animate-pulse">
                  [!] {attempts}/3 ATTEMPTS
                </span>
             )}
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <input 
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ENCRYPTION KEY"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 px-6 text-white font-mono text-sm outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
              required
            />
            <button 
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group active:scale-95">
            Authenticate <ShieldCheck className="w-4 h-4" />
          </button>
        </form>

        <footer className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
            <span className="text-[8px] font-mono text-white uppercase tracking-widest">Architect: Kirubel</span>
            <AlertOctagon size={12} className="text-red-500" />
        </footer>
      </div>
    </main>
  );
}