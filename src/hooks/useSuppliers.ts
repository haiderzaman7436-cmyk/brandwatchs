import { useState, useEffect, useCallback } from "react";
import { defaultSuppliers, type Supplier } from "@/data/suppliers";

const STORAGE_KEY = "brandwatches_suppliers";

const loadSuppliers = (): Supplier[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSuppliers));
  return defaultSuppliers;
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliers);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  }, [suppliers]);

  const addSupplier = useCallback((supplier: Omit<Supplier, "id">) => {
    const newS: Supplier = { ...supplier, id: `s${Date.now()}` };
    setSuppliers((prev) => [...prev, newS]);
    return newS;
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  return { suppliers, addSupplier, updateSupplier };
};
