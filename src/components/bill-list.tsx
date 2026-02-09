"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BillCard } from "@/components/bill-card";
import { useBills } from "@/lib/use-bills";
import { formatAmount } from "@/lib/utils";
import { useProfile } from "@/lib/use-profile";
import type { Bill } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

type Tab = "unpaid" | "paid";

interface MonthGroup {
  key: string;
  label: string;
  total: number;
  bills: Bill[];
}

function groupByMonth(bills: Bill[]): MonthGroup[] {
  const map = new Map<string, Bill[]>();

  for (const bill of bills) {
    const key = bill.dueDate.slice(0, 7); // "2026-02"
    const existing = map.get(key);
    if (existing) {
      existing.push(bill);
    } else {
      map.set(key, [bill]);
    }
  }

  // Sort months newest first
  const sorted = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return sorted.map(([key, monthBills]) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    const label = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const total = monthBills.reduce((sum, b) => sum + b.amount, 0);

    return { key, label, total, bills: monthBills };
  });
}

export function BillList() {
  const [activeTab, setActiveTab] = useState<Tab>("unpaid");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const { unpaidBills, paidBills } = useBills();
  const { currencySymbol } = useProfile();

  const monthGroups = useMemo(() => groupByMonth(paidBills), [paidBills]);

  // Live data for the selected month — auto-nulls when bills are gone
  const selectedMonth = useMemo(
    () => monthGroups.find((g) => g.key === selectedMonthKey) ?? null,
    [monthGroups, selectedMonthKey],
  );

  // Close drawer when a bill is deleted or toggled out of the month
  const prevCount = useRef(0);
  useEffect(() => {
    const count = selectedMonth?.bills.length ?? 0;
    if (prevCount.current > 0 && count < prevCount.current) {
      setSelectedMonthKey(null);
    }
    prevCount.current = count;
  }, [selectedMonth?.bills.length]);

  return (
    <div className="py-4">
      {/* Segmented control */}
      <div className="mx-5 flex rounded-xl bg-secondary p-1">
        <button
          onClick={() => setActiveTab("unpaid")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
            activeTab === "unpaid"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unpaid ({unpaidBills.length})
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
            activeTab === "paid"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paid ({paidBills.length})
        </button>
      </div>

      {/* Bill cards */}
      <div className="mt-4 px-5">
        {activeTab === "unpaid" ? (
          <>
            <div className="space-y-3">
              {unpaidBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
            {unpaidBills.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No unpaid bills. Tap + to add one.
              </p>
            )}
          </>
        ) : (
          <>
            {monthGroups.map((group) => (
              <div key={group.key} className="mb-6">
                {/* Month header — tappable */}
                <button
                  onClick={() => setSelectedMonthKey(group.key)}
                  className="mb-3 flex w-full items-center justify-between text-left"
                >
                  <h3 className="text-2xl font-heading">{group.label}</h3>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </button>
                {/* Bills in this month */}
                <div className="space-y-3">
                  {group.bills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} />
                  ))}
                </div>
              </div>
            ))}
            {paidBills.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No paid bills yet.
              </p>
            )}
          </>
        )}
      </div>

      {/* Month detail drawer — always mounted so Vaul can animate closed */}
      <Drawer
        open={!!selectedMonth}
        onOpenChange={(open) => {
          if (!open) setSelectedMonthKey(null);
        }}
      >
        <DrawerContent>
          {selectedMonth && (
            <>
              <DrawerHeader className="pb-0">
                <DrawerTitle className="text-center text-2xl font-heading">
                  {selectedMonth.label}
                </DrawerTitle>
                <DrawerDescription className="text-center">
                  {selectedMonth.bills.length} bill
                  {selectedMonth.bills.length !== 1 && "s"} paid
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-6 pb-2 pt-2">
                <p className="text-center font-heading text-4xl">
                  {currencySymbol} {formatAmount(selectedMonth.total)}
                </p>
              </div>

              <div className="max-h-[50vh] overflow-y-auto px-5 pb-10 pt-3">
                <div className="space-y-3">
                  {selectedMonth.bills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} />
                  ))}
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
