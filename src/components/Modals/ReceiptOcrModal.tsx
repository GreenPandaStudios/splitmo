import React, { useEffect, useRef, useState } from 'react';
import type { ReceiptOCRResult, Expense } from '../../types';
import { scanReceiptImage } from '../../services';
import { OcrResultPanel } from './OcrResultPanel';
import { UploadCloud, Loader2, X } from 'lucide-react';

interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (partialExpense: Partial<Expense>) => void;
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({ isOpen, onClose, onReceiptScanned }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<ReceiptOCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastFile = useRef<File | null>(null);

  // Object URLs leak unless revoked, and the modal can churn through several photos.
  const releasePreview = () => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (!isOpen) return null;

  const runScan = async (file: File) => {
    setIsScanning(true);
    setError(null);
    setResult(null);
    try {
      const scanned = await scanReceiptImage(file, (pct, label) => setStatus(`${label} ${pct}%`));
      setResult(scanned);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that image.');
    } finally {
      setIsScanning(false);
    }
  };

  /** Scanning starts as soon as a photo is chosen, so there is no button that can sit dead. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    releasePreview();
    lastFile.current = file;
    setPreviewUrl(URL.createObjectURL(file));
    void runScan(file);
  };

  const startOver = () => {
    releasePreview();
    lastFile.current = null;
    setResult(null);
    setError(null);
  };

  /**
   * Hands the scan to the expense form. It must not also call onClose: the parent switches the
   * active modal to the form, and closing afterwards would cancel that switch.
   */
  const applyResult = () => {
    if (!result) return;
    startOver();
    onReceiptScanned({
      title: result.merchantName || 'Scanned receipt',
      amount: result.totalAmount || 0,
      currency: result.currency || 'ISK',
      date: result.date || new Date().toISOString().split('T')[0],
      category: result.category || 'food',
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Scan a Receipt</h2>
          <button className="close-btn" onClick={() => { startOver(); onClose(); }}><X size={20} /></button>
        </div>

        <div className="ocr-modal-body">
          {previewUrl ? (
            <div className="preview-image-box">
              <img src={previewUrl} alt="Receipt preview" className="receipt-preview-img" />
              <button className="btn-secondary" onClick={startOver} disabled={isScanning}>
                Choose a different photo
              </button>
            </div>
          ) : (
            <label className="dropzone-label">
              <UploadCloud size={36} className="icon-blue" />
              <span className="dropzone-title">Take or choose a receipt photo</span>
              <span className="dropzone-sub">Scanning starts automatically. Works best on a flat, well-lit receipt.</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="file-input-hidden" />
            </label>
          )}

          {isScanning && (
            <div className="ocr-loading-box">
              <Loader2 size={32} className="spinning-icon icon-blue" />
              <p className="loading-status">{status || 'Reading receipt'}</p>
            </div>
          )}

          {error && !isScanning && (
            <div className="ocr-prompt-box">
              <p className="text-red">{error}</p>
              <button className="btn-primary" onClick={() => lastFile.current && runScan(lastFile.current)}>
                Try again
              </button>
            </div>
          )}

          {result && !isScanning && (
            <OcrResultPanel
              result={result}
              onUse={applyResult}
              onRescan={() => lastFile.current && runScan(lastFile.current)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
