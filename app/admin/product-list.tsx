// admin/product-list.tsx
import { db } from "@/lib/db";
import { Package } from "lucide-react";
import DeleteButton from "./delete-button";

export default async function ProductList() {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-white font-bold text-xl flex items-center gap-3">
        <div className="p-2 rounded-lg bg-brand/10">
          <Package className="text-brand w-4 h-4" />
        </div> 
        Cloud Inventory
      </h3>
      
      {products.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-gray-600 font-mono text-sm uppercase tracking-widest">Database Empty</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
  <div 
    key={product.id} 
    className="group relative p-4 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/8 transition-all duration-300 flex justify-between items-center"
  >
    <div className="z-10">
      <p className="text-white font-bold tracking-tight group-hover:text-brand transition-colors">
        {product.name}
      </p>
      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">
        {product.category}
      </p>
    </div>

    <div className="flex items-center gap-4 z-20">
      <span className="text-white font-mono font-bold">${product.price}</span>
      
      {/* --- THE DELETE DIV --- */}
      {/* Change: We removed 'opacity-0' temporarily to make sure you see it! */}
      <div className="flex items-center justify-center p-1 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 transition-all">
         <DeleteButton id={product.id} />
      </div>
    </div>
  </div>
))}
        </div>
      )}
    </div>
  );
}