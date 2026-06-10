export const siteConfig = {
  name: 'Uza Mobility Admin',
  description: 'Admin panel for UZA Mobility platform.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7000',
} as const;

/** Canonical site origin for metadata (no trailing slash). */
export function getSiteOrigin(): string {
  return siteConfig.url.replace(/\/$/, '');
}
