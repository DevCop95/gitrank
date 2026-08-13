import React from 'react';
import { GitCommit, Activity, Star, FolderGit2, Users, ExternalLink, MapPin, CheckCircle2, Swords, Share2, Bookmark } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

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
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  const handleShareLink = (dev) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?country=${encodeURIComponent(dev.country || 'Worldwide')}&dev=${encodeURIComponent(dev.login)}`;
    navigator.clipboard.writeText(url);
    if (onNotify) {
      onNotify(`Direct link for @${dev.login} copied!`, 'success');
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-3 font-semibold text-center w-12">Save</th>
              <th className="py-3 px-3 font-semibold text-center w-14">Rank</th>
              <th className="py-3 px-4 font-semibold">Developer</th>
              <th className="py-3 px-3 font-semibold">Tech Stack</th>
              <th className="py-3 px-3 font-semibold text-right text-emerald-600 dark:text-emerald-400">Contributions</th>
              <th className="py-3 px-3 font-semibold text-right">Commits</th>
              <th className="py-3 px-3 font-semibold text-right">Stars</th>
              <th className="py-3 px-3 font-semibold text-right">Repos</th>
              <th className="py-3 px-3 font-semibold text-right">Followers</th>
              <th className="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {developers.map((dev) => {
              const {
                rank,
                login,
                name,
                avatar_url,
                html_url,
                location,
                public_repos = 0,
                followers = 0,
                estimated_commits = 0,
                live_contributions = 0,
                stars_received = 0,
                languages = []
              } = dev;

              const favActive = isFavorite ? isFavorite(login) : false;
              const compareActive = isCompared ? isCompared(login) : false;

              return (
                <tr
                  key={login}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* Favorite Toggle */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onToggleFavorite && onToggleFavorite(dev)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        favActive
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                          : 'bg-transparent border-transparent text-neutral-300 dark:text-neutral-600 hover:text-black dark:hover:text-white'
                      }`}
                      title={favActive ? 'Remove from saved' : 'Save developer'}
                      aria-label={favActive ? 'Remove favorite' : 'Add favorite'}
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
                        alt={login}
                        className="w-8 h-8 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                        loading="lazy"
                        onError={(e) => { e.target.src = `https://avatars.githubusercontent.com/${login}`; }}
                      />
                      <div className="overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenModal(dev)}
                            className="font-bold text-neutral-900 dark:text-neutral-100 hover:underline transition-colors text-xs text-left truncate cursor-pointer"
                          >
                            {cleanText(name || login)}
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
                          onClick={() => onSelectLanguage && onSelectLanguage(lang)}
                          className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-mono rounded border border-neutral-200 dark:border-neutral-700 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Contributions in GitHub Green */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNumber(live_contributions || estimated_commits)}
                  </td>

                  {/* Commits */}
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                    {formatNumber(estimated_commits)}
                  </td>

                  {/* Stars */}
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-700 dark:text-neutral-300">
                    {formatNumber(stars_received)}
                  </td>

                  {/* Repos */}
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                    {formatNumber(public_repos)}
                  </td>

                  {/* Followers */}
                  <td className="py-2.5 px-3 text-right font-mono text-neutral-600 dark:text-neutral-400">
                    {formatNumber(followers)}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Compare */}
                      <button
                        onClick={() => onToggleCompare && onToggleCompare(dev)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          compareActive
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                        }`}
                        title={compareActive ? 'Remove from compare' : 'Compare VS'}
                        aria-label="Compare"
                      >
                        <Swords className="w-3.5 h-3.5" />
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShareLink(dev)}
                        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-all cursor-pointer"
                        title="Copy profile link"
                        aria-label="Share"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Open Modal */}
                      <button
                        onClick={() => onOpenModal(dev)}
                        aria-label={`View statistics for ${cleanText(name || login)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-[11px] font-medium rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Stats</span>
                      </button>

                      {/* GitHub Link */}
                      <a
                        href={html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-all"
                        title="GitHub Profile"
                        aria-label={`Open GitHub profile for ${cleanText(name || login)}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
