import { authenticatedFetch } from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
} from '@/lib/api/multipart';
import { toSearchParams } from '@/lib/api/query-params';
import type { Category, Subcategory } from '@/types/admin/marketplace';
import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from '@/schemas/admin';

export type AdminCategoriesFilters = {
  isActive?: boolean;
};

export function getAdminCategories(filters: AdminCategoriesFilters = {}) {
  return authenticatedFetch<Category[]>('/admin/categories', {
    searchParams: toSearchParams(filters),
  });
}

export function createCategory(body: CreateCategoryInput, icon?: File) {
  const form = buildMultipartFormData(
    body,
    icon ? [{ field: 'icon', files: [icon] }] : [],
  );
  return authenticatedMultipartFetch<Category>('/categories', form);
}

export function updateCategory(
  id: string,
  body: UpdateCategoryInput,
  icon?: File,
) {
  const form = buildMultipartFormData(
    body,
    icon ? [{ field: 'icon', files: [icon] }] : [],
  );
  return authenticatedMultipartFetch<Category>(
    `/admin/categories/${id}`,
    form,
    {
      method: 'PATCH',
    },
  );
}

export function updateSubcategory(
  categoryId: string,
  subId: string,
  body: UpdateSubcategoryInput,
  icon?: File,
) {
  const payload: UpdateSubcategoryInput = {
    ...(body.name?.trim() ? { name: body.name.trim() } : {}),
    ...(body.description !== undefined
      ? { description: body.description.trim() || undefined }
      : {}),
    ...(body.displayOrder !== undefined && Number.isFinite(body.displayOrder)
      ? { displayOrder: body.displayOrder }
      : {}),
  };

  const form = buildMultipartFormData(
    payload,
    icon ? [{ field: 'icon', files: [icon] }] : [],
  );
  return authenticatedMultipartFetch<Subcategory>(
    `/admin/categories/${categoryId}/subcategories/${subId}`,
    form,
    { method: 'PATCH' },
  );
}

export function deactivateCategory(id: string) {
  return authenticatedFetch<Category>(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

export function reactivateCategory(id: string) {
  return authenticatedFetch<Category>(`/admin/categories/${id}/reactivate`, {
    method: 'PATCH',
  });
}

export function permanentlyDeleteCategory(id: string) {
  return authenticatedFetch<{ message: string }>(
    `/admin/categories/${id}/permanent`,
    { method: 'DELETE' },
  );
}

export function addSubcategory(
  categoryId: string,
  body: CreateSubcategoryInput,
  icon?: File,
) {
  const form = buildMultipartFormData(
    body,
    icon ? [{ field: 'icon', files: [icon] }] : [],
  );
  return authenticatedMultipartFetch<Subcategory>(
    `/categories/${categoryId}/subcategories`,
    form,
  );
}

export function deleteSubcategory(categoryId: string, subId: string) {
  return authenticatedFetch<{ message: string }>(
    `/admin/categories/${categoryId}/subcategories/${subId}`,
    { method: 'DELETE' },
  );
}
