import { createWorker } from 'tesseract.js';
import type { ReceiptOCRResult } from '../types';
import { parseReceiptText } from './receiptParser';

export { parseReceiptText };

/**
 * Runs OCR on a receipt image. The engine's own progress is forwarded so the UI can show real
 * movement rather than three hardcoded steps — recognition is the slow part.
 */
export async function scanReceiptImage(
  imageFile: File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<ReceiptOCRResult> {
  let worker;
  try {
    onProgress?.(5, 'Starting OCR engine');
    worker = await createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          onProgress?.(10 + Math.round(m.progress * 85), 'Reading receipt');
        }
      },
    });

    onProgress?.(10, 'Reading receipt');
    const result = await worker.recognize(imageFile);

    onProgress?.(96, 'Extracting totals');
    return parseReceiptText(result.data.text);
  } catch (err) {
    console.error('OCR processing error:', err);
    throw new Error('Could not read that image. Try a sharper, straighter photo of the receipt.');
  } finally {
    if (worker) await worker.terminate();
  }
}
