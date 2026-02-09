import { MobileShell } from "@/components/mobile-shell";
import { AddBillButton } from "@/components/add-bill-button";
import { BillsProvider } from "@/lib/use-bills";
import { ProfileGuard } from "@/components/profile-guard";

// All app routes are client-side (auth, localStorage) — skip static prerendering
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileGuard>
      <BillsProvider>
        <MobileShell>
          {children}
          <AddBillButton />
        </MobileShell>
      </BillsProvider>
    </ProfileGuard>
  );
}
