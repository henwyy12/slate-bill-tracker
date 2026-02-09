import type { BillTag } from "./types";

// ── Bill Types ────────────────────────────────────────

export function getNotesPlaceholder(label: string): string {
  const map: Record<string, string> = {
    Rent: "e.g. Unit number, landlord contact",
    Electricity: "e.g. Account number, meter reading",
    Water: "e.g. Account number, meter reading",
    Internet: "e.g. Plan name, account number",
    Phone: "e.g. Phone number, plan details",
    Insurance: "e.g. Policy number, coverage type",
    Loans: "e.g. What type of loan, remaining balance",
    "Car Payment": "e.g. Plate number, financing details",
    Food: "e.g. Grocery store, meal plan",
    Shopping: "e.g. Store name, what you bought",
    Transport: "e.g. Route, pass type",
    "Credit Card": "e.g. What type of credit card",
  };
  return map[label] || "Any reminders about this bill...";
}

export const BILL_TYPES: BillTag[] = [
  // Needs
  { label: "Rent", emoji: "🏠" },
  { label: "Electricity", emoji: "💡" },
  { label: "Water", emoji: "💧" },
  { label: "Internet", emoji: "🌐" },
  { label: "Phone", emoji: "📱" },
  { label: "Insurance", emoji: "🛡️" },
  { label: "Loans", emoji: "💳" },
  { label: "Car Payment", emoji: "🚗" },
  { label: "Food", emoji: "🍔" },
  // Wants
  { label: "Shopping", emoji: "🛍️" },
  { label: "Transport", emoji: "🚌" },
];
