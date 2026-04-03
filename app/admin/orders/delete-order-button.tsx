"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const ok = window.confirm("Delete this transaction?");
    if (!ok) return;

    setLoading(true);
    try {
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
      aria-label="Delete transaction"
      title="Delete transaction"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
