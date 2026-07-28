import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  doc, setDoc, getDoc, updateDoc, onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: any) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const uid = user?.uid ?? null;

  // Real-time listener on user's wishlist document in Firestore
  useEffect(() => {
    if (authLoading) return;

    // Not logged in — clear wishlist
    if (!uid) {
      setWishlistItems([]);
      return;
    }

    // Listen to wishlist doc: wishlists/{uid}
    const ref = doc(db, 'wishlists', uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWishlistItems(data.items || []);
      } else {
        // First time — create empty wishlist doc
        setDoc(ref, { items: [], updatedAt: new Date().toISOString() });
        setWishlistItems([]);
      }
    }, (err) => {
      console.error('Wishlist error:', err);
    });

    return () => unsubscribe();
  }, [uid, authLoading]);

  // Save to Firestore
  const saveToFirestore = async (items: WishlistItem[]) => {
    if (!uid) return;
    try {
      const ref = doc(db, 'wishlists', uid);
      await setDoc(ref, { items, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('Error saving wishlist:', err);
    }
  };

  const addToWishlist = (product: any) => {
    const item: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      category: product.category,
    };
    setWishlistItems(prev => {
      if (prev.some(i => i.id === product.id)) return prev;
      const updated = [...prev, item];
      saveToFirestore(updated);
      return updated;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => {
      const updated = prev.filter(i => i.id !== productId);
      saveToFirestore(updated);
      return updated;
    });
  };

  const isInWishlist = (productId: string) =>
    wishlistItems.some(i => i.id === productId);

  const clearWishlist = () => {
    setWishlistItems([]);
    saveToFirestore([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};