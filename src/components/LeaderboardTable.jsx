import React from 'react';
import { Activity, ExternalLink, CheckCircle2, Swords, Share2, Bookmark } from 'lucide-react';
import { cleanText } from '../utils/cleanText';
import { copyText } from '../utils/copyText';
import { useI18n } from '../i18n/I18nContext';

const iconButton =
  'p-1.5 rounded-lg border transition-all cursor-pointer';
const neutralButton =
  'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700';
const activeButton = 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white';

function useRowActions({ dev, onNotify }) {
  const { t } = useI18n();

  const handleShareLink = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?country=${encodeURIComponent(dev.country || 'Worldwide')}&dev=${encodeURIComponent(dev.login)}`;
    const ok = await copyText(url);
    if (onNotify) {
      onNotify(ok ? t('toast.linkCopied', { login: dev.login }) : t('toast.copyFailed'), ok ? 'success' : 'info');
    }
  };

  return { handleShareLink };
}

/** Desktop table row. */
const TableRow = React.memo(function TableRow({
  dev,
  favActive,
  compareActive,
  onOpenModal,
  onToggleFavorite,
  onToggleCompare,
  onSelectLanguage,
  onNotify
}) {
  const { t, formatNumber } = useI18n();
  const { handleShareLink } = useRowActions({ dev, onNotify });

  const {
    rank,
    login,
    name,
    avatar_url,
    html_url = `https://github.com/${dev.login}`,
    location,
    public_repos = 0,
    followers = 0,
    estimated_commits = 0,
    live_contributions = 0,
    stars_received = 0,
    languages = []
  } = dev;

  const displayName = cleanText(name || login);

  return (
    <tr className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group">
      {/* Favorite Toggle */}
      <td className="py-2.5 px-3 text-center">
        <button
          onClick={() => onToggleFavorite(dev)}
          className={`${iconButton} ${
            favActive
              ? activeButton
              : 'bg-transparent border-transparent text-neutral-300 dark:text-neutral-600 hover:text-black dark:hover:text-white'
          }`}
          title={favActive ? t('card.unsaveTitle') : t('card.saveTitle')}
          aria-label={favActive ? t('card.removeFavAria') : t('card.addFavAria')}
          aria-pressed={favActive}
        >
          <Bookmark className={`w-3.5 h-3.5 ${favActive ? 'fill-current' : ''}`} />
        </button>
      </td>

      {/* Rank */}
      <td className="py-2.5 px-3 text-center font-mono font-bold">
        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
          rank === 1
            ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
            : 'text-neutral-600 dark:text-neutral-400 font-semibold'
        }`}>
          #{rank}
        </span>
      </td>

      {/* Developer Info */}
      <td className="py-2.5 px-4">
        <div className="flex items-center gap-2.5">
          <img
            src={avatar_url}
            alt=""
            className="w-8 h-8 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://avatars.githubusercontent.com/${login}`;
            }}
          />
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onOpenModal(dev)}
                className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline transition-colors text-xs text-left truncate cursor-pointer"
              >
                {displayName}
              </button>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">
              @{login} {location ? `• ${cleanText(location)}` : ''}
            </p>
          </div>
        </div>
      </td>

      {/* Languages */}
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
          {(languages && languages.length > 0 ? languages.slice(0, 2) : ['OpenSource']).map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLanguage(lang)}
              title={t('card.filterBy', { lang })}
              className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-mono rounded border border-neutral-200 dark:border-neutral-700 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {lang}
            </button>
          ))}
        </div>
      </td>

      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
        {formatNumber(live_contributions || estimated_commits)}
      </td>
      <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
        {formatNumber(estimated_commits)}
      </td>
      <td className="py-2.5 px-3 text-right font-mono text-neutral-700 dark:text-neutral-300">
        {formatNumber(stars_received)}
      </td>
      <td className="py-2.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
        {formatNumber(public_repos)}
      </td>
      <td className="py-2.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
        {formatNumber(followers)}
      </td>

      {/* Actions */}
      <td className="py-2.5 px-4 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onToggleCompare(dev)}
            className={`${iconButton} ${compareActive ? activeButton : neutralButton}`}
            title={compareActive ? t('card.uncompareTitle') : t('table.compare')}
            aria-label={t('table.compareAria')}
            aria-pressed={compareActive}
          >
            <Swords className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShareLink}
            className={`${iconButton} ${neutralButton}`}
            title={t('table.copyLink')}
            aria-label={t('table.shareAria')}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onOpenModal(dev)}
            aria-label={t('card.viewStatsAria', { name: displayName })}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-[11px] font-medium rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t('table.stats')}</span>
          </button>

          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconButton} ${neutralButton}`}
            title={t('table.githubProfile')}
            aria-label={t('card.openGithubAria', { name: displayName })}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>
    </tr>
  );
});

/** Compact list item used on phones where the 800px table would scroll sideways. */
const MobileRow = React.memo(function MobileRow({
  dev,
  favActive,
  compareActive,
  onOpenModal,
  onToggleFavorite,
  onToggleCompare,
  onNotify
}) {
  const { t, formatNumber } = useI18n();
  const { handleShareLink } = useRowActions({ dev, onNotify });

  const {
    rank,
    login,
    name,
    avatar_url,
    html_url = `https://github.com/${dev.login}`,
    estimated_commits = 0,
    live_contributions = 0,
    languages = []
  } = dev;

  const displayName = cleanText(name || login);

  return (
    <li className="p-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold ${
          rank === 1
            ? 'bg-black text-white dark:bg-white dark:text-black'
            : 'text-neutral-600 dark:text-neutral-400'
        }`}>
          #{rank}
        </span>
        <img
          src={avatar_url}
          alt=""
          loading="lazy"
          className="w-10 h-10 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://avatars.githubusercontent.com/${login}`;
          }}
        />
        <button
          onClick={() => onOpenModal(dev)}
          className="min-w-0 flex-1 text-left cursor-pointer"
          aria-label={t('card.viewStatsAria', { name: displayName })}
        >
          <span className="block font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate">{displayName}</span>
          <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">@{login}</span>
        </button>
        <div className="text-right shrink-0">
          <strong className="block font-mono text-sm text-emerald-600 dark:text-emerald-400">
            {formatNumber(live_contributions || estimated_commits)}
          </strong>
          <span className="text-[10px] font-mono uppercase text-neutral-400">{t('metric.contributions')}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          {languages.slice(0, 2).map((lang) => (
            <span
              key={lang}
              className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-mono rounded border border-neutral-200 dark:border-neutral-700"
            >
              {lang}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleFavorite(dev)}
            className={`min-h-10 min-w-10 flex items-center justify-center ${iconButton} ${favActive ? activeButton : neutralButton}`}
            aria-label={favActive ? t('card.removeFavAria') : t('card.addFavAria')}
            aria-pressed={favActive}
          >
            <Bookmark className={`w-4 h-4 ${favActive ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onToggleCompare(dev)}
            className={`min-h-10 min-w-10 flex items-center justify-center ${iconButton} ${compareActive ? activeButton : neutralButton}`}
            aria-label={compareActive ? t('card.removeCompareAria') : t('card.addCompareAria')}
            aria-pressed={compareActive}
          >
            <Swords className="w-4 h-4" />
          </button>
          <button
            onClick={handleShareLink}
            className={`min-h-10 min-w-10 flex items-center justify-center ${iconButton} ${neutralButton}`}
            aria-label={t('card.copyLinkAria', { login })}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`min-h-10 min-w-10 flex items-center justify-center ${iconButton} ${neutralButton}`}
            aria-label={t('card.openGithubAria', { name: displayName })}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </li>
  );
});

export default function LeaderboardTable({
  developers,
  onOpenModal,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
  onSelectLanguage,
  onNotify
}) {
  const { t } = useI18n();

  const headers = [
    { key: 'save', className: 'text-center w-12' },
    { key: 'rank', className: 'text-center w-14' },
    { key: 'developer', className: '' },
    { key: 'stack', className: '' },
    { key: 'contributions', className: 'text-right text-emerald-600 dark:text-emerald-400' },
    { key: 'commits', className: 'text-right' },
    { key: 'stars', className: 'text-right' },
    { key: 'repos', className: 'text-right' },
    { key: 'followers', className: 'text-right' },
    { key: 'actions', className: 'text-center' }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
      {/* Phones: compact list */}
      <ul className="md:hidden divide-y divide-neutral-200 dark:divide-neutral-800">
        {developers.map((dev) => (
          <MobileRow
            key={dev.login}
            dev={dev}
            favActive={isFavorite(dev.login)}
            compareActive={isCompared(dev.login)}
            onOpenModal={onOpenModal}
            onToggleFavorite={onToggleFavorite}
            onToggleCompare={onToggleCompare}
            onNotify={onNotify}
          />
        ))}
      </ul>

      {/* Tablets and desktop: full table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[800px] w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              {headers.map((h) => (
                <th key={h.key} scope="col" className={`py-3 px-3 font-semibold ${h.className}`}>
                  {t(`table.${h.key}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {developers.map((dev) => (
              <TableRow
                key={dev.login}
                dev={dev}
                favActive={isFavorite(dev.login)}
                compareActive={isCompared(dev.login)}
                onOpenModal={onOpenModal}
                onToggleFavorite={onToggleFavorite}
                onToggleCompare={onToggleCompare}
                onSelectLanguage={onSelectLanguage}
                onNotify={onNotify}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
