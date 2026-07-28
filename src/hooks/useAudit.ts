import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AuditEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

// 🔥 FIREBASE COLLECTION
const auditCollection = collection(db, "auditLogs");

export const useAudit = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);

  // ✅ REAL-TIME FETCH (BEST APPROACH)
  useEffect(() => {
    const q = query(auditCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditEntry[];

      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  // ✅ ADD LOG (NO DUPLICATES)
  const addLog = useCallback(async (action: string, details: string) => {
    try {
      const entry = {
        action,
        details,
        timestamp: new Date().toISOString(),
      };

      await addDoc(auditCollection, entry);

      // ❌ DO NOT manually setLogs here
      // Firebase listener will update automatically

    } catch (error) {
      console.error("Audit log error:", error);
    }
  }, []);

  return { logs, addLog };
};