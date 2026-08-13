import React, { useState, useRef, useEffect } from 'react';
import { Search, LayoutGrid, List, Github, Menu, X, Sun, Moon, Bookmark, Download, FileSpreadsheet, FileCode } from 'lucide-react';

export default function Navbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalDevsCount,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    if (exportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 mb-4 sm:mb-6 transition-colors">
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
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-10 min-w-10 p-2 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Controls (Search, Sort, Layout, Favorites, Export, Theme) */}
        <div className={`w-full md:flex md:flex-1 md:max-w-3xl items-center gap-2 sm:gap-2.5 ${mobileMenuOpen ? 'flex flex-col mt-2 pt-3 border-t border-neutral-200 dark:border-neutral-800 md:border-0 md:pt-0 md:mt-0' : 'hidden md:flex'}`}>
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search developer by name or username..."
              className="w-full min-h-10 pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm md:text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all placeholder-neutral-400 dark:placeholder-neutral-500 font-medium"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full md:w-auto min-h-10 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm md:text-xs text-neutral-900 dark:text-neutral-100 rounded-xl px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white font-mono cursor-pointer font-medium"
            >
              <option value="rank">Order: Rank (#1, #2...)</option>
              <option value="contributions">Order: Contributions</option>
              <option value="commits">Order: Commits</option>
              <option value="stars">Order: Stars Received</option>
              <option value="followers">Order: Followers</option>
              <option value="repos">Order: Repositories</option>
            </select>
          </div>

          {/* Favorites Filter Button */}
          <button
            onClick={onToggleFavoritesOnly}
            className={`w-full md:w-auto min-h-10 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border shrink-0 cursor-pointer ${
              isFavoritesOnly
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
            title="Show only bookmarked developers"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
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
              title="Export leaderboard data"
              aria-label="Export options"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {exportOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 p-1 space-y-0.5 animate-fade-in">
                <button
                  onClick={() => {
                    onExportCSV();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => {
                    onExportJSON();
                    setExportOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Download JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* View Switcher Buttons */}
          <div className="flex items-center justify-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full md:w-auto min-h-10">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => onViewModeChange('table')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-xs border border-neutral-200 dark:border-neutral-700'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Theme Toggle (Desktop) */}
          <button
            onClick={onToggleDarkMode}
            className="hidden md:flex min-h-10 min-w-10 items-center justify-center text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all shadow-xs cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </header>
  );
}
