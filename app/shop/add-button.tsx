"use client";
import { useCart } from "@/lib/context/cart-context";
import { Plus, Loader2, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { addItemToOrder, createDraftOrder } from "@/lib/actions/checkout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QuickAddButtonProps = {
  product: any;
  orderId?: string | null;
};

export default function QuickAddButton({ product, orderId }: QuickAddButtonProps) {
  const { addToCart, setIsOpen } = useCart();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Local feedback
    addToCart(product);

    // 2. Start Transition (The "Waiting" phase)
    startTransition(async () => {
      try {
        let activeOrderId = orderId;

        if (!activeOrderId) {
          const created = await createDraftOrder();
          if (!created.success || !created.orderId) return;
          activeOrderId = created.orderId;
          const params = new URLSearchParams(searchParams.toString());
          params.set("orderId", activeOrderId);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }

        const result = await addItemToOrder(activeOrderId, {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image ?? null,
          category: product.category,
        });

        if (result.success) {
          setIsSuccess(true);
          setTimeout(() => setIsOpen(true), 300); // Open cart after green check appears
          setTimeout(() => setIsSuccess(false), 2000);
        }
      } catch (err) {
        console.error("SYNC_ERROR", err);
      }
    });
  };

  return (
    <button 
      onClick={handleQuickAdd}
      disabled={isPending || isSuccess}
      className={`relative w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center border shadow-2xl overflow-hidden
        ${isSuccess 
          ? "bg-green-500 border-green-500 text-black scale-100" 
          : "bg-brand border-brand text-black hover:scale-110 active:scale-90"
        } ${isPending ? "opacity-70" : "opacity-100"}`}
    >
      {/* SUCCESS BACKGROUND PULSE */}
      {isSuccess && (
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      )}

      <div className="relative z-10">
        {isPending ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isSuccess ? (
          <Check className="w-6 h-6 animate-in zoom-in duration-300" />
        ) : (
          <Plus className="w-6 h-6 transition-transform duration-500 group-hover:rotate-90" />
        )}
      </div>
    </button>
  );
}