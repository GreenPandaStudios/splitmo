import React from 'react';
import { useInstallPrompt } from '../../hooks';
import { CheckCircle, Download, Share } from 'lucide-react';

/** Install entry point that survives dismissing the banner. */
export const InstallSection: React.FC = () => {
  const { canInstall, needsIosInstructions, isInstalled, promptInstall } = useInstallPrompt();

  return (
    <section className="section-block">
      <h2 className="section-title">Install</h2>
      <p className="section-sub">Run Splitmo full screen, straight from your home screen</p>

      <div className="section-body">
        {isInstalled ? (
          <span className="badge-pill active-badge"><CheckCircle size={11} /> Installed</span>
        ) : canInstall ? (
          <button className="btn-primary" onClick={promptInstall}>
            <Download size={15} /> Add to home screen
          </button>
        ) : needsIosInstructions ? (
          <p className="section-sub">
            In Safari, tap <Share size={12} /> Share, then <strong>Add to Home Screen</strong>.
          </p>
        ) : (
          <p className="section-sub">
            Your browser handles this from its own menu — look for <strong>Install</strong> or
            {' '}<strong>Add to Home screen</strong>.
          </p>
        )}
      </div>
    </section>
  );
};
