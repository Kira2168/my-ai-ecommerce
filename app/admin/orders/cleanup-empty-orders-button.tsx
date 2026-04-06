"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FilterX } from "lucide-react";

export default function CleanupEmptyOrdersButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = window.confirm("Delete empty pending orders with no items and zero total?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await fetch("/api/orders?cleanupEmpty=1", { method: "DELETE" });
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
      className="px-4 py-2 rounded-xl border border-amber-500/30 text-amber-400 text-[9px] font-mono uppercase tracking-[0.3em] hover:bg-amber-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
    >
      <FilterX className="w-3 h-3" />
      Cleanup empty pending
    </button>
  );
}
