import { useState, useEffect, useCallback } from "react";

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  supplier: string;
  cost: number;
  date: string;
}

const STORAGE_KEY = "brandwatches_purchases";

const loadPurchases = (): Purchase[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(loadPurchases);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  }, [purchases]);

  const addPurchase = useCallback((purchase: Omit<Purchase, "id" | "date">) => {
    const newP: Purchase = { ...purchase, id: `pur-${Date.now()}`, date: new Date().toISOString().split("T")[0] };
    setPurchases((prev) => [newP, ...prev]);
    return newP;
  }, []);

  return { purchases, addPurchase };
};
