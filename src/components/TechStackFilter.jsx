import React from 'react';
import { Code2, X } from 'lucide-react';

const MONO_BAR_PALETTE = [
  'bg-neutral-900 dark:bg-neutral-100',
  'bg-neutral-700 dark:bg-neutral-300',
  'bg-neutral-500 dark:bg-neutral-500',
  'bg-neutral-400 dark:bg-neutral-600',
  'bg-neutral-300 dark:bg-neutral-700',
  'bg-neutral-200 dark:bg-neutral-800'
];

export default function TechStackFilter({
  rawDevelopers = [],
  selectedLanguage,
  onSelectLanguage
}) {
  const languageCounts = {};
  let totalTaggings = 0;

  rawDevelopers.forEach((dev) => {
    if (dev.languages && Array.isArray(dev.languages)) {
      dev.languages.forEach((lang) => {
        if (lang && lang.trim()) {
          const l = lang.trim();
          languageCounts[l] = (languageCounts[l] || 0) + 1;
          totalTaggings += 1;
        }
      });
    }
  });

  const sortedLanguages = Object.entries(languageCounts)
    .map(([lang, count]) => ({
      lang,
      count,
      percentage: totalTaggings > 0 ? Math.round((count / totalTaggings) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  if (sortedLanguages.length === 0) return null;

  const topLanguages = sortedLanguages.slice(0, 12);
  const barLanguages = sortedLanguages.slice(0, 6);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-6 shadow-2xs transition-colors">
      
      {/* Header & Stack Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <span>Tech Stack Filter</span>
              <span className="text-[10px] font-normal text-neutral-500 dark:text-neutral-400 font-mono">
                ({sortedLanguages.length} technologies found)
              </span>
            </h3>
          </div>
        </div>

        {selectedLanguage && (
          <button
            onClick={() => onSelectLanguage('')}
            className="self-start sm:self-auto inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Stack Filter: <strong>{selectedLanguage}</strong></span>
          </button>
        )}
      </div>

      {/* Monochrome Stack Breakdown Bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex gap-0.5 mb-3">
        {barLanguages.map((item, idx) => (
          <div
            key={item.lang}
            className={`${MONO_BAR_PALETTE[idx % MONO_BAR_PALETTE.length]} transition-all hover:opacity-80`}
            style={{ width: `${Math.max(item.percentage, 4)}%` }}
            title={`${item.lang}: ${item.count} devs (${item.percentage}%)`}
          />
        ))}
      </div>

      {/* Language Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onSelectLanguage('')}
          className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
            !selectedLanguage
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          All ({rawDevelopers.length})
        </button>

        {topLanguages.map((item) => {
          const isSelected = selectedLanguage === item.lang;

          return (
            <button
              key={item.lang}
              onClick={() => onSelectLanguage(isSelected ? '' : item.lang)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <span>{item.lang}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isSelected
                  ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
