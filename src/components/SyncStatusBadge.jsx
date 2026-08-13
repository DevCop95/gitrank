import React from 'react';
import { Clock, GitBranch } from 'lucide-react';

export default function SyncStatusBadge({ lastUpdated }) {
  const formatDate = (isoString) => {
    if (!isoString) return 'just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-600 dark:text-neutral-400 mb-4 sm:mb-6 shadow-2xs transition-colors">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-medium min-h-8">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>Last automated sync:</span>
          <strong className="text-neutral-900 dark:text-white font-mono">{formatDate(lastUpdated)}</strong>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 max-w-full text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700">
        <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
        <span className="truncate">Automated GitHub Actions Rotation</span>
      </div>
    </div>
  );
}
