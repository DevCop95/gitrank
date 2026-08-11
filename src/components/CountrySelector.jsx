import React, { useState } from 'react';
import { COUNTRIES } from '../data/countriesList';
import { Search, Globe, ChevronDown, Check } from 'lucide-react';

export default function CountrySelector({ selectedCountry, onSelectCountry }) {
  const [countryFilter, setCountryFilter] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredCountries = COUNTRIES.filter(c => {
    const q = countryFilter.toLowerCase().trim();
    const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.iso.toLowerCase().includes(q);
    return matchesQuery;
  });

  const activeCountryObj = COUNTRIES.find(
    c => c.code.toLowerCase() === selectedCountry.toLowerCase() || c.name.toLowerCase() === selectedCountry.toLowerCase()
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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
      {/* Quick Access ISO Pill Bar */}
      <div className="flex items-center gap-2 flex-wrap mb-4 pb-4 border-b border-slate-200">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1 font-semibold">Quick Access:</span>
        {quickPills.map((pill) => {
          const isSelected = pill.code.toLowerCase() === selectedCountry.toLowerCase();
          return (
            <button
              key={pill.code}
              onClick={() => onSelectCountry(pill.code)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Top Bar: Active Country Info & Dropdown Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-blue-600 shadow-inner">
            [{activeCountryObj.iso}]
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono tracking-widest text-slate-400 font-semibold">Active Country Filter</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded-md border border-slate-200 font-semibold">
                Top 30
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
              {activeCountryObj.name}
            </h2>
          </div>
        </div>

        {/* Dropdown Selector Button */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full sm:w-64 flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">{activeCountryObj.name} ({activeCountryObj.iso})</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Full Country Dropdown Drawer */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 max-h-96 overflow-y-auto">
              {/* Internal Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  placeholder="Filter country by name or ISO..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              {/* Grid of Countries */}
              <div className="grid grid-cols-1 gap-1">
                {filteredCountries.map((c) => {
                  const isSelected = c.code.toLowerCase() === selectedCountry.toLowerCase();
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        onSelectCountry(c.code);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <strong className="text-slate-400 w-8">[{c.iso}]</strong>
                        <span>{c.name}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
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
