import React, { useEffect } from 'react';
import { X, Swords, GitCommit, Activity, Star, FolderGit2, Users, ExternalLink } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

export default function DeveloperCompareModal({ devA, devB, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!devA || !devB) return null;

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  const metrics = [
    {
      label: 'Live Contributions',
      icon: Activity,
      valA: devA.live_contributions || devA.estimated_commits || 0,
      valB: devB.live_contributions || devB.estimated_commits || 0
    },
    {
      label: 'Total Commits',
      icon: GitCommit,
      valA: devA.estimated_commits || 0,
      valB: devB.estimated_commits || 0
    },
    {
      label: 'Stars Received',
      icon: Star,
      valA: devA.stars_received || 0,
      valB: devB.stars_received || 0
    },
    {
      label: 'Followers',
      icon: Users,
      valA: devA.followers || 0,
      valB: devB.followers || 0
    },
    {
      label: 'Public Repositories',
      icon: FolderGit2,
      valA: devA.public_repos || 0,
      valB: devB.public_repos || 0
    }
  ];

  let scoreA = 0;
  let scoreB = 0;
  metrics.forEach((m) => {
    if (m.valA > m.valB) scoreA += 1;
    else if (m.valB > m.valA) scoreB += 1;
  });

  const langsA = new Set(devA.languages || []);
  const langsB = new Set(devB.languages || []);
  const sharedLangs = [...langsA].filter((l) => langsB.has(l));
  const uniqueA = [...langsA].filter((l) => !langsB.has(l));
  const uniqueB = [...langsB].filter((l) => !langsA.has(l));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Developer Comparison</span>
                <span className="px-2 py-0.2 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono rounded uppercase font-bold">
                  VS
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Statistical side-by-side
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all shadow-2xs cursor-pointer"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Dual Profile Matchup Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 relative">
            
            {/* Dev A Card */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-center flex flex-col items-center justify-between">
              {scoreA > scoreB && (
                <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-full text-[10px] font-bold font-mono">
                  Leader ({scoreA} wins)
                </div>
              )}
              <div className="relative mb-2.5">
                <img
                  src={devA.avatar_url}
                  alt={devA.login}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold rounded">
                  #{devA.rank}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate max-w-full">
                {cleanText(devA.name || devA.login)}
              </h3>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">@{devA.login}</p>
            </div>

            {/* VS Badge Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold flex items-center justify-center shadow-lg border-2 border-white dark:border-neutral-900">
              VS
            </div>

            {/* Dev B Card */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-center flex flex-col items-center justify-between">
              {scoreB > scoreA && (
                <div className="mb-2 inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-full text-[10px] font-bold font-mono">
                  Leader ({scoreB} wins)
                </div>
              )}
              <div className="relative mb-2.5">
                <img
                  src={devB.avatar_url}
                  alt={devB.login}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                />
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold rounded">
                  #{devB.rank}
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white truncate max-w-full">
                {cleanText(devB.name || devB.login)}
              </h3>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 truncate">@{devB.login}</p>
            </div>

          </div>

          {/* Metric Comparison Rows */}
          <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800/40 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold mb-2">
              Metrics Breakdown
            </h3>

            {metrics.map((m) => {
              const Icon = m.icon;
              const total = (m.valA + m.valB) || 1;
              const pctA = Math.round((m.valA / total) * 100);
              const pctB = 100 - pctA;
              const aWins = m.valA > m.valB;
              const bWins = m.valB > m.valA;

              return (
                <div key={m.label} className="bg-white dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <strong className={`text-sm ${aWins ? 'font-bold text-black dark:text-white' : 'text-neutral-500'}`}>
                        {formatNumber(m.valA)}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs">
                      <strong className={`text-sm ${bWins ? 'font-bold text-black dark:text-white' : 'text-neutral-500'}`}>
                        {formatNumber(m.valB)}
                      </strong>
                    </div>
                  </div>

                  {/* Split Bar */}
                  <div className="w-full h-2 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex gap-0.5">
                    <div
                      className={`h-full transition-all ${aWins ? 'bg-black dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-600'}`}
                      style={{ width: `${pctA}%` }}
                    />
                    <div
                      className={`h-full transition-all ${bWins ? 'bg-black dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-600'}`}
                      style={{ width: `${pctB}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tech Stack Overlap & Comparison */}
          <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold mb-3">
              Technologies
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono block mb-1.5">
                  Shared ({sharedLangs.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sharedLangs.length > 0 ? (
                    sharedLangs.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-mono rounded font-medium"
                      >
                        ✓ {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No shared technologies</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[11px] text-neutral-500 font-mono block mb-1">
                    Unique to @{devA.login}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {uniqueA.length > 0 ? (
                      uniqueA.map((l) => (
                        <span key={l} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-mono rounded">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 font-mono block mb-1">
                    Unique to @{devB.login}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {uniqueB.length > 0 ? (
                      uniqueB.map((l) => (
                        <span key={l} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-mono rounded">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between gap-3">
          <a
            href={devA.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-h-10 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Visit @{devA.login}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href={devB.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-h-10 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Visit @{devB.login}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
