import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const BLOCK = 'bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${BLOCK} w-12 h-12 rounded-2xl shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${BLOCK} h-4 w-2/3`} />
          <div className={`${BLOCK} h-3 w-1/3`} />
        </div>
      </div>
      <div className={`${BLOCK} h-14 w-full mb-3.5`} />
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className={`${BLOCK} h-12`} />
        <div className={`${BLOCK} h-12`} />
      </div>
      <div className={`${BLOCK} h-10 w-full`} />
    </div>
  );
}

/** Placeholder grid shown while the dataset downloads. */
export default function LoadingSkeleton({ count = 6 }) {
  const { t } = useI18n();

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{t('app.loading')}</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
