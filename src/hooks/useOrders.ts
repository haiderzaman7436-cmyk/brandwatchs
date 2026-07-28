import { useEffect, useState, useCallback } from "react";
import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy, where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import type { Order } from "@/data/sampleOrders";
import { useAudit } from "./useAudit";

const sendOrderEmail = async (orderData: any) => {
  try {
    await fetch("http://127.0.0.1:5000/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
  } catch (error) {
    console.error("❌ Email server error:", error);
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addLog } = useAudit();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const uid = user?.uid ?? null;

  useEffect(() => {
    // Wait for auth to finish
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Clear on any user change
    setOrders([]);

    if (!uid && !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Force refresh Firebase Auth token to ensure Firestore rules pass
    // This is the key fix — stale token causes permission issues
    const startListener = () => {
      let q;
      if (isAdmin) {
        q = query(collection(db, "orders"), orderBy("date", "desc"));
      } else {
        q = query(
          collection(db, "orders"),
          where("customerEmail", "==", user!.email),
          orderBy("date", "desc")
        );
      }

      const unsub = onSnapshot(q,
        (snapshot) => {
          const data = snapshot.docs.map((d) => ({
            id: d.id, ...d.data(),
          })) as Order[];
          setOrders(data);
          setLoading(false);
        },
        (err) => {
          console.error("Orders error:", err);
          setLoading(false);
        }
      );
      return unsub;
    };

    // Force token refresh then start listener
    // This ensures Firestore gets a fresh valid token after login
    let unsubscribe: (() => void) | undefined;
    if (auth.currentUser) {
      auth.currentUser.getIdToken(true)
        .then(() => {
          unsubscribe = startListener();
        })
        .catch(() => {
          // If token refresh fails, try anyway
          unsubscribe = startListener();
        });
    } else {
      unsubscribe = startListener();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [uid, isAdmin, authLoading]);

  const refreshOrders = useCallback(() => {}, []);

  const addOrder = useCallback(
    async (order: Omit<Order, "id" | "date" | "status">) => {
      const newOrder = { ...order, date: new Date().toISOString(), status: "Pending" };
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      addLog("Order Placed", `Order ${docRef.id} created`);
      sendOrderEmail({ orderId: docRef.id, ...order, date: newOrder.date });
      return { id: docRef.id, ...newOrder } as Order;
    },
    [addLog]
  );

  const updateStatus = useCallback(
    async (id: string, status: Order["status"]) => {
      const updates: any = { status };
      if (status === "Dispatched") updates.dispatchDate = new Date().toISOString();
      if (status === "Completed") updates.completedDate = new Date().toISOString();
      await updateDoc(doc(db, "orders", id), updates);
      addLog("Order Updated", `Order ${id} → ${status}`);
    },
    [addLog]
  );

  return { orders, addOrder, updateStatus, refreshOrders, loading };
};