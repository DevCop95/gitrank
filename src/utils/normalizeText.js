/**
 * Lowercases and strips diacritics so "México", "mexico" and "MEXICO" all match.
 */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
