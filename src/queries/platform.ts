'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  createPricingRule,
  activateAdminUser,
  deactivateAdminUser,
  deactivatePricingRule,
  getAdminActivityLogs,
  getAdminPricingRules,
  getAdminUsers,
  updateAdminUserRoles,
  updatePricingRule,
} from '@/lib/api/platform';
import type { ActivityLogsFilters } from '@/types/admin/platform';
import type {
  AssignUserRolesInput,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
} from '@/schemas/platform';

export const platformKeys = {
  all: ['platform'] as const,
  users: () => [...platformKeys.all, 'users'] as const,
  activityLogs: (filters: ActivityLogsFilters) =>
    [...platformKeys.all, 'activity-logs', filters] as const,
  pricingRules: () => [...platformKeys.all, 'pricing-rules'] as const,
};

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiClientError ? error.message : fallback);
}

export function useAdminUsers() {
  return useQuery({
    queryKey: platformKeys.users(),
    queryFn: getAdminUsers,
  });
}

export function useUpdateAdminUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignUserRolesInput }) =>
      updateAdminUserRoles(id, body),
    onSuccess: () => {
      toast.success('Roles updated');
      void queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
    onError: (error) => toastError(error, 'Failed to update roles'),
  });
}

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateAdminUser(id),
    onSuccess: () => {
      toast.success('User deactivated');
      void queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
    onError: (error) => toastError(error, 'Failed to deactivate user'),
  });
}

export function useActivateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateAdminUser(id),
    onSuccess: () => {
      toast.success('User reactivated');
      void queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
    onError: (error) => toastError(error, 'Failed to reactivate user'),
  });
}

export function useAdminActivityLogs(filters: ActivityLogsFilters) {
  return useQuery({
    queryKey: platformKeys.activityLogs(filters),
    queryFn: () => getAdminActivityLogs(filters),
  });
}

export function useAdminPricingRules() {
  return useQuery({
    queryKey: platformKeys.pricingRules(),
    queryFn: getAdminPricingRules,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePricingRuleInput) => createPricingRule(body),
    onSuccess: () => {
      toast.success('Pricing rule created');
      void queryClient.invalidateQueries({
        queryKey: platformKeys.pricingRules(),
      });
    },
    onError: (error) => toastError(error, 'Failed to create pricing rule'),
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePricingRuleInput }) =>
      updatePricingRule(id, body),
    onSuccess: () => {
      toast.success('Pricing rule updated');
      void queryClient.invalidateQueries({
        queryKey: platformKeys.pricingRules(),
      });
    },
    onError: (error) => toastError(error, 'Failed to update pricing rule'),
  });
}

export function useDeactivatePricingRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivatePricingRule(id),
    onSuccess: () => {
      toast.success('Pricing rule deactivated');
      void queryClient.invalidateQueries({
        queryKey: platformKeys.pricingRules(),
      });
    },
    onError: (error) => toastError(error, 'Failed to deactivate pricing rule'),
  });
}
