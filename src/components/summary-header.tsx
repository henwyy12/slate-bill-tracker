"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";
import { useProfile } from "@/lib/use-profile";
import { formatAmount, getGreeting } from "@/lib/utils";

export function SummaryHeader({
  totalDue,
  overdueCount,
  upcomingCount,
}: {
  totalDue: number;
  overdueCount: number;
  upcomingCount: number;
}) {
  const { profile, currencySymbol, locale } = useProfile();
  const greeting = getGreeting();
  const initials = profile?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="px-5 pt-10 pb-6">
      <div className="flex items-start justify-between">
        <div>
          {profile && (
            <p className="text-sm text-muted-foreground">
              {greeting}, {profile.name}
            </p>
          )}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-base text-muted-foreground">{currencySymbol}</span>
            <h1 className="font-heading text-5xl">
              <AnimatedCounter value={totalDue} formatter={(n) => formatAmount(n, locale)} />
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">total due</p>
        </div>

        {profile && (
          <Link
            href="/settings"
            className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-transform active:scale-95"
          >
            {initials}
          </Link>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {overdueCount > 0 && (
          <Badge variant="destructive">
            {overdueCount} overdue
          </Badge>
        )}
        <Badge variant="outline">
          {upcomingCount} upcoming
        </Badge>
      </div>
    </div>
  );
}
