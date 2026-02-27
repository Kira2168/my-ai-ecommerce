"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // This ensures the code only runs on the client to avoid errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-14 h-7 bg-white/5 rounded-full" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-7 flex items-center rounded-full p-1 transition-all duration-500 border group overflow-hidden"
    >
      {/* Background Track */}
      <div className={`absolute inset-0 transition-all duration-500 ${isDark ? "bg-gradient-to-r from-black to-purple-900 border border-purple-400/30" : "bg-[#fff8e7] border border-purple-300/40"}`} />
      
      {/* Moving Thumb (The White Part) */}
      <div
        className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
          isDark ? "bg-white" : "bg-[#2a1746]"
        } ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-black" />
        ) : (
          <Sun className="w-3 h-3 text-[#fff8e7]" />
        )}
      </div>
    </button>
  );
}