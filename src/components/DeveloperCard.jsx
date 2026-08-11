import React from 'react';
import { GitCommit, Activity, Star, FolderGit2, Users, ExternalLink, MapPin, CheckCircle2 } from 'lucide-react';
import { cleanText } from '../utils/cleanText';

export default function DeveloperCard({ developer, onOpenModal }) {
  const {
    rank,
    login,
    name,
    avatar_url,
    html_url,
    location,
    bio,
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

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 flex flex-col justify-between h-full transition-all duration-200 shadow-sm hover:shadow-md">
      
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        
        {/* Header Profile Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="relative shrink-0">
              <img
                src={avatar_url}
                alt={login}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200 group-hover:border-blue-600 transition-colors shadow-sm"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://avatars.githubusercontent.com/${login}`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </div>
            </div>

            <div className="overflow-hidden min-w-0">
              <h3 className="font-extrabold text-slate-900 text-base truncate group-hover:text-blue-600 transition-colors leading-tight">
                {cleanedName}
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate mt-0.5">@{login}</p>
              {location && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{cleanText(location)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Rank Badge */}
          <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold border shrink-0 ${
            rank === 1
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : rank === 2
              ? 'bg-slate-100 text-slate-700 border-slate-300'
              : rank === 3
              ? 'bg-orange-50 text-orange-800 border-orange-300'
              : 'bg-slate-900 text-white border-slate-900'
          }`}>
            #{rank}
          </div>
        </div>

        {/* Full Bio Box */}
        <div className="mb-4 min-h-[64px] flex items-center bg-slate-50 px-3.5 py-3 rounded-xl border border-slate-200">
          {cleanedBio ? (
            <p className="text-xs text-slate-700 leading-relaxed w-full font-normal italic">
              "{cleanedBio}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic w-full">
              Active open source contributor on GitHub.
            </p>
          )}
        </div>

        {/* Dual Primary Metrics (Live Contributions & Commits) */}
        <div className="grid grid-cols-2 gap-2.5 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex flex-col bg-white p-2 rounded-lg border border-emerald-200">
            <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-700 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" /> Contributions
            </span>
            <strong className="text-base font-mono text-emerald-700 font-extrabold mt-0.5">
              {formatNumber(live_contributions || estimated_commits)}
            </strong>
          </div>

          <div className="flex flex-col bg-white p-2 rounded-lg border border-indigo-200">
            <span className="text-[10px] uppercase tracking-wider font-mono text-indigo-700 font-bold flex items-center gap-1">
              <GitCommit className="w-3 h-3 text-indigo-600" /> Commits
            </span>
            <strong className="text-base font-mono text-indigo-700 font-extrabold mt-0.5">
              {formatNumber(estimated_commits)}
            </strong>
          </div>
        </div>

        {/* Secondary Metrics (Stars, Repos, Followers) */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 flex items-center justify-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-600" /> Stars
            </span>
            <strong className="text-xs font-mono text-amber-700 font-bold mt-0.5">
              {formatNumber(stars_received)}
            </strong>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 flex items-center justify-center gap-1">
              <FolderGit2 className="w-2.5 h-2.5 text-slate-600" /> Repos
            </span>
            <strong className="text-xs font-mono text-slate-800 font-bold mt-0.5">
              {formatNumber(public_repos)}
            </strong>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 flex items-center justify-center gap-1">
              <Users className="w-2.5 h-2.5 text-purple-600" /> Followers
            </span>
            <strong className="text-xs font-mono text-purple-700 font-bold mt-0.5">
              {formatNumber(followers)}
            </strong>
          </div>
        </div>

        {/* 100% Real Tech Stack Pills */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4 mt-auto">
          {displayLanguages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono rounded-md font-semibold"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="flex items-center gap-2 pt-3.5 border-t border-slate-200 mt-auto">
        <button
          onClick={() => onOpenModal(developer)}
          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all text-center shadow-sm"
        >
          View Activity
        </button>

        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 transition-all flex items-center justify-center shadow-sm"
          title="Open GitHub Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
