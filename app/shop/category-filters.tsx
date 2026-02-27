"use client";

import { useState } from "react";

const categories = ["All", "Apparel", "Accessories", "Tech", "Digital"];

export default function CategoryFilters() {
  const [active, setActive] = useState("All");

  return (
    <div className="flex items-center justify-center gap-3 mb-16 overflow-x-auto pb-4 no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setActive(cat)}
          className={`px-6 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
            active === cat
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