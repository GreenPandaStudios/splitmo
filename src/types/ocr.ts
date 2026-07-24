import type { CurrencyCode, ExpenseCategory } from './index';

export interface ExtractedLineItem {
  description: string;
  amount: number;
}

export interface ReceiptOCRResult {
  merchantName?: string;
  totalAmount?: number;
  currency?: CurrencyCode;
  date?: string;
  category?: ExpenseCategory;
  lineItems?: ExtractedLineItem[];
  rawText?: string;
  confidence?: number;
}
