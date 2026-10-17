import React, { useMemo } from 'react';
import { Activity, GitCommit, Star, Code2, Users } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const CARD =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all';
const NEUTRAL_ICON = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300';
const GREEN_ICON = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400';

function StatCard({ label, icon: Icon, value, caption, accent = false, className = '', suffix, truncate = false }) {
  return (
    <div className={`${CARD} ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className={`text-[10px] font-mono uppercase tracking-wider font-semibold truncate ${
            accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          {label}
        </span>
        <div className={`p-1 rounded-lg shrink-0 ${accent ? GREEN_ICON : NEUTRAL_ICON}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div
        className={`text-lg sm:text-xl font-mono font-bold ${truncate ? 'truncate' : ''} ${
          accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
        }`}
      >
        {value}
        {suffix && <span className="text-xs font-normal text-neutral-400"> {suffix}</span>}
      </div>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">{caption}</p>
    </div>
  );
}

export default function CountryAnalytics({ developers = [] }) {
  const { t, formatNumber } = useI18n();

  const stats = useMemo(() => {
    const totalDevs = developers.length;
    if (totalDevs === 0) return null;

    let contributions = 0;
    let commits = 0;
    let stars = 0;
    let followers = 0;
    const langMap = {};

    developers.forEach((dev) => {
      contributions += dev.live_contributions || dev.estimated_commits || 0;
      commits += dev.estimated_commits || 0;
      stars += dev.stars_received || 0;
      followers += dev.followers || 0;
      (dev.languages || []).forEach((l) => {
        if (l) langMap[l] = (langMap[l] || 0) + 1;
      });
    });

    let topLang = null;
    let topLangCount = 0;
    Object.entries(langMap).forEach(([lang, count]) => {
      if (count > topLangCount) {
        topLang = lang;
        topLangCount = count;
      }
    });

    return {
      totalDevs,
      contributions,
      commits,
      stars,
      avgFollowers: Math.round(followers / totalDevs),
      topLang,
      topLangCount
    };
  }, [developers]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4 sm:mb-6">
      <StatCard
        accent
        icon={Activity}
        label={t('analytics.totalContributions')}
        value={formatNumber(stats.contributions)}
        caption={t('analytics.topCommitters', { n: stats.totalDevs })}
      />
      <StatCard
        icon={GitCommit}
        label={t('analytics.totalCommits')}
        value={formatNumber(stats.commits)}
        caption={t('analytics.lifetime')}
      />
      <StatCard
        icon={Star}
        label={t('analytics.totalStars')}
        value={formatNumber(stats.stars)}
        caption={t('analytics.communityStars')}
      />
      <StatCard
        truncate
        icon={Code2}
        label={t('analytics.topStack')}
        value={stats.topLang || t('analytics.openSource')}
        caption={t('analytics.specialize', { n: stats.topLangCount })}
      />
      <StatCard
        className="col-span-2 sm:col-span-1"
        icon={Users}
        label={t('analytics.avgCommunity')}
        value={formatNumber(stats.avgFollowers)}
        suffix={t('analytics.avg')}
        caption={t('analytics.followersPer')}
      />
    </div>
  );
}
