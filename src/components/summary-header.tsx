import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/animated-counter";

export function SummaryHeader({
  totalDue,
  overdueCount,
  upcomingCount,
}: {
  totalDue: number;
  overdueCount: number;
  upcomingCount: number;
}) {
  return (
    <div className="px-5 pt-10 pb-6">
      <p className="text-sm text-muted-foreground">Your bills this month</p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-heading text-lg text-muted-foreground">₱</span>
        <h1 className="font-heading text-5xl">
          <AnimatedCounter value={totalDue} />
        </h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">total due</p>

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
