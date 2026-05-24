import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  is_physical?: boolean;
};

type Ctx = {
  items: CartItem[];
  add: (i: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, q: number) => void;
  clear: () => void;
  total: number;
  count: number;
  hasPhysical: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const CartContext = createContext<Ctx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const add = useCallback((i: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const ex = prev.find((p) => p.id === i.id);
      if (ex) return prev.map((p) => (p.id === i.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { ...i, quantity: 1 }];
    });
  }, []);
  const remove = useCallback((id: string) => setItems((p) => p.filter((x) => x.id !== id)), []);
  const setQty = useCallback((id: string, q: number) => {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, q) } : x)));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const hasPhysical = items.some((i) => i.is_physical);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, total, count, hasPhysical, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart requires CartProvider");
  return c;
}
