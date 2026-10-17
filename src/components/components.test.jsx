import React, { useRef, useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { I18nProvider } from '../i18n/I18nContext';
import { useDismiss } from '../utils/useDismiss';
import CountrySelector from './CountrySelector';
import App from '../App';

const renderWithI18n = (ui, lang = 'en') => render(<I18nProvider initialLang={lang}>{ui}</I18nProvider>);

function DismissHarness({ onDismiss }) {
  const ref = useRef(null);
  const [open] = useState(true);
  useDismiss(ref, open, onDismiss);
  return (
    <div>
      <div ref={ref}><button>inside</button></div>
      <p>outside</p>
    </div>
  );
}

describe('useDismiss', () => {
  it('dismisses on outside pointerdown (touch) but not inside', () => {
    const onDismiss = vi.fn();
    render(<DismissHarness onDismiss={onDismiss} />);

    fireEvent.pointerDown(screen.getByText('inside'));
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByText('outside'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses on Escape', () => {
    const onDismiss = vi.fn();
    render(<DismissHarness onDismiss={onDismiss} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('CountrySelector', () => {
  const open = () => fireEvent.click(screen.getByRole('button', { name: /Colombia \(CO\)/ }));

  it('closes when tapping outside', () => {
    renderWithI18n(
      <div>
        <CountrySelector selectedCountry="Colombia" onSelectCountry={() => {}} />
        <p>elsewhere</p>
      </div>
    );
    open();
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.pointerDown(screen.getByText('elsewhere'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('lists countries of the Asia & Oceania region and Africa', () => {
    renderWithI18n(<CountrySelector selectedCountry="Colombia" onSelectCountry={() => {}} />);
    open();

    fireEvent.click(screen.getByRole('button', { name: 'Asia & Oceania' }));
    expect(within(screen.getByRole('listbox')).getByText('Japan')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Africa' }));
    expect(within(screen.getByRole('listbox')).getByText('Kenya')).toBeTruthy();
  });

  it('finds countries by Spanish name without accents and selects with Enter', () => {
    const onSelect = vi.fn();
    renderWithI18n(<CountrySelector selectedCountry="Colombia" onSelectCountry={onSelect} />);
    open();

    const input = screen.getByRole('searchbox', { name: 'Search countries' });
    fireEvent.change(input, { target: { value: 'espAña' } });
    expect(within(screen.getByRole('listbox')).getByText('Spain')).toBeTruthy();

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('Spain');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('moves focus with arrow keys', () => {
    renderWithI18n(<CountrySelector selectedCountry="Colombia" onSelectCountry={() => {}} />);
    open();
    const input = screen.getByRole('searchbox', { name: 'Search countries' });
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(document.activeElement.getAttribute('role')).toBe('option');
  });
});

const dataset = {
  last_updated: new Date().toISOString(),
  countries: {
    Colombia: {
      code: 'Colombia',
      name: 'Colombia',
      iso: 'CO',
      top_developers: [
        { rank: 1, login: 'alice', name: 'Alice Núñez', languages: ['Python'], live_contributions: 1200, estimated_commits: 900, stars_received: 5, followers: 10, public_repos: 3, country: 'Colombia' },
        { rank: 2, login: 'bob', name: 'Bob', languages: ['Go'], live_contributions: 800, estimated_commits: 700, stars_received: 2, followers: 4, public_repos: 8, country: 'Colombia' }
      ]
    }
  }
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => dataset });
  });

  it('loads the dataset, filters by accent-insensitive search and switches language', async () => {
    renderWithI18n(<App />);

    expect(await screen.findByText('Alice Núñez')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledWith('./data/committers.json', expect.objectContaining({ cache: 'no-cache' }));

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search developers' }), { target: { value: 'nunez' } });
    await waitFor(() => expect(screen.queryByText('Bob')).toBeNull());
    expect(screen.getByText('Alice Núñez')).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: 'es' })[0]);
    expect(screen.getByText('Mostrando: 1 desarrolladores')).toBeTruthy();
    expect(document.documentElement.lang).toBe('es');
  });

  it('shows the error state and retries', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ ok: true, json: async () => dataset });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithI18n(<App />);

    expect(await screen.findByText('Unable to load rankings')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(await screen.findByText('Alice Núñez')).toBeTruthy();
  });

  it('opens the developer dialog and closes it with Escape', async () => {
    renderWithI18n(<App />);
    await screen.findByText('Alice Núñez');

    fireEvent.click(screen.getAllByRole('button', { name: /View statistics for Alice/ })[0]);
    expect(screen.getByRole('dialog')).toBeTruthy();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
