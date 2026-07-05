import { createContext, useContext, useState, type ReactNode } from "react";
import type { Dish } from "./data";

export type CartItem = {
  dish: Dish;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (dish: Dish, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { dish, quantity }];
    });
  };

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.dish.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((i) => (i.dish.id === id ? { ...i, quantity } : i)),
    );
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.dish.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, subtotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
