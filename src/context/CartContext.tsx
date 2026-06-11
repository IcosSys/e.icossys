"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;       // en centimes
  quantity: number;
  mainImage: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;  // en centimes
}

const CART_KEY = "e-icossys-cart";

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  const persist = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    } catch {}
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...prev, { ...item, quantity: 1 }];
      }
      try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.productId !== productId);
      try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => {
      const updated = prev.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      );
      try { localStorage.setItem(CART_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}