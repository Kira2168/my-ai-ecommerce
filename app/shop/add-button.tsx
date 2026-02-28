"use client";
import { useCart } from "@/lib/context/cart-context";
import { Plus } from "lucide-react";

export default function QuickAddButton({ product }: { product: any }) {
  const { addToCart, setIsOpen } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link from navigating to [id]
    e.stopPropagation();
    addToCart(product);
    setIsOpen(true); // Open sidebar for feedback
  };

  return (
    <button 
      onClick={handleQuickAdd}
      className="p-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] group-hover:bg-brand group-hover:text-black transition-all shadow-xl hover:scale-110 active:scale-90"
    >
      <Plus className="w-5 h-5" />
    </button>
  );
}