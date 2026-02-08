"use client";

import { useState } from "react";
import { BillCard } from "@/components/bill-card";
import { useBills } from "@/lib/use-bills";

type Tab = "unpaid" | "paid";

export function BillList() {
  const [activeTab, setActiveTab] = useState<Tab>("unpaid");
  const { unpaidBills, paidBills } = useBills();

  const bills = activeTab === "unpaid" ? unpaidBills : paidBills;

  return (
    <div className="py-4">
      {/* Segmented control — TrumpRx style */}
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
      <div className="mt-4 space-y-3 px-5">
        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}

        {bills.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {activeTab === "unpaid"
              ? "No unpaid bills. Tap + to add one."
              : "No paid bills yet."}
          </p>
        )}
      </div>
    </div>
  );
}
