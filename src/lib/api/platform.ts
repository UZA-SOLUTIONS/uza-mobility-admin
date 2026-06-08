import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import { toSearchParams } from '@/lib/api/query-params';
import type {
  ActivityLog,
  ActivityLogsFilters,
  AdminUser,
  PricingRule,
} from '@/types/admin/platform';
import type {
  AssignUserRolesInput,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
} from '@/schemas/platform';

export function getAdminUsers() {
  return authenticatedFetch<AdminUser[]>('/admin/users');
}

export function updateAdminUserRoles(id: string, body: AssignUserRolesInput) {
  return authenticatedFetch<AdminUser>(`/admin/users/${id}/roles`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deactivateAdminUser(id: string) {
  return authenticatedFetch<AdminUser>(`/admin/users/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export function activateAdminUser(id: string) {
  return authenticatedFetch<AdminUser>(`/admin/users/${id}/activate`, {
    method: 'PATCH',
  });
}

export function getAdminActivityLogs(filters: ActivityLogsFilters = {}) {
  return authenticatedPaginatedFetch<ActivityLog>('/admin/activity-logs', {
    searchParams: toSearchParams(filters),
  });
}

export function getAdminPricingRules() {
  return authenticatedFetch<PricingRule[]>('/admin/pricing-rules');
}

export function createPricingRule(body: CreatePricingRuleInput) {
  return authenticatedFetch<PricingRule>('/admin/pricing-rules', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePricingRule(id: string, body: UpdatePricingRuleInput) {
  return authenticatedFetch<PricingRule>(`/admin/pricing-rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deactivatePricingRule(id: string) {
  return authenticatedFetch<PricingRule>(`/admin/pricing-rules/${id}`, {
    method: 'DELETE',
  });
}
