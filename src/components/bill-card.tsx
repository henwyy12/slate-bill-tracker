"use client";

import type { Bill } from "@/lib/types";
import { useBills } from "@/lib/use-bills";
import { cn, formatPeso, formatShortDate, todayISO } from "@/lib/utils";
import { Check } from "lucide-react";

function isOverdue(bill: Bill): boolean {
  return !bill.isPaid && bill.dueDate < todayISO();
}

export function BillCard({ bill }: { bill: Bill }) {
  const { togglePaid } = useBills();
  const overdue = isOverdue(bill);

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border border-border p-4",
        overdue && "border-l-2 border-l-destructive",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => togglePaid(bill.id)}
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
              bill.isPaid
                ? "border-accent bg-accent text-white"
                : "border-input hover:border-foreground/50",
            )}
          >
            {bill.isPaid && <Check className="size-3" />}
          </button>
          <div>
            <p className={cn("text-sm font-medium", bill.isPaid && "line-through text-muted-foreground")}>
              {bill.name}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
              {bill.category.emoji} {bill.category.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-base font-heading", bill.isPaid && "text-muted-foreground")}>
            ₱{formatPeso(bill.amount)}
          </p>
          <p
            className={cn(
              "text-[11px]",
              overdue
                ? "text-destructive font-medium"
                : bill.isPaid
                  ? "text-accent font-medium"
                  : "text-muted-foreground",
            )}
          >
            {bill.isPaid
              ? "Paid"
              : overdue
                ? "Overdue"
                : `Due ${formatShortDate(bill.dueDate)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
