import React from 'react';
import { GitCommit, Activity, Star, FolderGit2, Users, ExternalLink, MapPin, CheckCircle2, Swords, Share2, Bookmark } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

export default function DeveloperCard({
  developer,
  onOpenModal,
  isFavorite,
  onToggleFavorite,
  isCompared,
  onToggleCompare,
  onSelectLanguage,
  onNotify
}) {
  const {
    rank,
    login,
    name,
    avatar_url,
    html_url,
    location,
    bio,
    country = 'Worldwide',
    public_repos = 0,
    followers = 0,
    estimated_commits = 0,
    live_contributions = 0,
    stars_received = 0,
    languages = []
  } = developer;

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  const cleanedBio = cleanText(bio);
  const cleanedName = cleanText(name || login);

  const displayLanguages = languages && languages.length > 0 ? languages : ['OpenSource'];

  const handleShareLink = (e) => {
    e.stopPropagation();
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?country=${encodeURIComponent(country)}&dev=${encodeURIComponent(login)}`;
    navigator.clipboard.writeText(url);
    if (onNotify) {
      onNotify(`Direct link for @${login} copied!`, 'success');
    }
  };

  return (
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full transition-all duration-150 shadow-2xs">
      
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        
        {/* Header Profile Row */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="relative shrink-0">
              <img
                src={avatar_url}
                alt={login}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://avatars.githubusercontent.com/${login}`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 p-0.5 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <div className="overflow-hidden min-w-0">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base truncate leading-tight">
                {cleanedName}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate mt-0.5">@{login}</p>
              {location && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{cleanText(location)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions & Rank Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bookmark Star Button */}
            <button
              onClick={() => onToggleFavorite(developer)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save developer'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Compare Swords Button */}
            <button
              onClick={() => onToggleCompare(developer)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isCompared
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-2xs'
                  : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title={isCompared ? 'Remove from compare' : 'Compare with another dev'}
              aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            >
              <Swords className="w-3.5 h-3.5" />
            </button>

            {/* Rank Badge */}
            <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${
              rank === 1
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
            }`}>
              #{rank}
            </div>
          </div>
        </div>

        {/* Full Bio Box */}
        <div className="mb-3.5 min-h-[60px] flex items-center bg-neutral-50 dark:bg-neutral-800/50 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          {cleanedBio ? (
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed w-full font-normal">
              "{cleanedBio}"
            </p>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic w-full">
              Active open source contributor on GitHub.
            </p>
          )}
        </div>

        {/* Dual Primary Metrics (Contributions with GitHub Green & Commits in Neutral) */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-[9px] uppercase tracking-wider font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Contributions
            </span>
            <strong className="text-base font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              {formatNumber(live_contributions || estimated_commits)}
            </strong>
          </div>

          <div className="flex flex-col bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-neutral-400" /> Commits
            </span>
            <strong className="text-base font-mono text-neutral-900 dark:text-white font-bold mt-0.5">
              {formatNumber(estimated_commits)}
            </strong>
          </div>
        </div>

        {/* Secondary Metrics (Stars, Repos, Followers) */}
        <div className="grid grid-cols-3 gap-2 mb-3 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1">
              <Star className="w-2.5 h-2.5 text-neutral-400" /> Stars
            </span>
            <strong className="text-xs font-mono text-neutral-800 dark:text-neutral-200 font-semibold mt-0.5">
              {formatNumber(stars_received)}
            </strong>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1">
              <FolderGit2 className="w-2.5 h-2.5 text-neutral-400" /> Repos
            </span>
            <strong className="text-xs font-mono text-neutral-800 dark:text-neutral-200 font-semibold mt-0.5">
              {formatNumber(public_repos)}
            </strong>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1">
              <Users className="w-2.5 h-2.5 text-neutral-400" /> Followers
            </span>
            <strong className="text-xs font-mono text-neutral-800 dark:text-neutral-200 font-semibold mt-0.5">
              {formatNumber(followers)}
            </strong>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4 mt-auto">
          {displayLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLanguage && onSelectLanguage(lang)}
              className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[10px] font-mono rounded font-medium transition-colors cursor-pointer"
              title={`Filter by ${lang}`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
        <button
          onClick={() => onOpenModal(developer)}
          aria-label={`View statistics for ${cleanedName}`}
          className="flex-1 min-h-10 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-xl transition-all text-center shadow-2xs cursor-pointer active:scale-[0.98] flex items-center justify-center"
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
            <span>View Statistics</span>
          </span>
        </button>

        {/* Direct Share Link */}
        <button
          onClick={handleShareLink}
          className="min-h-10 min-w-10 p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center justify-center shadow-2xs cursor-pointer"
          title="Copy direct link to profile"
          aria-label={`Copy link for @${login}`}
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-10 min-w-10 p-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center justify-center shadow-2xs"
          title="Open GitHub Profile"
          aria-label={`Open GitHub profile for ${cleanedName}`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
