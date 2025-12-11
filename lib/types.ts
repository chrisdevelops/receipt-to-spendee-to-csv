export type ReceiptType = 'business' | 'personal';

export interface Receipt {
  id: string;
  type: ReceiptType;
  date: string;
  category: string;
  amount: number;
  tax: number;
  note: string;
  rawText?: string;
  imageUrl?: string;
}

