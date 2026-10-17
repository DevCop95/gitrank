import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'gittop_favorite_devs';

const loginOf = (fav) => (typeof fav === 'string' ? fav : fav.login);

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Latest favorites for callbacks that must stay referentially stable
  const favoritesRef = useRef(favorites);
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  const favoriteLogins = useMemo(() => new Set(favorites.map(loginOf)), [favorites]);

  const isFavorite = useCallback((login) => favoriteLogins.has(login), [favoriteLogins]);

  /** Toggles a developer and returns true if it was a favorite before the call. */
  const toggleFavorite = useCallback((dev) => {
    const wasFavorite = favoritesRef.current.some((item) => loginOf(item) === dev.login);

    setFavorites((prev) => {
      if (prev.some((item) => loginOf(item) === dev.login)) {
        return prev.filter((item) => loginOf(item) !== dev.login);
      }
      // Save minimal developer profile payload
      return [
        ...prev,
        {
          login: dev.login,
          name: dev.name || dev.login,
          avatar_url: dev.avatar_url,
          html_url: dev.html_url,
          country: dev.country,
          rank: dev.rank,
          live_contributions: dev.live_contributions || dev.estimated_commits,
          estimated_commits: dev.estimated_commits,
          stars_received: dev.stars_received,
          followers: dev.followers,
          public_repos: dev.public_repos,
          languages: dev.languages || []
        }
      ];
    });

    return wasFavorite;
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
