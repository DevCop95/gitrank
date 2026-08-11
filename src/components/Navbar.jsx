import React, { useState } from 'react';
import { Search, LayoutGrid, List, Github, Menu, X } from 'lucide-react';

export default function Navbar({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  totalDevsCount,
  sortBy,
  onSortByChange
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 mb-4 sm:mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
              <Github className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-mono flex items-center gap-1">
                Git<span className="text-blue-600">Top</span>
              </h1>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-11 min-w-11 p-2 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 bg-slate-50"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop Controls (Search, Sort, Layout Switcher) */}
        <div className={`w-full md:flex md:flex-1 md:max-w-2xl items-center gap-2.5 sm:gap-3 ${mobileMenuOpen ? 'flex flex-col mt-2 pt-3 border-t border-slate-200 md:border-0 md:pt-0 md:mt-0' : 'hidden md:flex'}`}>
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search developer by name or username..."
              className="w-full min-h-11 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm md:text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400 font-medium"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full md:w-auto min-h-11 bg-slate-50 border border-slate-200 text-sm md:text-xs text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-600 font-mono cursor-pointer font-medium"
            >
              <option value="rank">Order by Rank (#1, #2, #3...)</option>
              <option value="contributions">Order by Live Contributions</option>
              <option value="commits">Order by Commits</option>
              <option value="stars">Order by Stars Received</option>
              <option value="followers">Order by Followers</option>
              <option value="repos">Order by Repositories</option>
            </select>
          </div>

          {/* View Switcher Buttons */}
          <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 border border-slate-200 rounded-xl w-full md:w-auto min-h-11">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm md:text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => onViewModeChange('table')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm md:text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
