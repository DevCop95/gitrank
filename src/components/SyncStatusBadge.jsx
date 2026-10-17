import React, { useEffect, useState } from 'react';
import { Clock, GitBranch } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function SyncStatusBadge({ lastUpdated }) {
  const { t, locale } = useI18n();

  // Re-render every minute so "x min ago" stays accurate
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return t('sync.justNow');
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return String(isoString);

    const diffMins = Math.max(0, Math.floor((now - date.getTime()) / (1000 * 60)));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return t('sync.justNow');
    if (diffMins < 60) return t('sync.minAgo', { n: diffMins });
    if (diffHours < 24) return t('sync.hAgo', { n: diffHours });
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6 shadow-2xs transition-colors">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium min-h-8">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>{t('sync.last')}</span>
          <strong className="text-neutral-900 dark:text-white font-mono">{formatDate(lastUpdated)}</strong>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 max-w-full text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
        <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
        <span className="truncate">{t('sync.rotation')}</span>
      </div>
    </div>
  );
}
