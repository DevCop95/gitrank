import { describe, it, expect } from 'vitest';
import { translations } from './translations';
import { interpolate } from './I18nContext';

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('translations', () => {
  const enKeys = Object.keys(translations.en).sort();
  const esKeys = Object.keys(translations.es).sort();

  it('has the same keys in every language', () => {
    expect(esKeys).toEqual(enKeys);
  });

  it('uses the same placeholders in every language', () => {
    enKeys.forEach((key) => {
      expect(placeholders(translations.es[key]), key).toEqual(placeholders(translations.en[key]));
    });
  });

  it('has no empty strings', () => {
    Object.values(translations).forEach((dict) => {
      Object.entries(dict).forEach(([key, value]) => expect(value.length, key).toBeGreaterThan(0));
    });
  });
});

describe('interpolate', () => {
  it('replaces placeholders and keeps unknown ones', () => {
    expect(interpolate('Hi {name}, {n} left', { name: 'Ana', n: 0 })).toBe('Hi Ana, 0 left');
    expect(interpolate('Hi {name}', {})).toBe('Hi {name}');
    expect(interpolate('plain')).toBe('plain');
  });
});
