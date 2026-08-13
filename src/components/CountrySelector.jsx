import React, { useState, useEffect, useRef } from 'react';
import { COUNTRIES } from '../data/countriesList';
import { Search, Globe, ChevronDown, Check } from 'lucide-react';

export default function CountrySelector({ selectedCountry, onSelectCountry }) {
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const regions = ['All', 'LATAM', 'North America', 'Europe', 'Asia', 'Global'];

  const filteredCountries = COUNTRIES.filter((c) => {
    const q = countryFilter.toLowerCase().trim();
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.iso.toLowerCase().includes(q);
    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    return matchesQuery && matchesRegion;
  });

  const activeCountryObj =
    COUNTRIES.find(
      (c) =>
        c.code.toLowerCase() === selectedCountry.toLowerCase() ||
        c.name.toLowerCase() === selectedCountry.toLowerCase()
    ) || COUNTRIES[0];

  const quickPills = [
    { code: 'World', label: '[GLOBAL] Worldwide' },
    { code: 'Colombia', label: '[CO] Colombia' },
    { code: 'United States', label: '[US] USA' },
    { code: 'Spain', label: '[ES] Spain' },
    { code: 'Germany', label: '[DE] Germany' },
    { code: 'Mexico', label: '[MX] Mexico' },
    { code: 'Argentina', label: '[AR] Argentina' },
    { code: 'Brazil', label: '[BR] Brazil' },
    { code: 'United Kingdom', label: '[GB] UK' },
    { code: 'Japan', label: '[JP] Japan' }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 md:p-5 mb-4 sm:mb-6 shadow-2xs transition-colors">
      
      {/* Quick Access ISO Pill Bar */}
      <div className="-mx-1 px-1 flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-1 font-semibold whitespace-nowrap shrink-0">
          Quick Access:
        </span>
        {quickPills.map((pill) => {
          const isSelected = pill.code.toLowerCase() === selectedCountry.toLowerCase();
          return (
            <button
              key={pill.code}
              onClick={() => onSelectCountry(pill.code)}
              className={`min-h-9 px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Top Bar: Active Country Info & Dropdown Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-10 px-2.5 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-mono font-bold text-xs text-neutral-900 dark:text-white shadow-2xs shrink-0">
            [{activeCountryObj.iso}]
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-neutral-400 dark:text-neutral-500 font-semibold">
                Active Country Filter
              </span>
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono rounded-md border border-neutral-200 dark:border-neutral-700 font-semibold">
                {activeCountryObj.region || 'Region'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white tracking-tight truncate mt-0.5">
              {activeCountryObj.name}
            </h2>
          </div>
        </div>

        {/* Dropdown Selector Button */}
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full sm:w-64 min-h-10 flex items-center justify-between gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm sm:text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition-all shadow-2xs cursor-pointer"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
              <span className="truncate">{activeCountryObj.name} ({activeCountryObj.iso})</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Full Country Dropdown Drawer */}
          {dropdownOpen && (
            <div className="absolute left-0 sm:left-auto right-0 top-full mt-2 w-full sm:w-88 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-3 max-h-[min(26rem,calc(100vh-10rem))] overflow-y-auto">
              
              {/* Region Tabs inside Dropdown */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2.5 border-b border-neutral-200 dark:border-neutral-800">
                {regions.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Internal Search */}
              <div className="relative mb-2.5">
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  placeholder="Search by country or ISO..."
                  className="w-full min-h-9 pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                />
              </div>

              {/* Grid of Countries */}
              <div className="grid grid-cols-1 gap-1" role="listbox" aria-label="Countries">
                {filteredCountries.map((c) => {
                  const isSelected = c.code.toLowerCase() === selectedCountry.toLowerCase();
                  return (
                    <button
                      key={c.code}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onSelectCountry(c.code);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between min-h-9 px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <strong className={`font-mono text-xs shrink-0 inline-block min-w-[3.5rem] ${isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-400 dark:text-neutral-500'}`}>
                          [{c.iso}]
                        </strong>
                        <span className="truncate">{c.name}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white dark:text-black shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
