import { apiFetchPaginated } from '@/lib/api/api';
import type { PublicPart } from '@/types/marketplace/public-part';

export type BrowsePartsFilters = {
  q?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
};

export function browsePublicParts(filters: BrowsePartsFilters = {}) {
  const params = new URLSearchParams({
    limit: String(filters.limit ?? 24),
    page: String(filters.page ?? 1),
  });

  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.category) params.set('category', filters.category);
  if (filters.brand) params.set('brand', filters.brand);
  if (filters.model) params.set('model', filters.model);
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.priceMin != null)
    params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax != null)
    params.set('priceMax', String(filters.priceMax));
  if (filters.inStock != null) params.set('inStock', String(filters.inStock));

  return apiFetchPaginated<PublicPart>('/parts', { searchParams: params });
}
