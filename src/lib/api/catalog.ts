import { apiFetch } from '@/lib/api/api';
import type { Category } from '@/types/admin/marketplace';

export function getPublicCategories() {
  return apiFetch<Category[]>('/categories');
}
