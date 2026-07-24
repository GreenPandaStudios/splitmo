import React, { useState } from 'react';
import type { ReceiptOCRResult, Expense, Member } from '../../types';
import { scanReceiptImage } from '../../services';
import { ScanLine, UploadCloud, CheckCircle, Loader2, ArrowRight, X } from 'lucide-react';

interface ReceiptOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (partialExpense: Partial<Expense>) => void;
  members: Member[];
}

export const ReceiptOcrModal: React.FC<ReceiptOcrModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<ReceiptOCRResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const res = await scanReceiptImage(selectedFile, (pct, status) => {
        setProgressStatus(`${status} (${pct}%)`);
      });
      setOcrResult(res);
    } catch (err: any) {
      alert(err.message || 'Error processing receipt image.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplyResult = () => {
    if (!ocrResult) return;
    onReceiptScanned({
      title: ocrResult.merchantName || 'Scanned Receipt',
      amount: ocrResult.totalAmount || 0,
      currency: ocrResult.currency || 'ISK',
      date: ocrResult.date || new Date().toISOString().split('T')[0],
      category: ocrResult.category || 'food',
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card slide-up large-modal">
        <div className="modal-header">
          <h2>Receipt OCR Scanner 🧾</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="ocr-modal-body">
          <div className="ocr-upload-zone">
            {previewUrl ? (
              <div className="preview-image-box">
                <img src={previewUrl} alt="Receipt preview" className="receipt-preview-img" />
                <button className="btn-secondary-small change-img-btn" onClick={() => setSelectedFile(null)}>
                  Change Photo
                </button>
              </div>
            ) : (
              <label className="dropzone-label">
                <UploadCloud size={40} className="icon-blue" />
                <span className="dropzone-title">Upload or Drag Receipt Photo</span>
                <span className="dropzone-sub">Supports Bónus, Krónan, N1, restaurants (JPEG, PNG, WebP)</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="file-input-hidden" />
              </label>
            )}
          </div>

          <div className="ocr-analysis-zone">
            {isScanning ? (
              <div className="ocr-loading-box">
                <Loader2 size={36} className="spinning-icon icon-blue" />
                <p className="loading-status">{progressStatus}</p>
              </div>
            ) : ocrResult ? (
              <div className="ocr-results-box">
                <div className="result-header">
                  <CheckCircle size={20} className="icon-green" />
                  <span>Scan Complete</span>
                </div>

                <div className="extracted-fields-list">
                  <div className="field-row">
                    <span className="field-lbl">Merchant:</span>
                    <strong>{ocrResult.merchantName || 'Unknown Store'}</strong>
                  </div>
                  <div className="field-row">
                    <span className="field-lbl">Extracted Total:</span>
                    <strong className="text-highlight">
                      {ocrResult.totalAmount ? `${ocrResult.totalAmount} ${ocrResult.currency}` : 'Not detected'}
                    </strong>
                  </div>
                  <div className="field-row">
                    <span className="field-lbl">Detected Date:</span>
                    <span>{ocrResult.date}</span>
                  </div>
                  <div className="field-row">
                    <span className="field-lbl">Auto Category:</span>
                    <span>{ocrResult.category}</span>
                  </div>
                </div>

                <button className="btn-primary full-width" onClick={handleApplyResult}>
                  Use Extracted Receipt Data <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="ocr-prompt-box">
                <ScanLine size={36} className="icon-muted" />
                <p>Select a receipt photo to scan totals in ISK or USD automatically.</p>
                <button
                  className="btn-primary"
                  disabled={!selectedFile}
                  onClick={handleStartScan}
                >
                  Start OCR Scanning
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
