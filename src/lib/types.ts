export interface BillTag {
  label: string;
  emoji: string;
}

export interface UserProfile {
  name: string;
  country: string;
  currencySymbol: string;
  locale: string;
  email?: string;
}

export interface Bill {
  id: string;
  name: string;
  category: BillTag;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  isRecurring: boolean;
  notes?: string;
}
