import { normalizeText } from './normalizeText';

const SEARCH_FIELDS = ['login', 'name', 'bio', 'location', 'company'];

/** Filters by free-text search (accent-insensitive) and by language. */
export function filterDevelopers(developers, { searchTerm = '', language = '' } = {}) {
  const q = normalizeText(searchTerm);
  const lang = language.toLowerCase();

  return developers.filter((dev) => {
    const matchesSearch =
      !q || SEARCH_FIELDS.some((field) => dev[field] && normalizeText(dev[field]).includes(q));

    const matchesLanguage =
      !lang ||
      (Array.isArray(dev.languages) && dev.languages.some((l) => l.toLowerCase() === lang));

    return matchesSearch && matchesLanguage;
  });
}

const contributionsOf = (dev) => dev.live_contributions || dev.estimated_commits || 0;

const SORTERS = {
  contributions: (a, b) => contributionsOf(b) - contributionsOf(a),
  commits: (a, b) => (b.estimated_commits || 0) - (a.estimated_commits || 0),
  stars: (a, b) => (b.stars_received || 0) - (a.stars_received || 0),
  followers: (a, b) => (b.followers || 0) - (a.followers || 0),
  repos: (a, b) => (b.public_repos || 0) - (a.public_repos || 0),
  rank: (a, b) => (a.rank || 0) - (b.rank || 0)
};

/** Returns a sorted copy; unknown sort keys fall back to rank. */
export function sortDevelopers(developers, sortBy = 'rank') {
  return [...developers].sort(SORTERS[sortBy] || SORTERS.rank);
}
