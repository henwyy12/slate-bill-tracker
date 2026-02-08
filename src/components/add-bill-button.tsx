"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function AddBillButton() {
  const pathname = usePathname();
  if (pathname === "/add-bill") return null;

  return (
    <Link
      href="/add-bill"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 shadow-lg transition-transform active:scale-95"
    >
      <Plus className="size-4 text-primary-foreground" />
      <span className="text-sm font-medium text-primary-foreground">
        Add Bill
      </span>
    </Link>
  );
}
