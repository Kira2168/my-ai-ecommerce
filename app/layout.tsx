// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/context/cart-context";
import CartSidebar from "./shop/cart-sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FUTURESHOP | 2026",
  description: "Next-Gen Shopping Experience",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="selection:bg-brand selection:text-black">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        
        {/* STEP 1: Theme Provider goes first */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          
          {/* STEP 2: Cart Provider goes inside */}
          <CartProvider>
            
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
            
            <CartSidebar />
            
            {/* --- FIXED BACKGROUND AURAS --- */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden h-full w-full">
              <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand/5 blur-[140px] animate-pulse" />
              <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[140px]" />
            </div>

          </CartProvider> {/* Closed correctly */}
        </ThemeProvider> {/* Closed correctly */}
        
      </body>
    </html>
  );
}