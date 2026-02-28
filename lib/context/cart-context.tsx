"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Update the Type definition so TypeScript knows these exist
interface CartContextType {
  items: any[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: any) => void;      // Add this
  removeFromCart: (id: string) => void;  // Add this
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // ADD TO CART LOGIC
  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // REMOVE FROM CART LOGIC
  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ 
      items, 
      isOpen, 
      setIsOpen, 
      addToCart, 
      removeFromCart, 
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};