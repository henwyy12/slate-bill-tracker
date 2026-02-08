import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns today's date as YYYY-MM-DD string. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0] as string;
}

/** Parses a YYYY-MM-DD string into a Date (local timezone). */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

/** Formats a YYYY-MM-DD string as "Feb 10", "Mar 22", etc. */
export function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Formats a number as Philippine Peso: 1,234.56 */
export function formatPeso(amount: number): string {
  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
