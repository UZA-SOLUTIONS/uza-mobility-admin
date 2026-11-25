import { siteConfig } from '@/config/site';

function marketplaceOrigin(): string | null {
  if (!siteConfig.marketplaceUrl) return null;
  return siteConfig.marketplaceUrl.replace(/\/$/, '');
}

/** Absolute guest marketplace URL for a vehicle listing slug, or null if unset. */
export function marketplaceVehicleUrl(slug: string): string | null {
  const origin = marketplaceOrigin();
  if (!origin || !slug) return null;
  return `${origin}/vehicles/${encodeURIComponent(slug)}`;
}

/** Absolute guest marketplace URL for spare parts, or null if unset. */
export function marketplaceSparePartsUrl(categorySlug?: string): string | null {
  const origin = marketplaceOrigin();
  if (!origin) return null;
  if (!categorySlug) {
    return `${origin}/spare-parts`;
  }
  const params = new URLSearchParams({ category: categorySlug });
  return `${origin}/spare-parts?${params.toString()}`;
}
