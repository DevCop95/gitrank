import React, { useState } from 'react';
import { Copy, Check, Sparkles, Share2, Code } from 'lucide-react';

export default function BadgeGenerator({ developer, onNotify }) {
  const [style, setStyle] = useState('for-the-badge');
  const [color, setColor] = useState('000000');
  const [copiedType, setCopiedType] = useState(null);

  if (!developer) return null;

  const { rank, login, country = 'Worldwide' } = developer;
  const baseUrl = window.location.origin + window.location.pathname;
  const shareUrl = `${baseUrl}?country=${encodeURIComponent(country)}&dev=${encodeURIComponent(login)}`;

  const badgeText = `GitTop Rank`;
  const badgeMessage = `#${rank} in ${country}`;
  const encodedMessage = encodeURIComponent(badgeMessage);
  const encodedLabel = encodeURIComponent(badgeText);

  const shieldUrl = `https://img.shields.io/badge/${encodedLabel}-${encodedMessage}-${color}?style=${style}&logo=github&logoColor=white`;

  const markdownSnippet = `[![GitTop Rank #${rank} in ${country}](${shieldUrl})](${shareUrl})`;
  const htmlSnippet = `<a href="${shareUrl}"><img src="${shieldUrl}" alt="GitTop Rank #${rank} in ${country}" /></a>`;

  const handleCopy = (text, type, label) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onNotify) {
      onNotify(`${label} copied to clipboard!`, 'success');
    }
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const styleOptions = [
    { id: 'for-the-badge', label: 'For The Badge (Bold)' },
    { id: 'flat', label: 'Flat (Standard)' },
    { id: 'flat-square', label: 'Flat Square' },
    { id: 'plastic', label: 'Plastic' }
  ];

  const colorOptions = [
    { hex: '000000', label: 'Pure Black', bg: 'bg-black' },
    { hex: '27272a', label: 'Zinc Dark', bg: 'bg-neutral-800' },
    { hex: '52525b', label: 'Neutral Gray', bg: 'bg-neutral-600' },
    { hex: '71717a', label: 'Light Gray', bg: 'bg-neutral-400' }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3.5 sm:p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
            <span>Live Badge Preview</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">Compatible with GitHub README</span>
        </div>

        {/* Live Badge Preview Box */}
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center min-h-[60px] shadow-2xs">
          <img
            src={shieldUrl}
            alt={`GitTop Rank #${rank} in ${country}`}
            className="max-h-8 object-contain"
          />
        </div>

        {/* Customization Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          
          {/* Style Selector */}
          <div>
            <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
              Badge Style:
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 rounded-lg p-2 font-mono"
            >
              {styleOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 block mb-1">
              Badge Tone:
            </label>
            <div className="flex items-center gap-2 pt-1">
              {colorOptions.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setColor(col.hex)}
                  className={`w-6 h-6 rounded-full ${col.bg} transition-all cursor-pointer ${
                    color === col.hex
                      ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={col.label}
                  aria-label={col.label}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Code Snippets */}
      <div className="space-y-3">
        
        {/* Markdown Snippet */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-neutral-500" />
              <span>Markdown for GitHub Profile README</span>
            </span>

            <button
              onClick={() => handleCopy(markdownSnippet, 'md', 'Markdown code')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg text-[11px] font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              {copiedType === 'md' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'md' ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>

          <pre className="text-[11px] font-mono bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 overflow-x-auto select-all">
            {markdownSnippet}
          </pre>
        </div>

        {/* Direct Link */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>Direct Shareable Profile URL</span>
            </span>

            <button
              onClick={() => handleCopy(shareUrl, 'url', 'Profile URL')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg text-[11px] font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              {copiedType === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'url' ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 truncate select-all">
            {shareUrl}
          </div>
        </div>

      </div>
    </div>
  );
}
