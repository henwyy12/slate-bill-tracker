"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Infinity,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { useBills } from "@/lib/use-bills";
import { useProfile, FREE_BILL_LIMIT } from "@/lib/use-profile";
import { usePurchase } from "@/lib/use-purchase";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const router = useRouter();
  const { bills } = useBills();
  const { isPro } = useProfile();
  const { purchasePro, restorePurchases, loading } = usePurchase();

  // If already pro, redirect home
  if (isPro) {
    router.replace("/");
    return null;
  }

  const billCount = bills.length;

  return (
    <div className="animate-slide-up min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex items-center px-2 pt-12 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      <div className="px-5">
        {/* Hero */}
        <div className="mt-4 mb-6">
          <h1 className="flex items-center gap-2.5 text-4xl font-heading">
            Slate Lifetime
            <Sparkles className="size-6 text-accent" />
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve used {billCount} of {FREE_BILL_LIMIT} free bills.
            Unlock everything with a single purchase — no subscriptions, ever.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
            <Infinity className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Unlimited bills</p>
              <p className="text-xs text-muted-foreground">
                Track every bill, card, and subscription you have
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
            <Shield className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Cloud sync across all devices</p>
              <p className="text-xs text-muted-foreground">
                Your bills stay safe and always up to date
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
            <Zap className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Every future update — forever</p>
              <p className="text-xs text-muted-foreground">
                New features, improvements, and fixes included
              </p>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-sm text-muted-foreground">$</span>
              <span className="text-3xl font-heading">2.99</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">one-time purchase</p>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={loading}
            onClick={purchasePro}
          >
            {loading ? "Processing..." : "Upgrade to Lifetime"}
          </Button>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={restorePurchases}
          className="mt-4 w-full text-center text-sm text-muted-foreground underline underline-offset-2 disabled:opacity-50"
        >
          Restore purchases
        </button>
      </div>
    </div>
  );
}
