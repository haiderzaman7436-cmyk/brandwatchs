import { useEffect, useState, useCallback } from "react";
import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/data/products";
import { useAudit } from "./useAudit";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addLog } = useAudit();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = useCallback(
    async (product: Omit<Product, "id">) => {
      const cleanProduct: any = {};
      Object.keys(product).forEach(key => {
        if (product[key as keyof typeof product] !== undefined) {
          cleanProduct[key] = product[key as keyof typeof product];
        }
      });
      const docRef = await addDoc(collection(db, "products"), cleanProduct);
      const newProduct = { id: docRef.id, ...cleanProduct } as Product;
      setProducts((prev) => [newProduct, ...prev]);
      addLog("Product Added", `Added product: ${product.name}`);
      return newProduct;
    },
    [addLog]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      const cleanUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (updates[key as keyof Partial<Product>] !== undefined) {
          cleanUpdates[key] = updates[key as keyof Partial<Product>];
        }
      });
      await updateDoc(doc(db, "products", id), cleanUpdates);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      addLog("Product Updated", `Updated product ${id}`);
    },
    [addLog]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      addLog("Product Deleted", `Deleted product ${id}`);
    },
    [addLog]
  );

  const updateStock = useCallback(
    async (id: string, newStock: number) => {
      await updateDoc(doc(db, "products", id), { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, stock: newStock } : p)
      );
      addLog("Stock Updated", `Updated stock for ${id}`);
    },
    [addLog]
  );

  return { products, loading, addProduct, updateProduct, deleteProduct, updateStock };
};