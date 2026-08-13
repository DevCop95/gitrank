import React from 'react';
import { Activity, GitCommit, Star, Code2, Users } from 'lucide-react';

export default function CountryAnalytics({ developers = [], countryName = 'Worldwide' }) {
  if (!developers || developers.length === 0) return null;

  const totalDevs = developers.length;

  const totalContributions = developers.reduce(
    (acc, dev) => acc + (dev.live_contributions || dev.estimated_commits || 0),
    0
  );

  const totalCommits = developers.reduce(
    (acc, dev) => acc + (dev.estimated_commits || 0),
    0
  );

  const totalStars = developers.reduce(
    (acc, dev) => acc + (dev.stars_received || 0),
    0
  );

  const totalFollowers = developers.reduce(
    (acc, dev) => acc + (dev.followers || 0),
    0
  );

  const avgFollowers = Math.round(totalFollowers / totalDevs);

  // Compute dominant language
  const langMap = {};
  developers.forEach((d) => {
    (d.languages || []).forEach((l) => {
      if (l) langMap[l] = (langMap[l] || 0) + 1;
    });
  });

  let topLang = 'Open Source';
  let topLangCount = 0;
  Object.entries(langMap).forEach(([lang, count]) => {
    if (count > topLangCount) {
      topLang = lang;
      topLangCount = count;
    }
  });

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4 sm:mb-6">
      
      {/* 1. Total Contributions in GitHub Green */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            Total Contributions
          </span>
          <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatNumber(totalContributions)}
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          Top {totalDevs} committers
        </p>
      </div>

      {/* 2. Total Commits */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold truncate">
            Total Commits
          </span>
          <div className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
            <GitCommit className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-mono font-bold text-neutral-900 dark:text-white">
          {formatNumber(totalCommits)}
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          Lifetime commits
        </p>
      </div>

      {/* 3. Total Stars */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold truncate">
            Total Stars Earned
          </span>
          <div className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
            <Star className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-mono font-bold text-neutral-900 dark:text-white">
          {formatNumber(totalStars)}
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          Community stars
        </p>
      </div>

      {/* 4. Dominant Language */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold truncate">
            Top Tech Stack
          </span>
          <div className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
            <Code2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-mono font-bold text-neutral-900 dark:text-white truncate">
          {topLang}
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          {topLangCount} devs specialize
        </p>
      </div>

      {/* 5. Avg Followers */}
      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold truncate">
            Avg Community
          </span>
          <div className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-lg sm:text-xl font-mono font-bold text-neutral-900 dark:text-white">
          {formatNumber(avgFollowers)} <span className="text-xs font-normal text-neutral-400">avg</span>
        </div>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
          Followers per committer
        </p>
      </div>

    </div>
  );
}
