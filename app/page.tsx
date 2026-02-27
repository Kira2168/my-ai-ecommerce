// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent" />
      
      <h1 className="text-7xl font-black text-white tracking-tighter mb-4 z-10">
        FUTURE <span className="text-brand italic font-light">SHOP</span>
      </h1>
      
      <p className="text-gray-400 max-w-md mb-8 z-10">
        The world's first e-commerce platform powered by autonomous AI agents.
      </p>

      <div className="flex gap-4 z-10">
        <Link href="/shop" className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-brand transition-colors">
          Enter Store
        </Link>
        <Link href="/admin" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
          Admin Portal
        </Link>
      </div>
    </main>
  );
  
}