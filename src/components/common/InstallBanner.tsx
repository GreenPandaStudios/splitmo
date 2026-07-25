import React, { useState } from 'react';
import { useInstallPrompt } from '../../hooks';
import { Download, Share, X } from 'lucide-react';

/** One-time nudge to install. Owns its own state so App just renders it. */
export const InstallBanner: React.FC = () => {
  const { canInstall, needsIosInstructions, dismissed, promptInstall, dismiss } = useInstallPrompt();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (dismissed || (!canInstall && !needsIosInstructions)) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-copy">
        <strong>Add Splitmo to your home screen</strong>
        <span>Opens full screen and keeps working without signal.</span>
        {showIosSteps && (
          <span className="install-ios-steps">
            Tap <Share size={12} /> Share, then <strong>Add to Home Screen</strong>.
          </span>
        )}
      </div>

      <div className="install-banner-actions">
        {canInstall ? (
          <button className="btn-secondary-small" onClick={promptInstall}>
            <Download size={13} /> Install
          </button>
        ) : (
          <button className="btn-secondary-small" onClick={() => setShowIosSteps(true)}>
            <Share size={13} /> How
          </button>
        )}
        <button className="close-btn" onClick={dismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
