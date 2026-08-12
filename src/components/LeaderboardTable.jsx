import React from 'react';
import { GitCommit, Activity, Star, FolderGit2, Users, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

export default function LeaderboardTable({ developers, onOpenModal }) {
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-4 font-semibold text-center w-16">Rank</th>
              <th className="py-3.5 px-4 font-semibold">Developer</th>
              <th className="py-3.5 px-4 font-semibold text-right">Contributions</th>
              <th className="py-3.5 px-4 font-semibold text-right">Commits</th>
              <th className="py-3.5 px-4 font-semibold text-right">Stars</th>
              <th className="py-3.5 px-4 font-semibold text-right">Repos</th>
              <th className="py-3.5 px-4 font-semibold text-right">Followers</th>
              <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
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
                stars_received = 0
              } = dev;

              return (
                <tr
                  key={login}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span className={`inline-block px-2.5 py-1 rounded-xl text-xs ${
                      rank === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                        : rank === 2
                        ? 'bg-slate-100 text-slate-700 border border-slate-300 font-extrabold'
                        : rank === 3
                        ? 'bg-orange-100 text-orange-900 border border-orange-300 font-extrabold'
                        : 'text-slate-500 font-bold'
                    }`}>
                      #{rank}
                    </span>
                  </td>

                  {/* Developer Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar_url}
                        alt={login}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:border-blue-600 transition-colors"
                        loading="lazy"
                        onError={(e) => { e.target.src = `https://avatars.githubusercontent.com/${login}`; }}
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenModal(dev)}
                            className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors text-xs text-left truncate"
                          >
                            {cleanText(name || login)}
                          </button>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          @{login} {location ? `• ${cleanText(location)}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Contributions */}
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-700">
                    {formatNumber(live_contributions || estimated_commits)}
                  </td>

                  {/* Commits */}
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-700">
                    {formatNumber(estimated_commits)}
                  </td>

                  {/* Stars */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                    {formatNumber(stars_received)}
                  </td>

                  {/* Repos */}
                  <td className="py-3 px-4 text-right font-mono text-slate-700 font-medium">
                    {formatNumber(public_repos)}
                  </td>

                  {/* Followers */}
                  <td className="py-3 px-4 text-right font-mono text-purple-700 font-medium">
                    {formatNumber(followers)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenModal(dev)}
                        aria-label={`View statistics for ${cleanText(name || login)}`}
                        className="inline-flex items-center gap-1.5 min-h-10 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <Activity className="w-3.5 h-3.5 text-white" />
                        <span className="text-white">Statistics</span>
                      </button>

                      <a
                        href={html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 transition-all"
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
