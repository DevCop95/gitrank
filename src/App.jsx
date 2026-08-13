import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import SyncStatusBadge from './components/SyncStatusBadge';
import CountrySelector from './components/CountrySelector';
import TechStackFilter from './components/TechStackFilter';
import CountryAnalytics from './components/CountryAnalytics';
import DeveloperCard from './components/DeveloperCard';
import LeaderboardTable from './components/LeaderboardTable';
import DeveloperModal from './components/DeveloperModal';
import CompareDock from './components/CompareDock';
import DeveloperCompareModal from './components/DeveloperCompareModal';
import Toast from './components/Toast';
import { useFavorites } from './utils/useFavorites';
import { exportToCSV, exportToJSON } from './utils/exportData';
import { Trophy, Activity, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Initialize state from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const initialCountry = searchParams.get('country') || 'Colombia';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialView = searchParams.get('view') || 'grid';
  const initialSort = searchParams.get('sort') || 'rank';
  const initialLang = searchParams.get('lang') || '';
  const initialFavoritesOnly = searchParams.get('favorites') === 'true' || searchParams.get('tab') === 'favorites';
  const initialDevLogin = searchParams.get('dev') || '';

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [viewMode, setViewMode] = useState(initialView);
  const [sortBy, setSortBy] = useState(initialSort);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const [isFavoritesOnly, setIsFavoritesOnly] = useState(initialFavoritesOnly);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('gittop_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Favorites Hook
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // Compare Mode State
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Instant, Crisp Theme Toggle without Paint/Interpolation Flash
  const toggleDarkMode = useCallback(() => {
    const css = document.createElement('style');
    css.type = 'text/css';
    css.appendChild(
      document.createTextNode(
        `*, *::before, *::after {
           -webkit-transition: none !important;
           -moz-transition: none !important;
           -o-transition: none !important;
           -ms-transition: none !important;
           transition: none !important;
        }`
      )
    );
    document.head.appendChild(css);

    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('gittop_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('gittop_theme', 'light');
        }
      } catch (e) {}
      return next;
    });

    // Force reflow and remove style
    window.getComputedStyle(document.body);
    setTimeout(() => {
      if (document.head.contains(css)) {
        document.head.removeChild(css);
      }
    }, 20);
  }, []);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const res = await fetch('./data/committers.json?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to load committers.json');
      const json = await res.json();
      setData(json);

      // Auto-open developer if requested in URL
      if (initialDevLogin && json.countries) {
        let foundDev = null;
        Object.values(json.countries).forEach((c) => {
          if (!foundDev && c.top_developers) {
            const dev = c.top_developers.find(
              (d) => d.login.toLowerCase() === initialDevLogin.toLowerCase()
            );
            if (dev) foundDev = dev;
          }
        });
        if (foundDev) setSelectedDeveloper(foundDev);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync state to URL params in real-time
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCountry && selectedCountry !== 'Colombia') params.set('country', selectedCountry);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (sortBy !== 'rank') params.set('sort', sortBy);
    if (selectedLanguage) params.set('lang', selectedLanguage);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (isFavoritesOnly) params.set('favorites', 'true');
    if (selectedDeveloper) params.set('dev', selectedDeveloper.login);

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [selectedCountry, searchTerm, sortBy, selectedLanguage, viewMode, isFavoritesOnly, selectedDeveloper]);

  // Compute active developer list
  const rawDevelopers = useMemo(() => {
    if (isFavoritesOnly) {
      return favorites;
    }

    if (!data || !data.countries) return [];

    const countryObj =
      data.countries[selectedCountry] ||
      Object.values(data.countries).find(
        (c) =>
          c.code.toLowerCase() === selectedCountry.toLowerCase() ||
          c.name.toLowerCase() === selectedCountry.toLowerCase()
      );

    if (countryObj && countryObj.top_developers) {
      return countryObj.top_developers;
    }

    return [];
  }, [data, selectedCountry, isFavoritesOnly, favorites]);

  // Filter developers by search and language
  const filteredDevelopers = useMemo(() => {
    return rawDevelopers.filter((dev) => {
      // Search filter
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (dev.login && dev.login.toLowerCase().includes(q)) ||
        (dev.name && dev.name.toLowerCase().includes(q)) ||
        (dev.bio && dev.bio.toLowerCase().includes(q)) ||
        (dev.location && dev.location.toLowerCase().includes(q));

      // Language filter
      const matchesLanguage =
        !selectedLanguage ||
        (dev.languages &&
          Array.isArray(dev.languages) &&
          dev.languages.some((l) => l.toLowerCase() === selectedLanguage.toLowerCase()));

      return matchesSearch && matchesLanguage;
    });
  }, [rawDevelopers, searchTerm, selectedLanguage]);

  // Sort developers
  const sortedDevelopers = useMemo(() => {
    return [...filteredDevelopers].sort((a, b) => {
      if (sortBy === 'contributions')
        return (b.live_contributions || b.estimated_commits || 0) - (a.live_contributions || a.estimated_commits || 0);
      if (sortBy === 'commits') return (b.estimated_commits || 0) - (a.estimated_commits || 0);
      if (sortBy === 'stars') return (b.stars_received || 0) - (a.stars_received || 0);
      if (sortBy === 'followers') return (b.followers || 0) - (a.followers || 0);
      if (sortBy === 'repos') return (b.public_repos || 0) - (a.public_repos || 0);
      return (a.rank || 0) - (b.rank || 0);
    });
  }, [filteredDevelopers, sortBy]);

  // Compare handlers
  const isCompared = useCallback((login) => {
    return compareList.some((d) => d.login === login);
  }, [compareList]);

  const toggleCompare = useCallback((dev) => {
    setCompareList((prev) => {
      const exists = prev.some((d) => d.login === dev.login);
      if (exists) {
        return prev.filter((d) => d.login !== dev.login);
      }
      if (prev.length >= 2) {
        addToast('Comparison limit is 2 developers. Replaced first dev.', 'info');
        return [prev[1], dev];
      }
      addToast(`Added @${dev.login} to comparison VS (${prev.length + 1}/2)`, 'success');
      return [...prev, dev];
    });
  }, [addToast]);

  const removeFromCompare = useCallback((login) => {
    setCompareList((prev) => prev.filter((d) => d.login !== login));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  // Favorites handler wrapper with notification
  const handleToggleFavorite = useCallback((dev) => {
    const wasFav = isFavorite(dev.login);
    toggleFavorite(dev);
    addToast(
      wasFav ? `Removed @${dev.login} from saved favorites` : `Saved @${dev.login} to favorites`,
      'success'
    );
  }, [isFavorite, toggleFavorite, addToast]);

  // Export handlers
  const handleExportCSV = useCallback(() => {
    exportToCSV(sortedDevelopers, isFavoritesOnly ? 'Saved-Favorites' : selectedCountry);
    addToast(`Exported ${sortedDevelopers.length} developers to CSV`, 'success');
  }, [sortedDevelopers, isFavoritesOnly, selectedCountry, addToast]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(sortedDevelopers, isFavoritesOnly ? 'Saved-Favorites' : selectedCountry);
    addToast(`Exported ${sortedDevelopers.length} developers to JSON`, 'success');
  }, [sortedDevelopers, isFavoritesOnly, selectedCountry, addToast]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 pb-28 font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalDevsCount={sortedDevelopers.length}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        favoritesCount={favorites.length}
        isFavoritesOnly={isFavoritesOnly}
        onToggleFavoritesOnly={() => setIsFavoritesOnly(!isFavoritesOnly)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* GitHub Actions Sync status badge */}
        <SyncStatusBadge lastUpdated={data?.last_updated} />

        {/* Country Selector (hidden when in favorites-only mode) */}
        {!isFavoritesOnly ? (
          <CountrySelector
            selectedCountry={selectedCountry}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              setSelectedLanguage('');
            }}
          />
        ) : (
          <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 mb-4 sm:mb-6 shadow-2xs flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Saved Developers Watchlist
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Showing {favorites.length} saved developer profiles
              </p>
            </div>
            <button
              onClick={() => setIsFavoritesOnly(false)}
              className="px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Back to Leaderboard
            </button>
          </div>
        )}

        {/* Country Analytics Macro KPIs */}
        {!loading && !loadError && (
          <CountryAnalytics
            developers={rawDevelopers}
            countryName={isFavoritesOnly ? 'Favorites' : selectedCountry}
          />
        )}

        {/* Tech Stack Multi-Filter */}
        {!loading && !loadError && rawDevelopers.length > 0 && (
          <TechStackFilter
            rawDevelopers={rawDevelopers}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        {/* Leaderboard Header Title Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3.5 sm:p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                {isFavoritesOnly ? (
                  <span>Saved Developers ({sortedDevelopers.length})</span>
                ) : (
                  <>Leaderboard: <span className="underline decoration-neutral-400">{selectedCountry}</span></>
                )}
                {selectedLanguage && (
                  <span className="ml-2 px-2 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono rounded font-medium">
                    Stack: {selectedLanguage}
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Ranked by live contributions, verified commits & community stars.
              </p>
            </div>
          </div>

          <div className="self-stretch md:self-auto flex items-center gap-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-800 dark:text-neutral-200">
            <Activity className="w-3.5 h-3.5 text-neutral-500" />
            <span>Showing: <strong className="font-bold">{sortedDevelopers.length} developers</strong></span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 text-neutral-400 animate-spin mb-3" />
            <p className="text-xs text-neutral-500 font-mono">Loading developer rankings...</p>
          </div>
        )}

        {/* Profiles Grid / Table */}
        {!loading && !loadError && sortedDevelopers.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {sortedDevelopers.map((developer) => (
                  <DeveloperCard
                    key={developer.login}
                    developer={developer}
                    onOpenModal={setSelectedDeveloper}
                    isFavorite={isFavorite(developer.login)}
                    onToggleFavorite={handleToggleFavorite}
                    isCompared={isCompared(developer.login)}
                    onToggleCompare={toggleCompare}
                    onSelectLanguage={setSelectedLanguage}
                    onNotify={addToast}
                  />
                ))}
              </div>
            ) : (
              <LeaderboardTable
                developers={sortedDevelopers}
                onOpenModal={setSelectedDeveloper}
                isFavorite={isFavorite}
                onToggleFavorite={handleToggleFavorite}
                isCompared={isCompared}
                onToggleCompare={toggleCompare}
                onSelectLanguage={setSelectedLanguage}
                onNotify={addToast}
              />
            )}
          </>
        )}

        {/* Error State */}
        {!loading && loadError && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 text-center max-w-md mx-auto shadow-2xs">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">Unable to load rankings</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Check your connection and try loading the data again.
            </p>
            <button
              onClick={loadData}
              className="min-h-10 px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-xl shadow-2xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Result */}
        {!loading && !loadError && sortedDevelopers.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 text-center max-w-md mx-auto shadow-2xs">
            <Search className="w-8 h-8 text-neutral-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">No matching developers</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {isFavoritesOnly
                ? 'You have not saved any developers yet. Click the bookmark on any card to add them.'
                : `No results found for "${searchTerm}"${selectedLanguage ? ` with stack ${selectedLanguage}` : ''} in ${selectedCountry}.`}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLanguage('');
                setIsFavoritesOnly(false);
                setSelectedCountry('Colombia');
              }}
              className="min-h-10 px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-xl shadow-2xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Developer Details & Badge Modal */}
      {selectedDeveloper && (
        <DeveloperModal
          developer={selectedDeveloper}
          onClose={() => setSelectedDeveloper(null)}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          isCompared={isCompared}
          onToggleCompare={toggleCompare}
          onNotify={addToast}
        />
      )}

      {/* Compare Floating Dock */}
      <CompareDock
        compareList={compareList}
        onRemoveFromCompare={removeFromCompare}
        onClearCompare={clearCompare}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
      />

      {/* Developer Compare VS Modal */}
      {isCompareModalOpen && compareList.length === 2 && (
        <DeveloperCompareModal
          devA={compareList[0]}
          devB={compareList[1]}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onCloseToast={removeToast} />

    </div>
  );
}
