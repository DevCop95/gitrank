import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gittop_favorite_devs';

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

  const isFavorite = (login) => {
    return favorites.some((fav) => (typeof fav === 'string' ? fav === login : fav.login === login));
  };

  const toggleFavorite = (dev) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => (typeof item === 'string' ? item === dev.login : item.login === dev.login));
      if (exists) {
        return prev.filter((item) => (typeof item === 'string' ? item !== dev.login : item.login !== dev.login));
      } else {
        // Save minimal developer profile payload
        return [
          ...prev,
          {
            login: dev.login,
            name: dev.name || dev.login,
            avatar_url: dev.avatar_url,
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
      }
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
