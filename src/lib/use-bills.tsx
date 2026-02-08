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

const STORAGE_KEY = "slate-bills";
const UPCOMING_DAYS = 7;

interface BillsContextValue {
  bills: Bill[];
  addBill: (bill: Omit<Bill, "id">) => void;
  togglePaid: (id: string) => void;
  deleteBill: (id: string) => void;
  unpaidBills: Bill[];
  paidBills: Bill[];
  totalDue: number;
  overdueCount: number;
  upcomingCount: number;
  chartData: { day: number; amount: number }[];
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

function saveBills(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function BillsProvider({ children }: { children: React.ReactNode }) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBills(loadBills());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveBills(bills);
  }, [bills, hydrated]);

  const addBill = useCallback((bill: Omit<Bill, "id">) => {
    const newBill: Bill = { ...bill, id: crypto.randomUUID() };
    setBills((prev) => [...prev, newBill]);
  }, []);

  const togglePaid = useCallback((id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isPaid: !b.isPaid } : b)),
    );
  }, []);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const unpaidBills = useMemo(
    () =>
      bills
        .filter((b) => !b.isPaid)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [bills],
  );

  const paidBills = useMemo(
    () =>
      bills
        .filter((b) => b.isPaid)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [bills],
  );

  const totalDue = useMemo(
    () => unpaidBills.reduce((sum, b) => sum + b.amount, 0),
    [unpaidBills],
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
      (b) => b.dueDate >= todayStr && b.dueDate <= cutoffStr,
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
        togglePaid,
        deleteBill,
        unpaidBills,
        paidBills,
        totalDue,
        overdueCount,
        upcomingCount,
        chartData,
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
