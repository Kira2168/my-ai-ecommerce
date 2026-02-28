"use client";

import { deleteProduct } from "@/lib/actions/admin";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("CRITICAL: Purge this asset from the manifest?")) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        router.refresh(); // This forces the table to update
      } else {
        alert("Delete failed: Check server logs.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative z-50 flex justify-end"> 
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-full border border-red-500/20 transition-all duration-300 group"
      >
        <span className="uppercase text-[9px] font-black tracking-widest">
          {isDeleting ? "Purging..." : "Decommission"}
        </span>
        {isDeleting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Trash2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
}