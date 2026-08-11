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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-semibold text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot inline-block"></span>
          <span>GitHub Actions Cron (Every 5 Hours)</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Last sync:</span>
          <strong className="text-slate-900 font-mono">{formatDate(lastUpdated)}</strong>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        <GitBranch className="w-3.5 h-3.5 text-slate-500" />
        <span>Workflow `.github/workflows/update_rankings.yml`</span>
      </div>
    </div>
  );
}
