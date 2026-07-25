import React from 'react';

interface ToastProps {
  message: string | null;
}

/** Transient confirmation pill above the tab bar. Self-dismisses via useToast. */
export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return <div className="app-toast">{message}</div>;
};
