"use client";

import { SummaryHeader } from "@/components/summary-header";
import { SpendingChart } from "@/components/spending-chart";
import { BillList } from "@/components/bill-list";
import { useBills } from "@/lib/use-bills";

export default function HomePage() {
  const { totalDue, overdueCount, upcomingCount } = useBills();

  return (
    <div>
      <SummaryHeader
        totalDue={totalDue}
        overdueCount={overdueCount}
        upcomingCount={upcomingCount}
      />

      <SpendingChart />

      <BillList />
    </div>
  );
}
