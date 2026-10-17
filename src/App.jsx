import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react';
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
import LoadingSkeleton from './components/LoadingSkeleton';
import Toast from './components/Toast';
import { useFavorites } from './utils/useFavorites';
import { exportToCSV, exportToJSON } from './utils/exportData';
import { filterDevelopers, sortDevelopers } from './utils/filterDevelopers';
import { useI18n } from './i18n/I18nContext';
import { Trophy, Activity, Search, AlertCircle } from 'lucide-react';

export default function App() {
  const { t } = useI18n();
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
  const compareRef = useRef(compareList);
  useEffect(() => {
    compareRef.current = compareList;
  }, [compareList]);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  // Instant, Crisp Theme Toggle without Paint/Interpolation Flash
  const toggleDarkMode = useCallback(() => {
    const css = document.createElement('style');
    css.appendChild(
      document.createTextNode(
        `*, *::before, *::after {
           -webkit-transition: none !important;
           transition: none !important;
        }`
      )
    );
    document.head.appendChild(css);

    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('gittop_theme', next ? 'dark' : 'light');
      } catch {
        // storage can be blocked; the class toggle above still applies
      }
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

  // Keep the browser UI color (address bar) in sync with the theme
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', isDarkMode ? '#09090b' : '#fafafa');
  }, [isDarkMode]);

  // Load Data. `no-cache` revalidates with the server (ETag) instead of re-downloading every visit.
  const fetchData = useCallback(async (signal) => {
    try {
      const res = await fetch('./data/committers.json', { cache: 'no-cache', signal });
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
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error loading data:', err);
      setLoadError(true);
      setLoading(false);
    }
  }, [initialDevLogin]);

  useEffect(() => {
    const controller = new AbortController();
    // State is only set after the network call resolves, never synchronously in this effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    fetchData();
  }, [fetchData]);

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

    return countryObj?.top_developers || [];
  }, [data, selectedCountry, isFavoritesOnly, favorites]);

  // Typing stays responsive: the list re-filters at low priority
  const deferredSearch = useDeferredValue(searchTerm);

  const sortedDevelopers = useMemo(
    () => sortDevelopers(filterDevelopers(rawDevelopers, { searchTerm: deferredSearch, language: selectedLanguage }), sortBy),
    [rawDevelopers, deferredSearch, selectedLanguage, sortBy]
  );

  // Compare handlers
  const isCompared = useCallback((login) => {
    return compareList.some((d) => d.login === login);
  }, [compareList]);

  const toggleCompare = useCallback((dev) => {
    const prev = compareRef.current;

    if (prev.some((d) => d.login === dev.login)) {
      setCompareList(prev.filter((d) => d.login !== dev.login));
      return;
    }
    if (prev.length >= 2) {
      addToast(t('toast.compareLimit'), 'info');
      setCompareList([prev[1], dev]);
      return;
    }
    addToast(t('toast.compareAdded', { login: dev.login, n: prev.length + 1 }), 'success');
    setCompareList([...prev, dev]);
  }, [addToast, t]);

  const removeFromCompare = useCallback((login) => {
    setCompareList((prev) => prev.filter((d) => d.login !== login));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  // Favorites handler wrapper with notification
  const handleToggleFavorite = useCallback((dev) => {
    const wasFav = toggleFavorite(dev);
    addToast(
      wasFav ? t('toast.favRemoved', { login: dev.login }) : t('toast.favSaved', { login: dev.login }),
      'success'
    );
  }, [toggleFavorite, addToast, t]);

  // Export handlers
  const exportName = isFavoritesOnly ? 'Saved-Favorites' : selectedCountry;

  const handleExportCSV = useCallback(() => {
    exportToCSV(sortedDevelopers, exportName);
    addToast(t('toast.exportCsv', { n: sortedDevelopers.length }), 'success');
  }, [sortedDevelopers, exportName, addToast, t]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(sortedDevelopers, exportName);
    addToast(t('toast.exportJson', { n: sortedDevelopers.length }), 'success');
  }, [sortedDevelopers, exportName, addToast, t]);

  const closeDeveloperModal = useCallback(() => setSelectedDeveloper(null), []);
  const closeCompareModal = useCallback(() => setIsCompareModalOpen(false), []);
  const openCompareModal = useCallback(() => setIsCompareModalOpen(true), []);
  const toggleFavoritesOnly = useCallback(() => setIsFavoritesOnly((prev) => !prev), []);

  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
    setSelectedLanguage('');
  }, []);

  const emptyMessage = isFavoritesOnly
    ? t('empty.favorites')
    : `${t('empty.in', { country: selectedCountry })}${
        searchTerm.trim() ? t('empty.for', { q: searchTerm.trim() }) : ''
      }${selectedLanguage ? t('empty.stack', { lang: selectedLanguage }) : ''}.`;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 pb-28 font-sans antialiased selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">

      <a
        href="#leaderboard"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-3 focus:py-2 focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black focus:rounded-xl focus:text-xs focus:font-semibold"
      >
        {t('app.skipToContent')}
      </a>

      {/* Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        favoritesCount={favorites.length}
        isFavoritesOnly={isFavoritesOnly}
        onToggleFavoritesOnly={toggleFavoritesOnly}
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
            onSelectCountry={handleSelectCountry}
          />
        ) : (
          <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 mb-4 sm:mb-6 shadow-2xs flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {t('watchlist.title')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                {t('watchlist.showing', { n: favorites.length })}
              </p>
            </div>
            <button
              onClick={() => setIsFavoritesOnly(false)}
              className="min-h-10 px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              {t('watchlist.back')}
            </button>
          </div>
        )}

        {/* Country Analytics Macro KPIs */}
        {!loading && !loadError && <CountryAnalytics developers={rawDevelopers} />}

        {/* Tech Stack Multi-Filter */}
        {!loading && !loadError && rawDevelopers.length > 0 && (
          <TechStackFilter
            rawDevelopers={rawDevelopers}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        )}

        {/* Leaderboard Header Title Bar */}
        <div
          id="leaderboard"
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3.5 sm:p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xs scroll-mt-24"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
                {isFavoritesOnly ? (
                  <span>{t('leaderboard.saved', { n: sortedDevelopers.length })}</span>
                ) : (
                  <>{t('leaderboard.title')} <span className="underline decoration-neutral-400">{selectedCountry}</span></>
                )}
                {selectedLanguage && (
                  <span className="ml-2 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono rounded font-medium">
                    {t('leaderboard.stack', { lang: selectedLanguage })}
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                {t('leaderboard.subtitle')}
              </p>
            </div>
          </div>

          <div className="self-stretch md:self-auto flex items-center gap-2 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-800 dark:text-neutral-200">
            <Activity className="w-3.5 h-3.5 text-neutral-500" />
            <span>{t('leaderboard.showing', { n: sortedDevelopers.length })}</span>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Profiles Grid / Table */}
        {!loading && !loadError && sortedDevelopers.length > 0 && (
          <>
            {viewMode === 'table' ? (
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
            ) : (
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
            )}
          </>
        )}

        {/* Error State */}
        {!loading && loadError && (
          <div role="alert" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 text-center max-w-md mx-auto shadow-2xs">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{t('error.title')}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {t('error.body')}
            </p>
            <button
              onClick={retryLoad}
              className="min-h-10 px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-semibold rounded-xl shadow-2xs cursor-pointer"
            >
              {t('error.retry')}
            </button>
          </div>
        )}

        {/* Empty Result */}
        {!loading && !loadError && sortedDevelopers.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 text-center max-w-md mx-auto shadow-2xs">
            <Search className="w-8 h-8 text-neutral-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{t('empty.title')}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {emptyMessage}
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
              {t('empty.reset')}
            </button>
          </div>
        )}
      </main>

      {/* Developer Details & Badge Modal */}
      {selectedDeveloper && (
        <DeveloperModal
          developer={selectedDeveloper}
          onClose={closeDeveloperModal}
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
        onOpenCompareModal={openCompareModal}
      />

      {/* Developer Compare VS Modal */}
      {isCompareModalOpen && compareList.length === 2 && (
        <DeveloperCompareModal
          devA={compareList[0]}
          devB={compareList[1]}
          onClose={closeCompareModal}
        />
      )}

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onCloseToast={removeToast} />

    </div>
  );
}
