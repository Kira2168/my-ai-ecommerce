"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import NewDropModal from "./new-drop";

export default function NewDropModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 bg-brand text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,242,255,0.2)]"
      >
        <Plus className="w-4 h-4" /> Initialize New Drop
      </button>

      {isOpen && (
        <NewDropModal 
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}