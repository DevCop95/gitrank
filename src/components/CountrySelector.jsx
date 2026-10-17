import React, { useState, useEffect, useRef, useMemo } from 'react';
import { COUNTRIES, REGIONS } from '../data/countriesList';
import { Search, Globe, ChevronDown, Check, X } from 'lucide-react';
import { useDismiss } from '../utils/useDismiss';
import { normalizeText } from '../utils/normalizeText';
import { useI18n } from '../i18n/I18nContext';

// Spanish names so "españa" or "alemania" find the English-named entries.
const SPANISH_ALIASES = {
  World: 'mundo mundial global',
  'United States': 'estados unidos eeuu usa',
  'United Kingdom': 'reino unido uk inglaterra',
  Spain: 'espana',
  Germany: 'alemania',
  Brazil: 'brasil',
  France: 'francia',
  Italy: 'italia',
  Japan: 'japon',
  Netherlands: 'paises bajos holanda',
  Switzerland: 'suiza',
  Sweden: 'suecia',
  Norway: 'noruega',
  Denmark: 'dinamarca',
  Finland: 'finlandia',
  Poland: 'polonia',
  Greece: 'grecia',
  Hungary: 'hungria',
  Ireland: 'irlanda',
  Iceland: 'islandia',
  Croatia: 'croacia',
  'Czech Republic': 'republica checa chequia',
  Turkey: 'turquia',
  Ukraine: 'ucrania',
  Belgium: 'belgica',
  Romania: 'rumania',
  Egypt: 'egipto',
  Kenya: 'kenia',
  'South Africa': 'sudafrica',
  'South Korea': 'corea del sur',
  'New Zealand': 'nueva zelanda',
  Thailand: 'tailandia',
  Philippines: 'filipinas',
  Malaysia: 'malasia',
  Singapore: 'singapur',
  'Dominican Republic': 'republica dominicana'
};

const SEARCH_INDEX = COUNTRIES.map((c) => ({
  country: c,
  haystack: normalizeText(`${c.name} ${c.iso} ${c.code} ${SPANISH_ALIASES[c.code] || ''}`)
}));

export default function CountrySelector({ selectedCountry, onSelectCountry }) {
  const { t } = useI18n();
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  const closeDropdown = () => {
    setDropdownOpen(false);
    setCountryFilter('');
    setSelectedRegion('All');
  };

  // Close on outside tap/click (touch included), Escape, or focus leaving the panel
  useDismiss(dropdownRef, dropdownOpen, closeDropdown);

  // Focus the search box on desktop only; on touch it would pop the keyboard over the list
  useEffect(() => {
    if (dropdownOpen && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      searchInputRef.current?.focus();
    }
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    const q = normalizeText(countryFilter);
    return SEARCH_INDEX.filter(({ country, haystack }) => {
      const matchesQuery = !q || haystack.includes(q);
      const matchesRegion = selectedRegion === 'All' || country.region === selectedRegion;
      return matchesQuery && matchesRegion;
    }).map(({ country }) => country);
  }, [countryFilter, selectedRegion]);

  // Arrow keys / Home / End move between the search box and the options
  const moveFocus = (event, index) => {
    const options = [...(listRef.current?.querySelectorAll('[data-country-option]') || [])];
    let next = null;
    if (event.key === 'ArrowDown') next = options[index + 1] || options[0];
    else if (event.key === 'ArrowUp') next = index <= 0 ? searchInputRef.current : options[index - 1];
    else if (event.key === 'Home') next = options[0];
    else if (event.key === 'End') next = options[options.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  const handleSelect = (code) => {
    onSelectCountry(code);
    closeDropdown();
  };

  const activeCountryObj =
    COUNTRIES.find(
      (c) =>
        c.code.toLowerCase() === selectedCountry.toLowerCase() ||
        c.name.toLowerCase() === selectedCountry.toLowerCase()
    ) || COUNTRIES[0];

  const quickPills = [
    { code: 'World', label: `[GLOBAL] ${t('country.world')}` },
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
          {t('country.quickAccess')}
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
                {t('country.activeFilter')}
              </span>
              <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono rounded-md border border-neutral-200 dark:border-neutral-700 font-semibold">
                {activeCountryObj.region ? t(`region.${activeCountryObj.region}`) : t('country.regionFallback')}
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
            onClick={() => (dropdownOpen ? closeDropdown() : setDropdownOpen(true))}
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
            <div className="absolute left-0 sm:left-auto right-0 top-full mt-2 w-full sm:w-88 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 p-3 max-h-[min(26rem,calc(100dvh-10rem))] overflow-y-auto overscroll-contain">

              {/* Region Tabs inside Dropdown */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2.5 border-b border-neutral-200 dark:border-neutral-800">
                {REGIONS.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`min-h-8 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {t(`region.${reg}`)}
                  </button>
                ))}
              </div>

              {/* Internal Search */}
              <div className="relative mb-2.5">
                <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredCountries.length > 0) {
                      e.preventDefault();
                      handleSelect(filteredCountries[0].code);
                    } else if (e.key === 'ArrowDown') {
                      moveFocus(e, -1);
                    }
                  }}
                  enterKeyHint="go"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={t('country.searchPlaceholder')}
                  aria-label={t('country.searchAria')}
                  className="w-full min-h-10 pl-9 pr-9 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-base sm:text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-black dark:focus:border-white font-medium [&::-webkit-search-cancel-button]:appearance-none"
                />
                {countryFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setCountryFilter('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                    aria-label={t('country.clear')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Grid of Countries */}
              <div ref={listRef} className="grid grid-cols-1 gap-1" role="listbox" aria-label={t('country.listAria')}>
                {filteredCountries.map((c) => {
                  const isSelected = c.code.toLowerCase() === selectedCountry.toLowerCase();
                  return (
                    <button
                      key={c.code}
                      role="option"
                      data-country-option
                      onKeyDown={(e) => moveFocus(e, filteredCountries.indexOf(c))}
                      aria-selected={isSelected}
                      onClick={() => handleSelect(c.code)}
                      className={`flex items-center justify-between min-h-10 sm:min-h-9 px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left cursor-pointer ${
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
                {filteredCountries.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {t('country.none', { q: countryFilter })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
