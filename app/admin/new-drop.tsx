"use client";
import { useState, useRef, useEffect } from "react";
import { X, Database, Zap, Loader2, Image as ImageIcon, Box, AlignLeft, Eye, Upload, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

// Added initialData prop to handle editing
export default function NewDropModal({ 
  onClose, 
  initialData 
}: { 
  onClose: () => void; 
  initialData?: any 
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  
  // Initialize state. If initialData exists, we use it; otherwise, defaults.
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "TECH",
    image: "",      
    stock: "10",    
    description: "" 
  });

  const isEditMode = !!initialData;

  // Sync initialData into state when the modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price?.toString() || "",
        category: initialData.category || "TECH",
        image: initialData.image || "",
        stock: initialData.stock?.toString() || "10",
        description: initialData.description || ""
      });
    }
  }, [initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("FILE_TOO_LARGE: Max 2MB for direct injection.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Switch between POST (new) and PATCH (update)
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await fetch("/api/products", {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: initialData?.id, // Include ID if editing
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock), 
        }),
      });

      if (response.ok) {
        router.refresh(); 
        onClose();       
      }
    } catch (error) {
      console.error("Transmission Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-xl bg-black/60 overflow-y-auto">
      <form 
        onSubmit={handleSubmit}
        className="max-w-4xl w-full bg-[#0d0d0d] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,242,255,0.1)] animate-in zoom-in-95 duration-300 my-auto flex flex-col md:flex-row"
      >
        {/* LEFT SIDE: LIVE PREVIEW */}
        <div className="w-full md:w-1/3 bg-black/40 border-r border-white/5 p-8 flex flex-col justify-center items-center text-center space-y-4">
            <div className="flex items-center gap-2 text-brand mb-2">
              <Eye className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.3em]">Live Feed Preview</span>
            </div>
            <div className="aspect-square w-full rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center relative group">
               {formData.image ? (
                 <img 
                   src={formData.image} 
                   alt="Preview" 
                   className="w-full h-full object-cover animate-in fade-in duration-500"
                   onError={(e) => (e.currentTarget.src = "")} 
                 />
               ) : (
                 <ImageIcon className="w-8 h-8 text-white/20 opacity-20" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                 <span className="text-[8px] text-white font-mono uppercase tracking-widest">Render Active</span>
               </div>
            </div>
            <p className="text-[10px] text-white/40 font-mono italic px-4 truncate w-full uppercase">
              {formData.name || "UNNAMED_ASSET"}
            </p>
        </div>

        {/* RIGHT SIDE: DATA INPUT */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              {isEditMode ? <RefreshCcw className="text-brand w-4 h-4" /> : <Database className="text-brand w-4 h-4" />}
              <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
                {isEditMode ? "Asset Re-Injection" : "New Asset Injection"}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>

          <div className="p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1">Asset Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-white" 
                  placeholder="e.g. CYBER_DRONE_01" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1">Credits (Price)</label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-white" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            {/* IMAGE INPUT SECTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-1">
                <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Visual Asset Source
                </label>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[8px] font-mono text-brand flex items-center gap-1 hover:opacity-70 transition-opacity uppercase tracking-widest"
                >
                  <Upload className="w-2.5 h-2.5" /> Pull From Memory
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
              <input 
                required
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-[10px] text-white/60 font-mono" 
                placeholder="Paste URL or use Memory Upload..." 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1 flex items-center gap-2">
                  <Box className="w-3 h-3" /> Vault Stock
                </label>
                <input 
                  required
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1">Protocol</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-white appearance-none cursor-pointer"
                >
                  <option>TECH</option>
                  <option>APPAREL</option>
                  <option>DIGITAL</option>
                  <option>ACCESSORIES</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-white/30 font-bold ml-1 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Technical Specifications
              </label>
              <textarea 
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-brand transition-all text-sm text-white h-20 resize-none" 
                placeholder="Describe the asset hardware..." 
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className={`w-full py-5 font-black rounded-xl transition-all uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${
                isEditMode ? 'bg-brand text-black hover:bg-cyan-400' : 'bg-white text-black hover:bg-brand'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isEditMode ? <RefreshCcw className="w-4 h-4" /> : <Zap className="w-4 h-4 fill-current" />}
                  {isEditMode ? "Confirm Update" : "Initialize Drop"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}