"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminMenu from "./admin-menu";
import ThemeToggle from "../shop/theme-toggle";

export default function AdminHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 sm:mb-12">
      <Link href="/" className="group flex items-center gap-2 text-gray-500 hover:text-white transition-all duration-300">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-brand/30 group-hover:bg-brand/5">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.3em]">Exit Terminal</span>
      </Link>
      <div className="hidden sm:block h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
      <div className="flex items-center gap-4">
        <div className="text-[8px] sm:text-[9px] font-mono text-white/20 uppercase tracking-widest">Secure Node: 01-Kirubel</div>
        <ThemeToggle />
        <AdminMenu />
      </div>
    </div>
  );
}
