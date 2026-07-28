import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product & { selectedImage?: string };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  
  // Initialize with local storage if available
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("guestCart");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  
  const uid = user?.uid ?? null;

  // Real-time listener — loads correct cart per user from Firestore
  useEffect(() => {
    if (authLoading) return;

    if (!uid) {
      // Not logged in — rely on local storage (already initialized in useState)
      const saved = localStorage.getItem("guestCart");
      if (saved) setItems(JSON.parse(saved));
      return;
    }

    const ref = doc(db, "carts", uid);
    
    // Merge guest cart with Firestore cart if logging in
    const handleLoginMerge = async () => {
      const guestCartJson = localStorage.getItem("guestCart");
      let guestCart: CartItem[] = guestCartJson ? JSON.parse(guestCartJson) : [];
      
      const snap = await getDoc(ref);
      let firestoreCart: CartItem[] = snap.exists() ? snap.data().items || [] : [];
      
      if (guestCart.length > 0) {
        // Simple merge: add guest items not in firestore, update quantities if they exist
        guestCart.forEach(gItem => {
          const fItem = firestoreCart.find(f => f.product.id === gItem.product.id);
          if (fItem) {
            fItem.quantity += gItem.quantity;
          } else {
            firestoreCart.push(gItem);
          }
        });
        
        await setDoc(ref, { items: firestoreCart, updatedAt: new Date().toISOString() }, { merge: true });
        localStorage.removeItem("guestCart");
      }
    };
    
    handleLoginMerge();

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setItems(snap.data().items || []);
      } else {
        setDoc(ref, { items: [], updatedAt: new Date().toISOString() });
        setItems([]);
      }
    }, (err) => {
      console.error("Cart error:", err);
    });

    return () => unsubscribe();
  }, [uid, authLoading]);

  // Save cart
  const saveState = async (newItems: CartItem[]) => {
    if (!uid) {
      localStorage.setItem("guestCart", JSON.stringify(newItems));
    } else {
      try {
        await setDoc(
          doc(db, "carts", uid),
          { items: newItems, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    }
  };

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.product.selectedImage === product.selectedImage
      );
      const updated = existing
        ? prev.map((i) =>
            i.product.id === product.id && i.product.selectedImage === product.selectedImage
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { product, quantity: 1 }];
      saveState(updated);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      saveState(updated);
      return updated;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems((prev) => {
      const updated = prev.map((i) => i.product.id === productId ? { ...i, quantity } : i);
      saveState(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    saveState([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};