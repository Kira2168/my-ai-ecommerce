"use client";
import { useState } from "react";
import { X, Database, Zap, Loader2, Image as ImageIcon, Box, AlignLeft, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewDropModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "TECH",
    image: "",      
    stock: "10",    
    description: "" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock), 
        }),
      });

      if (response.ok) {
        router.refresh(); 
        onClose();       
      }
    } catch (error) {
      console.error("Injection Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/60 overflow-y-auto">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,242,255,0.1)] animate-in zoom-in-95 duration-300 my-auto flex flex-col md:flex-row"
      >
        {/* LEFT SIDE: LIVE PREVIEW (ATTRACTIVE UI ADDITION) */}
        <div className="w-full md:w-1/3 bg-black/40 border-r border-[var(--border-color)] p-8 flex flex-col justify-center items-center text-center space-y-4">
           <div className="flex items-center gap-2 text-brand mb-2">
             <Eye className="w-3 h-3" />
             <span className="text-[8px] font-black uppercase tracking-[0.3em]">Live Feed Preview</span>
           </div>
           <div className="aspect-square w-full rounded-2xl bg-[var(--background)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center relative group">
              {formData.image ? (
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  className="w-full h-full object-cover animate-in fade-in duration-500"
                  onError={(e) => (e.currentTarget.src = "")} 
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-[var(--muted-text)] opacity-20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <p className="text-[10px] text-[var(--muted-text)] font-mono italic px-4">
             {formData.name || "UNNAMED_ASSET"}
           </p>
        </div>

        {/* RIGHT SIDE: DATA INPUT */}
        <div className="flex-1 flex flex-col">
          {/* HEADER */}
          <div className="p-6 md:p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--card-bg-secondary)]/30">
            <div className="flex items-center gap-3">
              <Database className="text-brand w-4 h-4" />
              <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">New Asset Injection</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--muted-text)]" />
            </button>
          </div>

          {/* FORM BODY */}
          <div className="p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1">Asset Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)]" 
                  placeholder="e.g. CYBER_DRONE_01" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1">Credits (Price)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)]" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Image Source (URL)
              </label>
              <input 
                required
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)] font-mono" 
                placeholder="https://images.unsplash.com/..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1 flex items-center gap-2">
                  <Box className="w-3 h-3" /> Vault Stock
                </label>
                <input 
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)]" 
                  placeholder="10" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1">Protocol</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)] appearance-none cursor-pointer"
                >
                  <option>TECH</option>
                  <option>APPAREL</option>
                  <option>DIGITAL</option>
                  <option>ACCESSORIES</option>
                  <option>DIGITAL</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-[var(--muted-text)] font-bold ml-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Technical Specifications
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[var(--background)] border border-[var(--border-color)] rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-[var(--foreground)] h-20 resize-none" 
                placeholder="Describe the asset hardware..." 
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-white text-black font-black rounded-xl hover:bg-brand transition-all uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" /> Initialize Drop
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}