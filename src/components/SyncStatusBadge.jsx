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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 mb-4 sm:mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium min-h-8">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Last sync:</span>
          <strong className="text-slate-900 font-mono">{formatDate(lastUpdated)}</strong>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 max-w-full text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
        <span className="truncate">Workflow `.github/workflows/update_rankings.yml`</span>
      </div>
    </div>
  );
}
