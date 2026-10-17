import { describe, it, expect } from 'vitest';
import { normalizeText } from './normalizeText';
import { filterDevelopers, sortDevelopers } from './filterDevelopers';
import { csvCell } from './exportData';
import { cleanText } from './cleanText';

describe('normalizeText', () => {
  it('lowercases and strips accents', () => {
    expect(normalizeText('  México ')).toBe('mexico');
    expect(normalizeText('JOSÉ Peña')).toBe('jose pena');
  });

  it('handles empty values', () => {
    expect(normalizeText(undefined)).toBe('');
    expect(normalizeText(null)).toBe('');
  });
});

describe('filterDevelopers', () => {
  const devs = [
    { login: 'ana', name: 'Ana Pérez', bio: 'Rustacean', location: 'Bogotá', languages: ['Rust', 'Go'], rank: 2 },
    { login: 'bob', name: 'Bob', company: 'Acme', languages: ['JavaScript'], rank: 1 },
    { login: 'cy', languages: [], rank: 3 }
  ];

  it('returns everything with no filters', () => {
    expect(filterDevelopers(devs)).toHaveLength(3);
  });

  it('searches accent-insensitively across fields', () => {
    expect(filterDevelopers(devs, { searchTerm: 'perez' }).map((d) => d.login)).toEqual(['ana']);
    expect(filterDevelopers(devs, { searchTerm: 'bogota' }).map((d) => d.login)).toEqual(['ana']);
    expect(filterDevelopers(devs, { searchTerm: 'acme' }).map((d) => d.login)).toEqual(['bob']);
  });

  it('filters by language case-insensitively and tolerates missing languages', () => {
    expect(filterDevelopers(devs, { language: 'rust' }).map((d) => d.login)).toEqual(['ana']);
    expect(filterDevelopers([{ login: 'x' }], { language: 'Go' })).toEqual([]);
  });

  it('combines search and language', () => {
    expect(filterDevelopers(devs, { searchTerm: 'ana', language: 'Go' })).toHaveLength(1);
    expect(filterDevelopers(devs, { searchTerm: 'ana', language: 'JavaScript' })).toHaveLength(0);
  });
});

describe('sortDevelopers', () => {
  const devs = [
    { login: 'a', rank: 2, followers: 5, estimated_commits: 10 },
    { login: 'b', rank: 1, followers: 9, estimated_commits: 5 },
    { login: 'c', rank: 3, followers: 1, live_contributions: 50 }
  ];

  it('sorts by rank by default and does not mutate the input', () => {
    const before = devs.map((d) => d.login);
    expect(sortDevelopers(devs).map((d) => d.login)).toEqual(['b', 'a', 'c']);
    expect(devs.map((d) => d.login)).toEqual(before);
  });

  it('sorts by metrics descending and falls back to rank for unknown keys', () => {
    expect(sortDevelopers(devs, 'followers').map((d) => d.login)).toEqual(['b', 'a', 'c']);
    expect(sortDevelopers(devs, 'contributions').map((d) => d.login)).toEqual(['c', 'a', 'b']);
    expect(sortDevelopers(devs, 'nope').map((d) => d.login)).toEqual(['b', 'a', 'c']);
  });
});

describe('csvCell', () => {
  it('quotes and escapes double quotes', () => {
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('neutralises spreadsheet formulas', () => {
    expect(csvCell('=HYPERLINK("http://x")')).toMatch(/^"'=/);
    expect(csvCell('+1+1')).toBe(`"'+1+1"`);
    expect(csvCell('@cmd')).toBe(`"'@cmd"`);
  });

  it('keeps plain numbers and empty values intact', () => {
    expect(csvCell(-5)).toBe('"-5"');
    expect(csvCell(undefined)).toBe('""');
  });
});

describe('cleanText', () => {
  it('decodes entities and collapses whitespace', () => {
    expect(cleanText('Tom &amp; Jerry\n  rock')).toBe('Tom & Jerry rock');
    expect(cleanText(null)).toBe('');
  });
});
