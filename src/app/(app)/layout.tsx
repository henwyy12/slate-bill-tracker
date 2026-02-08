import { MobileShell } from "@/components/mobile-shell";
import { AddBillButton } from "@/components/add-bill-button";
import { BillsProvider } from "@/lib/use-bills";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BillsProvider>
      <MobileShell>
        {children}
        <AddBillButton />
      </MobileShell>
    </BillsProvider>
  );
}
