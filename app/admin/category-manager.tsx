"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      setName("");
      await loadCategories();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
      await loadCategories();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
      <div className="p-5 sm:p-8 border-b border-white/5 flex items-center gap-4 bg-[var(--card-bg-secondary)]">
        <Tag className="text-brand w-4 h-4" />
        <h2 className="font-mono text-[10px] uppercase tracking-[0.5em] font-bold text-white/40">Category Control</h2>
      </div>

      <div className="p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NEW CATEGORY"
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-foreground/80 placeholder:text-foreground/20 outline-none focus:border-brand transition-all"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-3 rounded-xl bg-brand text-black text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-white/20 font-mono text-[9px] uppercase tracking-widest">
              No categories yet
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--card-bg-secondary)] border border-white/5"
              >
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-foreground/70">
                  {category.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(category.id)}
                  disabled={loading}
                  className="p-2 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
