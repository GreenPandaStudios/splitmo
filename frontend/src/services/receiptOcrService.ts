import { createWorker } from 'tesseract.js';
import type { ReceiptOCRResult, CurrencyCode, ExpenseCategory } from '../types';

export async function scanReceiptImage(
  imageFile: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<ReceiptOCRResult> {
  let worker;
  try {
    if (onProgress) onProgress(10, 'Initializing OCR engine...');
    worker = await createWorker('eng');
    
    if (onProgress) onProgress(40, 'Recognizing receipt text...');
    const ret = await worker.recognize(imageFile);
    await worker.terminate();

    if (onProgress) onProgress(90, 'Parsing extracted text...');
    const rawText = ret.data.text;
    return parseReceiptText(rawText);
  } catch (err) {
    if (worker) await worker.terminate();
    console.error('OCR processing error:', err);
    throw new Error('Failed to scan receipt image. Please try again or enter details manually.');
  }
}

export function parseReceiptText(text: string): ReceiptOCRResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const merchantName = detectMerchant(text, lines);
  const { totalAmount, currency } = extractTotalAndCurrency(text, lines);
  const date = extractDate(text) || new Date().toISOString().split('T')[0];
  const category = mapMerchantCategory(merchantName);

  return {
    merchantName,
    totalAmount,
    currency,
    date,
    category,
    rawText: text,
    confidence: 0.85,
  };
}

function detectMerchant(fullText: string, lines: string[]): string {
  const textUpper = fullText.toUpperCase();
  if (textUpper.includes('BÓNUS') || textUpper.includes('BONUS')) return 'Bónus Supermarket';
  if (textUpper.includes('KRÓNAN') || textUpper.includes('KRONAN')) return 'Krónan Supermarket';
  if (textUpper.includes('N1')) return 'N1 Gas Station';
  if (textUpper.includes('OLÍS') || textUpper.includes('OLIS')) return 'Olís Gas & Grill';
  if (textUpper.includes('NETTÓ') || textUpper.includes('NETTO')) return 'Nettó Store';
  if (textUpper.includes('ICEWEAR')) return 'Icewear Iceland';
  if (textUpper.includes('SUBWAY')) return 'Subway Iceland';
  return lines[0] ? lines[0].substring(0, 30) : 'Icelandic Merchant';
}

function extractTotalAndCurrency(fullText: string, lines: string[]): { totalAmount?: number; currency: CurrencyCode } {
  let currency: CurrencyCode = 'ISK';
  if (fullText.includes('$') || fullText.toUpperCase().includes('USD')) currency = 'USD';

  const totalMatches = fullText.match(/(?:TOTAL|TOTALT|SAMTALS|UPPHÆÐ|DALS|AMOUNT|BAL)[^\d]*([\d.,\s]+)/i);
  if (totalMatches && totalMatches[1]) {
    const rawNum = totalMatches[1].replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(rawNum);
    if (!isNaN(parsed) && parsed > 0) return { totalAmount: Math.round(parsed), currency };
  }

  const allNumbers = lines
    .map((l) => l.match(/[\d.,]{3,}/g))
    .filter(Boolean)
    .flat()
    .map((n) => parseFloat(n!.replace(/\./g, '').replace(',', '.')))
    .filter((n) => !isNaN(n) && n > 50);

  if (allNumbers.length > 0) {
    return { totalAmount: Math.max(...allNumbers), currency };
  }

  return { totalAmount: undefined, currency };
}

function extractDate(fullText: string): string | undefined {
  const dateMatch = fullText.match(/(\d{2}[./-]\d{2}[./-]\d{2,4})|(\d{4}[./-]\d{2}[./-]\d{2})/);
  if (dateMatch) {
    const dStr = dateMatch[0].replace(/\./g, '-');
    const parts = dStr.split('-');
    if (parts[0].length === 4) return dStr;
    if (parts[2]?.length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return undefined;
}

function mapMerchantCategory(merchant: string): ExpenseCategory {
  const m = merchant.toLowerCase();
  if (m.includes('bónus') || m.includes('krónan') || m.includes('nettó')) return 'groceries';
  if (m.includes('n1') || m.includes('olís')) return 'gas';
  if (m.includes('icewear')) return 'activities';
  return 'food';
}
