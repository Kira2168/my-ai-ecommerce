"use client";

import { useEffect, useState } from "react";

interface Props {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilters({ activeCategory, onCategoryChange }: Props) {
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        const names = Array.isArray(data) ? data.map((c) => c.name) : [];
        setCategories(["All", ...names]);
      } catch {
        setCategories(["All", "Apparel", "Accessories", "Tech", "Digital"]);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
            activeCategory === cat
              ? "bg-brand text-black border-brand shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              : "bg-white/5 text-gray-500 border-white/10 hover:border-white/30 hover:text-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}