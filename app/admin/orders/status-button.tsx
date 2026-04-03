"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextStatus = status === "COMPLETED" ? "PENDING" : "COMPLETED";

  const handleClick = async () => {
    setLoading(true);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border transition-all ${
        nextStatus === "COMPLETED"
          ? "bg-brand/10 text-brand border-brand/30"
          : "bg-amber-500/10 text-amber-400 border-amber-400/30"
      } disabled:opacity-50`}
    >
      Mark {nextStatus}
    </button>
  );
}
