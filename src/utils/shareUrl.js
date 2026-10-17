/**
 * Link to a developer's static share page (`share/<login>/`, generated at deploy time).
 * Crawlers read that page's Open Graph tags (rank, country, stats, preview image);
 * people who open it are redirected to the app with the developer dialog open.
 */
export function buildShareUrl(login, origin = window.location.origin, pathname = window.location.pathname) {
  const base = pathname.endsWith('/') ? pathname : pathname.replace(/[^/]*$/, '');
  return `${origin}${base}share/${encodeURIComponent(login)}/`;
}
