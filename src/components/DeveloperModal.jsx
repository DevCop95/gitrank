import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, GitCommit, Activity, Star, FolderGit2, Users, MapPin, Building, Globe, ShieldCheck, Swords, Share2, Sparkles, BarChart2, Bookmark, CheckCircle2 } from 'lucide-react';
import { cleanText } from '../utils/cleanText';
import BadgeGenerator from './BadgeGenerator';
import { copyText } from '../utils/copyText';
import { buildShareUrl } from '../utils/shareUrl';
import { useFocusTrap } from '../utils/useFocusTrap';
import { useI18n } from '../i18n/I18nContext';

export default function DeveloperModal({
  developer,
  onClose,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
  onNotify
}) {
  const { t, formatNumber } = useI18n();
  const dialogRef = useRef(null);
  const {
    rank,
    login,
    name,
    avatar_url,
    html_url = `https://github.com/${developer?.login}`,
    company,
    location,
    bio,
    blog,
    public_repos = 0,
    followers = 0,
    estimated_commits = 0,
    live_contributions = 0,
    stars_received = 0,
    country = 'Worldwide',
    languages = []
  } = developer || {};

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'badge'
  const [imgError, setImgError] = useState(false);

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

  useFocusTrap(dialogRef);

  if (!developer) return null;

  const cleanedBio = cleanText(bio);
  const cleanedName = cleanText(name || login);
  const cleanedCompany = cleanText(company);
  const cleanedLocation = cleanText(location);
  const currentYear = new Date().getFullYear();

  // Authentic GitHub Green Contribution Graph
  const realChartUrl = `https://ghchart.rshah.org/2ea043/${login}`;

  const favActive = isFavorite ? isFavorite(login) : false;
  const compActive = isCompared ? isCompared(login) : false;

  const handleShareLink = async () => {
    const url = buildShareUrl(login);
    const ok = await copyText(url);
    if (onNotify) {
      onNotify(ok ? t('toast.profileLinkCopied', { login }) : t('toast.copyFailed'), ok ? 'success' : 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="developer-modal-title"
      >

        {/* Header Drawer Bar */}
        <div className="flex items-start justify-between gap-3 p-3.5 sm:p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={avatar_url}
                alt={login}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://avatars.githubusercontent.com/${login}`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 p-0.5 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="min-w-0">
              <h2 id="developer-modal-title" className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug truncate">
                <span>{cleanedName}</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">@{login}</span>
                <span className="px-2 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] sm:text-xs font-mono rounded font-medium">
                  {t('modal.rankIn', { rank, country })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save Bookmark */}
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(developer)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                favActive
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title={favActive ? t('card.unsaveTitle') : t('card.saveTitle')}
              aria-label={t('modal.favAria')}
              aria-pressed={favActive}
            >
              <Bookmark className={`w-4 h-4 ${favActive ? 'fill-current' : ''}`} />
            </button>

            {/* Compare VS */}
            <button
              onClick={() => onToggleCompare && onToggleCompare(developer)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                compActive
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title={compActive ? t('modal.compareRemove') : t('modal.compareAdd')}
              aria-label={t('modal.compareAria')}
              aria-pressed={compActive}
            >
              <Swords className="w-4 h-4" />
            </button>

            {/* Share Link */}
            <button
              onClick={handleShareLink}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all shadow-2xs cursor-pointer"
              title={t('modal.shareTitle')}
              aria-label={t('modal.shareAria')}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all shadow-2xs cursor-pointer"
              aria-label={t('modal.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-3.5 sm:px-5 pt-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{t('modal.tabOverview')}</span>
          </button>

          <button
            onClick={() => setActiveTab('badge')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'badge'
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('modal.tabBadge')}</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4">

          {activeTab === 'stats' ? (
            <>
              {/* Metadata Badges */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-4 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                {cleanedLocation && (
                  <div className="flex items-start gap-1.5 font-medium min-w-0">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="break-words">{cleanedLocation}</span>
                  </div>
                )}
                {cleanedCompany && (
                  <div className="flex items-start gap-1.5 font-medium min-w-0">
                    <Building className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="break-words">{cleanedCompany}</span>
                  </div>
                )}
                {blog && (
                  <a
                    href={blog.startsWith('http') ? blog : `https://${blog}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-1.5 min-w-0 text-neutral-900 dark:text-neutral-100 hover:underline font-medium"
                  >
                    <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-full sm:max-w-[200px]">{blog}</span>
                  </a>
                )}
              </div>

              {/* Bio Section */}
              {cleanedBio && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold mb-1.5">
                    {t('modal.bio')}
                  </h3>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 leading-relaxed">
                    "{cleanedBio}"
                  </p>
                </div>
              )}

              {/* Key Metrics */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold mb-1.5">
                  {t('modal.metrics')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {t('metric.contributions')}
                    </span>
                    <strong className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                      {formatNumber(live_contributions || estimated_commits)}
                    </strong>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase font-semibold flex items-center gap-1">
                      <GitCommit className="w-3 h-3" /> {t('metric.commits')}
                    </span>
                    <strong className="text-sm font-mono text-neutral-900 dark:text-white block mt-1">
                      {formatNumber(estimated_commits)}
                    </strong>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" /> {t('metric.stars')}
                    </span>
                    <strong className="text-sm font-mono text-neutral-900 dark:text-white block mt-1">
                      {formatNumber(stars_received)}
                    </strong>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase font-semibold flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3" /> {t('metric.repos')}
                    </span>
                    <strong className="text-sm font-mono text-neutral-900 dark:text-white block mt-1">
                      {formatNumber(public_repos)}
                    </strong>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" /> {t('metric.followers')}
                    </span>
                    <strong className="text-sm font-mono text-neutral-900 dark:text-white block mt-1">
                      {formatNumber(followers)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {languages && languages.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold mb-1.5">
                    {t('modal.technologies')}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 text-xs font-mono rounded font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Green Live Contribution Activity Graph */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1.5">
                  <h3 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold">
                    {t('modal.activity', { year: currentYear })}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    {t('modal.contributionsCount', { n: formatNumber(live_contributions || estimated_commits) })}
                  </span>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2 sm:p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex justify-center items-center">
                  {!imgError ? (
                    <img
                      src={realChartUrl}
                      alt={t('modal.graphAlt', { login })}
                      className="w-full h-auto object-contain rounded"
                      onError={() => setImgError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="py-6 text-center text-xs text-neutral-500 font-mono">
                      {t('modal.graphFallback')} <a href={html_url} target="_blank" rel="noreferrer" className="underline">github.com/{login}</a>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Badge Generator Tab */
            <BadgeGenerator developer={developer} onNotify={onNotify} />
          )}

        </div>

        {/* Footer Action Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('modal.verified')}</span>
          </div>

          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 min-h-10 px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <span>{t('modal.visit')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
