"use client";
import { useState } from "react";
import { Edit2 } from "lucide-react";
import NewDropModal from "./new-drop";

export default function EditDropModalWrapper({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-brand/50 hover:bg-brand/10 transition-all text-white/40 hover:text-brand group/edit"
      >
        <Edit2 size={14} className="group-hover/edit:rotate-12 transition-transform" />
      </button>

      {isOpen && (
        <NewDropModal 
          onClose={() => setIsOpen(false)}
          initialData={product}
        />
      )}
    </>
  );
}