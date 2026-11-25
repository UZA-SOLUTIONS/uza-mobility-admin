function optionalEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const siteConfig = {
  name: 'Uza Mobility Admin',
  description: 'Admin panel for UZA Mobility platform.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7000',
  /** Guest marketplace (FN) origin. When unset, marketplace links are inactive. */
  marketplaceUrl: optionalEnv(process.env.NEXT_PUBLIC_MARKETPLACE_URL),
} as const;

/** Canonical site origin for metadata (no trailing slash). */
export function getSiteOrigin(): string {
  return siteConfig.url.replace(/\/$/, '');
}
