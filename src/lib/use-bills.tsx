"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Bill } from "./types";
import { todayISO } from "./utils";
import { supabase } from "./supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

const STORAGE_KEY = "slate-bills";
const UPCOMING_DAYS = 7;

interface BillsContextValue {
  bills: Bill[];
  addBill: (bill: Omit<Bill, "id">) => void;
  updateBill: (id: string, updates: Partial<Omit<Bill, "id">>) => void;
  togglePaid: (id: string) => void;
  deleteBill: (id: string) => void;
  unpaidBills: Bill[];
  paidBills: Bill[];
  totalDue: number;
  overdueCount: number;
  upcomingCount: number;
  chartData: { day: number; amount: number }[];
  syncing: boolean;
}

const BillsContext = createContext<BillsContextValue | null>(null);

function loadBills(): Bill[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveBillsLocal(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

// Convert DB row to Bill
function rowToBill(row: Record<string, unknown>): Bill {
  return {
    id: row.id as string,
    name: row.name as string,
    category: {
      label: row.category_label as string,
      emoji: row.category_emoji as string,
    },
    amount: Number(row.amount),
    dueDate: row.due_date as string,
    isPaid: row.is_paid as boolean,
    paidAt: row.paid_at as string | undefined,
    isRecurring: row.is_recurring as boolean,
    notes: (row.notes as string) || undefined,
  };
}

export function BillsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load bills — from Supabase if signed in, localStorage otherwise
  useEffect(() => {
    if (user) {
      setSyncing(true);
      supabase
        .from("bills")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            const remoteBills = data.map(rowToBill);

            // If user has local bills but no remote bills, push local to remote
            const localBills = loadBills();
            if (remoteBills.length === 0 && localBills.length > 0) {
              const rows = localBills.map((b) => ({
                id: b.id,
                user_id: user.id,
                name: b.name,
                category_label: b.category.label,
                category_emoji: b.category.emoji,
                amount: b.amount,
                due_date: b.dueDate,
                is_paid: b.isPaid,
                paid_at: b.paidAt || null,
                is_recurring: b.isRecurring,
                notes: b.notes || null,
              }));
              supabase.from("bills").upsert(rows).then(({ error: syncError }) => {
                if (syncError) toast.error("Failed to sync bills to cloud");
                setBills(localBills);
                setSyncing(false);
              });
            } else {
              setBills(remoteBills);
              saveBillsLocal(remoteBills);
              setSyncing(false);
            }
          } else {
            if (error) toast.error("Failed to load bills from cloud");
            setBills(loadBills());
            setSyncing(false);
          }
          setHydrated(true);
        });
    } else {
      setBills(loadBills());
      setHydrated(true);
    }
  }, [user]);

  // Save to localStorage whenever bills change
  useEffect(() => {
    if (hydrated) saveBillsLocal(bills);
  }, [bills, hydrated]);

  const addBill = useCallback(
    (bill: Omit<Bill, "id">) => {
      const id = typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const newBill: Bill = { ...bill, id };
      setBills((prev) => [...prev, newBill]);

      if (user) {
        supabase.from("bills").insert({
          id: newBill.id,
          user_id: user.id,
          name: newBill.name,
          category_label: newBill.category.label,
          category_emoji: newBill.category.emoji,
          amount: newBill.amount,
          due_date: newBill.dueDate,
          is_paid: newBill.isPaid,
          paid_at: newBill.paidAt || null,
          is_recurring: newBill.isRecurring,
          notes: newBill.notes || null,
        }).then(({ error }) => {
          if (error) toast.error("Failed to save bill to cloud");
        });
      }
    },
    [user]
  );

  const updateBill = useCallback(
    (id: string, updates: Partial<Omit<Bill, "id">>) => {
      setBills((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );

      if (user) {
        const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.category !== undefined) {
          dbUpdates.category_label = updates.category.label;
          dbUpdates.category_emoji = updates.category.emoji;
        }
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
        if (updates.paidAt !== undefined) dbUpdates.paid_at = updates.paidAt;
        if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

        supabase.from("bills").update(dbUpdates).eq("id", id).eq("user_id", user.id)
          .then(({ error }) => {
            if (error) toast.error("Failed to update bill");
          });
      }
    },
    [user]
  );

  const togglePaid = useCallback(
    (id: string) => {
      setBills((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                isPaid: !b.isPaid,
                paidAt: !b.isPaid ? new Date().toISOString() : undefined,
              }
            : b
        )
      );

      if (user) {
        // Read current state to determine new value
        const bill = bills.find((b) => b.id === id);
        if (bill) {
          const newPaid = !bill.isPaid;
          supabase
            .from("bills")
            .update({
              is_paid: newPaid,
              paid_at: newPaid ? new Date().toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("user_id", user.id)
            .then(({ error }) => {
              if (error) toast.error("Failed to update payment status");
            });
        }
      }
    },
    [user, bills]
  );

  const deleteBill = useCallback(
    (id: string) => {
      setBills((prev) => prev.filter((b) => b.id !== id));

      if (user) {
        supabase.from("bills").delete().eq("id", id).eq("user_id", user.id)
          .then(({ error }) => {
            if (error) toast.error("Failed to delete bill from cloud");
          });
      }
    },
    [user]
  );

  const unpaidBills = useMemo(
    () =>
      bills
        .filter((b) => !b.isPaid)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [bills]
  );

  const paidBills = useMemo(
    () =>
      bills
        .filter((b) => b.isPaid)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [bills]
  );

  const totalDue = useMemo(
    () => unpaidBills.reduce((sum, b) => sum + b.amount, 0),
    [unpaidBills]
  );

  const overdueCount = useMemo(() => {
    const today = todayISO();
    return unpaidBills.filter((b) => b.dueDate < today).length;
  }, [unpaidBills]);

  const upcomingCount = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() + UPCOMING_DAYS);
    const todayStr = todayISO();
    const cutoffStr = cutoff.toISOString().split("T")[0] as string;
    return unpaidBills.filter(
      (b) => b.dueDate >= todayStr && b.dueDate <= cutoffStr
    ).length;
  }, [unpaidBills]);

  const chartData = useMemo(() => {
    const points: { day: number; amount: number }[] = [{ day: 1, amount: 0 }];
    let cumulative = 0;

    for (const bill of unpaidBills) {
      const day = new Date(bill.dueDate + "T00:00:00").getDate();
      const prev = points[points.length - 1]!;
      if (day - prev.day > 2) {
        points.push({ day: day - 1, amount: cumulative });
      }
      cumulative += bill.amount;
      points.push({ day, amount: cumulative });
    }

    const last = points[points.length - 1]!;
    if (last.day < 30) {
      points.push({ day: 30, amount: last.amount });
    }

    return points;
  }, [unpaidBills]);

  if (!hydrated) return null;

  return (
    <BillsContext.Provider
      value={{
        bills,
        addBill,
        updateBill,
        togglePaid,
        deleteBill,
        unpaidBills,
        paidBills,
        totalDue,
        overdueCount,
        upcomingCount,
        chartData,
        syncing,
      }}
    >
      {children}
    </BillsContext.Provider>
  );
}

export function useBills() {
  const ctx = useContext(BillsContext);
  if (!ctx) throw new Error("useBills must be used within BillsProvider");
  return ctx;
}
