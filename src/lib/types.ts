export interface BillTag {
  label: string;
  emoji: string;
}

export interface Bill {
  id: string;
  name: string;
  category: BillTag;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  isRecurring: boolean;
  notes?: string;
}
