"use client";
import { createProduct } from "@/lib/actions/product-actions";
import { Plus, Sparkles, Cloud } from "lucide-react";

export default function AddProductCard() {
  async function handleSubmit(formData: FormData) {
    const result = await createProduct(formData);
    if (result.success) {
      // Modern 2026 apps use "toast" notifications, 
      // but a clean alert works for our logic test!
      alert("Product synced to Neon cloud successfully!");
    }
  }

  // --- UI ATTRACTIVE STYLES ---
  // We define these here to keep the code clean below
  const inputStyles = "w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-white transition-all duration-300 focus:border-brand/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-brand/5 outline-none placeholder:text-gray-600";

  return (
    /* --- MAIN CONTAINER: Glassmorphism & Glow --- */
    <div className="relative group p-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl overflow-hidden">
      
      {/* Background Decorative Glow (Top Left) */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand/5 blur-[80px] group-hover:bg-brand/10 transition-all duration-700" />
      
      <div className="relative z-10">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
            <div className="p-2 rounded-lg bg-brand/10 border border-brand/20">
              <Plus className="text-brand w-5 h-5" />
            </div>
            NEW PRODUCT
          </h2>
          {/* Status Badge */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            NEON-LIVE
          </div>
        </header>
        
        <form action={handleSubmit} className="space-y-5">
          {/* PRODUCT NAME INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 text-brand/80">Product Identity</label>
            <input name="name" placeholder="e.g. Cyber Edition Sneakers" className={inputStyles} required />
          </div>

          {/* PRICE & CATEGORY GRID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Pricing (USD)</label>
              <input name="price" type="number" step="0.01" placeholder="0.00" className={inputStyles} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
              <input name="category" placeholder="Apparel" className={inputStyles} required />
            </div>
          </div>

          {/* DESCRIPTION TEXTAREA */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
               Description <Sparkles className="w-3 h-3 text-brand" />
            </label>
            <textarea 
              name="description" 
              placeholder="Describe the product vibe..." 
              className={`${inputStyles} h-32 resize-none`}
              required
            />
          </div>

          {/* SUBMIT BUTTON: Attractive Hover Effects */}
          <button type="submit" className="group/btn relative w-full overflow-hidden py-4 bg-brand text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            {/* Glossy overlay effect on hover */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            
            <span className="relative flex items-center justify-center gap-2">
              SYNC TO CLOUD <Cloud className="w-4 h-4" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}