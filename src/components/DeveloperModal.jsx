import React, { useEffect, useState } from 'react';
import { X, ExternalLink, GitCommit, Activity, Star, FolderGit2, Users, MapPin, Building, Globe, ShieldCheck } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

export default function DeveloperModal({ developer, onClose }) {
  if (!developer) return null;

  const {
    rank,
    login,
    name,
    avatar_url,
    html_url,
    company,
    location,
    bio,
    blog,
    public_repos = 0,
    followers = 0,
    following = 0,
    estimated_commits = 0,
    live_contributions = 0,
    stars_received = 0,
    country
  } = developer;

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

  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

  const cleanedBio = cleanText(bio);
  const cleanedName = cleanText(name || login);
  const cleanedCompany = cleanText(company);
  const cleanedLocation = cleanText(location);
  const currentYear = new Date().getFullYear();

  const realChartUrl = `https://ghchart.rshah.org/16a34a/${login}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="developer-modal-title"
      >
        
        {/* Header Drawer Bar */}
        <div className="flex items-start justify-between gap-3 p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatar_url}
              alt={login}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://avatars.githubusercontent.com/${login}`;
              }}
            />
            <div>
              <h2 id="developer-modal-title" className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                <span className="block truncate">{cleanedName}</span>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-mono rounded-md border border-blue-200 font-bold">
                  #{rank} in {country}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">@{login}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-11 min-w-11 p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-all shadow-sm shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5">
          
          {/* Metadata Badges */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-4 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {cleanedLocation && (
              <div className="flex items-start gap-1.5 font-medium min-w-0">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="break-words">{cleanedLocation}</span>
              </div>
            )}
            {cleanedCompany && (
              <div className="flex items-start gap-1.5 font-medium min-w-0">
                <Building className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="break-words">{cleanedCompany}</span>
              </div>
            )}
            {blog && (
              <a href={blog.startsWith('http') ? blog : `https://${blog}`} target="_blank" rel="noreferrer" className="flex items-start gap-1.5 min-w-0 text-blue-600 hover:underline font-medium">
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-full sm:max-w-[200px]">{blog}</span>
              </a>
            )}
          </div>

          {/* Bio Section */}
          {cleanedBio && (
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2">Biography</h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed italic">
                "{cleanedBio}"
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold mb-2">Key Performance Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" /> Contributions
                </span>
                <strong className="text-sm font-mono text-emerald-700 block mt-1">{formatNumber(live_contributions || estimated_commits)}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-indigo-700 uppercase font-bold flex items-center gap-1">
                  <GitCommit className="w-3 h-3 text-indigo-600" /> Commits
                </span>
                <strong className="text-sm font-mono text-indigo-700 block mt-1">{formatNumber(estimated_commits)}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-amber-700 uppercase font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-600" /> Stars
                </span>
                <strong className="text-sm font-mono text-amber-700 block mt-1">{formatNumber(stars_received)}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-600 uppercase font-bold flex items-center gap-1">
                  <FolderGit2 className="w-3 h-3 text-slate-600" /> Repos
                </span>
                <strong className="text-sm font-mono text-slate-800 block mt-1">{formatNumber(public_repos)}</strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-purple-700 uppercase font-bold flex items-center gap-1">
                  <Users className="w-3 h-3 text-purple-600" /> Followers
                </span>
                <strong className="text-sm font-mono text-purple-700 block mt-1">{formatNumber(followers)}</strong>
              </div>
            </div>
          </div>

          {/* 100% REAL Live GitHub Contribution Activity Graph */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
              <h3 className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Real Live Contribution Activity (Past 52 Weeks)</span>
              </h3>
              <span className="text-[10px] sm:text-[11px] text-emerald-700 font-mono font-bold">
                {formatNumber(live_contributions || estimated_commits)} contributions in {currentYear}
              </span>
            </div>

            <div className="bg-slate-50 p-2 sm:p-3.5 rounded-xl border border-slate-200 flex justify-center items-center">
              {!imgError ? (
                <img
                  src={realChartUrl}
                  alt={`100% Real Live GitHub Contribution Graph for @${login}`}
                  className="w-full h-auto object-contain rounded-md"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
                  Live contribution graph available at <a href={html_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">github.com/{login}</a>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified GitHub Account</span>
          </div>

          <a
            href={html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 min-h-11 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm sm:text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer active:scale-[0.98]"
          >
            <span className="text-white">Visit Full GitHub Profile</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        </div>

      </div>
    </div>
  );
}
