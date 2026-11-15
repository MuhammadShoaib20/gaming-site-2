export const CANONICAL_SITE_URL = 'https://levelguide.fun';

export function canonicalUrl(pathOrUrl: string): string {
  const parsedUrl = new URL(pathOrUrl, CANONICAL_SITE_URL);
  const normalizedPath = parsedUrl.pathname.toLowerCase().replace(/\/+$/, '');
  return `${CANONICAL_SITE_URL}${normalizedPath}`;
}
