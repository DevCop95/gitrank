import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SyncStatusBadge from './components/SyncStatusBadge';
import CountrySelector from './components/CountrySelector';
import DeveloperCard from './components/DeveloperCard';
import LeaderboardTable from './components/LeaderboardTable';
import DeveloperModal from './components/DeveloperModal';
import { Trophy, Activity, Search, RefreshCw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('Colombia');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('rank');
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Relative path guarantees fetching from ./data/committers.json under /gitrank/
      const res = await fetch('./data/committers.json?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to load committers.json');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCountryDevelopers = () => {
    if (!data || !data.countries) return [];

    const countryObj = data.countries[selectedCountry] || Object.values(data.countries).find(
      c => c.code.toLowerCase() === selectedCountry.toLowerCase() || c.name.toLowerCase() === selectedCountry.toLowerCase()
    );

    if (countryObj && countryObj.top_developers) {
      return countryObj.top_developers;
    }

    return [];
  };

  const rawDevelopers = getCountryDevelopers();

  const filteredDevelopers = rawDevelopers.filter(dev => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (dev.login && dev.login.toLowerCase().includes(q)) ||
      (dev.name && dev.name.toLowerCase().includes(q)) ||
      (dev.bio && dev.bio.toLowerCase().includes(q)) ||
      (dev.location && dev.location.toLowerCase().includes(q))
    );
  });

  const sortedDevelopers = [...filteredDevelopers].sort((a, b) => {
    if (sortBy === 'contributions') return (b.live_contributions || b.estimated_commits || 0) - (a.live_contributions || a.estimated_commits || 0);
    if (sortBy === 'commits') return (b.estimated_commits || 0) - (a.estimated_commits || 0);
    if (sortBy === 'stars') return (b.stars_received || 0) - (a.stars_received || 0);
    if (sortBy === 'followers') return (b.followers || 0) - (a.followers || 0);
    if (sortBy === 'repos') return (b.public_repos || 0) - (a.public_repos || 0);
    return (a.rank || 0) - (b.rank || 0);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalDevsCount={sortedDevelopers.length}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* GitHub Actions Sync status badge */}
        <SyncStatusBadge lastUpdated={data?.last_updated} />

        {/* Minimal Country Selector */}
        <CountrySelector
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
        />

        {/* Header Title Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Official GitHub Leaderboard: <span className="text-blue-600">{selectedCountry}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Most active open-source contributors based on live profile activity & commits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Developers: <strong className="text-emerald-700 font-extrabold">{sortedDevelopers.length}</strong></span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-mono">Loading developer rankings...</p>
          </div>
        )}

        {/* Profiles Grid / Table */}
        {!loading && sortedDevelopers.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedDevelopers.map((developer) => (
                  <DeveloperCard
                    key={developer.login}
                    developer={developer}
                    onOpenModal={setSelectedDeveloper}
                  />
                ))}
              </div>
            ) : (
              <LeaderboardTable
                developers={sortedDevelopers}
                onOpenModal={setSelectedDeveloper}
              />
            )}
          </>
        )}

        {/* Empty Search Result */}
        {!loading && sortedDevelopers.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md mx-auto shadow-sm">
            <Search className="w-8 h-8 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">No matching developers</h3>
            <p className="text-xs text-slate-500 mb-4">
              No results found for "{searchTerm}" in {selectedCountry}.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCountry('Colombia'); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Developer Modal */}
      {selectedDeveloper && (
        <DeveloperModal
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}
    </div>
  );
}
