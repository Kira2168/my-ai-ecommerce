"use client";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/product-actions";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <button
      onClick={async () => {
        if (confirm("Are you sure? This will remove it from the Neon cloud.")) {
          setIsDeleting(true);
          await deleteProduct(id);
          setIsDeleting(false);
        }
      }}
      disabled={isDeleting}
      className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 
                 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 
                 transition-all duration-300 disabled:opacity-50"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-spin" : ""}`} />
    </button>
  );
}