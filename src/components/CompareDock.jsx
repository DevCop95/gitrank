import React from 'react';
import { Swords, X, UserPlus, ArrowRight } from 'lucide-react';

export default function CompareDock({
  compareList = [],
  onRemoveFromCompare,
  onClearCompare,
  onOpenCompareModal
}) {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-slide-up">
      <div className="bg-black/90 dark:bg-neutral-900/90 backdrop-blur-md text-white border border-neutral-800 rounded-2xl p-3 sm:p-3.5 shadow-2xl flex items-center justify-between gap-3">
        
        {/* Left info & Avatars */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-neutral-800 rounded-xl text-white shrink-0">
            <Swords className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {compareList.map((dev) => (
              <div
                key={dev.login}
                className="flex items-center gap-1.5 bg-neutral-900 dark:bg-neutral-800 border border-neutral-800 rounded-xl pl-1 pr-2 py-1 shrink-0"
              >
                <img
                  src={dev.avatar_url}
                  alt={dev.login}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="text-xs font-mono font-medium truncate max-w-[80px] sm:max-w-[110px]">
                  @{dev.login}
                </span>
                <button
                  onClick={() => onRemoveFromCompare(dev.login)}
                  className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                  aria-label={`Remove ${dev.login} from comparison`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {compareList.length === 1 && (
              <div className="hidden sm:flex items-center gap-1.5 border border-dashed border-neutral-700 rounded-xl px-2.5 py-1 text-neutral-400 text-xs font-mono">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Select 2nd dev</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClearCompare}
            className="text-neutral-400 hover:text-white text-xs font-medium px-2 py-1 transition-colors hidden sm:block cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={onOpenCompareModal}
            disabled={compareList.length < 2}
            className={`min-h-9 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
              compareList.length >= 2
                ? 'bg-white text-black dark:bg-white dark:text-black cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <span>Compare ({compareList.length}/2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
