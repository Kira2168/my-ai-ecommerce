"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function ClearTransactionsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const confirmed = window.confirm("Clear all transactions? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    try {
      await fetch("/api/orders", { method: "DELETE" });
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
      className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-[9px] font-mono uppercase tracking-[0.3em] hover:bg-red-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
    >
      <Trash2 className="w-3 h-3" />
      Clear transactions
    </button>
  );
}
