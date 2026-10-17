import React, { useState, useRef } from 'react';
import { Search, LayoutGrid, List, Github, Menu, X, Sun, Moon, Bookmark, Download, FileSpreadsheet, FileCode } from 'lucide-react';
import { useDismiss } from '../utils/useDismiss';
import { useI18n } from '../i18n/I18nContext';
import { LANGUAGES } from '../i18n/translations';

const SORT_KEYS = ['rank', 'contributions', 'commits', 'stars', 'followers', 'repos'];

function LanguageToggle({ className = '' }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      className={`flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-900 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded-xl ${className}`}
      role="group"
      aria-label={t('nav.language')}
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`min-h-9 min-w-9 px-2 text-[11px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
            lang === code
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  isDarkMode,
  onToggleDarkMode,
  favoritesCount = 0,
  isFavoritesOnly,
  onToggleFavoritesOnly,
  onExportCSV,
  onExportJSON
}) {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);
  const headerRef = useRef(null);
  const searchRef = useRef(null);

  // Tap/click outside (touch included) or Escape closes the export menu and the mobile menu
  useDismiss(exportRef, exportOpen, () => setExportOpen(false));
  useDismiss(headerRef, mobileMenuOpen, () => setMobileMenuOpen(false));

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 mb-4 sm:mb-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">

        {/* Brand Logo Header */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs">
              <Github className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono flex items-center gap-1">
                Git<span className="text-neutral-500 dark:text-neutral-400">Top</span>
              </h1>
            </div>
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <LanguageToggle />

            <button
              onClick={onToggleDarkMode}
              className="min-h-10 min-w-10 p-2 flex items-center justify-center text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 cursor-pointer"
              aria-label={t('nav.theme')}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-10 min-w-10 p-2 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center cursor-pointer"
              aria-label={t('nav.menu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Controls (Search, Sort, Layout, Favorites, Export, Language, Theme) */}
        <div className="w-full md:flex md:flex-1 md:max-w-4xl items-center gap-2 sm:gap-2.5 flex flex-col md:flex-row">

          {/* Search Input (always visible, also on mobile) */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              ref={searchRef}
              type="search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur();
              }}
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label={t('nav.searchAria')}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full min-h-10 pl-10 pr-10 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-base md:text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder-neutral-400 dark:placeholder-neutral-500 font-medium [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  searchRef.current?.focus();
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                aria-label={t('nav.clearSearch')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Remaining controls: collapsible on mobile, inline on desktop */}
          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:contents flex-col w-full gap-2`}>

          {/* Sort Selector */}
          <div className="relative w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              aria-label={t('nav.sortAria')}
              className="w-full md:w-auto min-h-10 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-base md:text-xs text-neutral-900 dark:text-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white font-mono cursor-pointer font-medium"
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`nav.sort.${key}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Filter Button */}
          <button
            onClick={onToggleFavoritesOnly}
            aria-pressed={isFavoritesOnly}
            className={`w-full md:w-auto min-h-10 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border shrink-0 cursor-pointer ${
              isFavoritesOnly
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
            title={t('nav.savedTitle')}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavoritesOnly ? 'fill-current' : ''}`} />
            <span>{t('nav.saved')}</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                isFavoritesOnly
                  ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Export Dropdown */}
          <div className="relative w-full md:w-auto" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="w-full md:w-auto min-h-10 px-3 py-2 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title={t('nav.exportTitle')}
              aria-label={t('nav.exportTitle')}
              aria-expanded={exportOpen}
              aria-haspopup="menu"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('nav.export')}</span>
            </button>

            {exportOpen && (
              <div role="menu" className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 p-1 space-y-0.5 animate-fade-in">
                <button
                  role="menuitem"
                  onClick={() => {
                    onExportCSV();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 min-h-10 px-2.5 py-2 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t('nav.downloadCsv')}</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    onExportJSON();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 min-h-10 px-2.5 py-2 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{t('nav.downloadJson')}</span>
                </button>
              </div>
            )}
          </div>

          {/* View Switcher Buttons */}
          <div className="flex items-center justify-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full md:w-auto min-h-10">
            <button
              onClick={() => onViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('nav.cards')}</span>
            </button>

            <button
              onClick={() => onViewModeChange('table')}
              aria-pressed={viewMode === 'table'}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('nav.table')}</span>
            </button>
          </div>

          {/* Language + Theme Toggle (Desktop) */}
          <LanguageToggle className="hidden md:flex" />

          <button
            onClick={onToggleDarkMode}
            className="hidden md:flex min-h-10 min-w-10 items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all shadow-xs cursor-pointer"
            title={isDarkMode ? t('nav.themeLight') : t('nav.themeDark')}
            aria-label={t('nav.theme')}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          </div>
        </div>

      </div>
    </header>
  );
}
