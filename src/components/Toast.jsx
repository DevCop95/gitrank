import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function Toast({ toasts, onCloseToast }) {
  const { t } = useI18n();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-24 sm:bottom-5 right-0 sm:right-5 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border bg-black text-white dark:bg-white dark:text-black border-neutral-800 dark:border-neutral-200 backdrop-blur-md transition-all animate-toast-in"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-neutral-400 dark:text-neutral-600 shrink-0" />
              <span className="text-xs font-medium truncate">{toast.message}</span>
            </div>

            <button
              onClick={() => onCloseToast(toast.id)}
              className="text-neutral-400 hover:text-white dark:hover:text-black p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
              aria-label={t('toast.close')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
