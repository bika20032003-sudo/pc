import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * مكون الإشعارات والتنبيهات الموحد للوزارة (Global Toast Notification)
 */
export default function GlobalToast({ message, type = 'success', onClose, duration = 4500 }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onClose) onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} className="toast-icon-svg text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="toast-icon-svg text-amber-500" />;
      case 'info':
        return <Info size={20} className="toast-icon-svg text-blue-500" />;
      default:
        return <CheckCircle2 size={20} className="toast-icon-svg text-emerald-500" />;
    }
  };

  return (
    <div className={`moi-global-toast-container ${type}`} role="alert" aria-live="assertive">
      <div className="moi-global-toast">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-body">
          <span className="toast-title">
            {type === 'error' ? 'تنبيه أمني / خطأ' : type === 'warning' ? 'ملاحظة هامة' : 'إشعار من المنظومة'}
          </span>
          <p className="toast-message">{message}</p>
        </div>
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="إغلاق التنبيه"
        >
          <X size={16} />
        </button>
        {/* Subtle timer progress bar */}
        <div className="toast-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
