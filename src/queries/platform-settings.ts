'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  getAdminPlatformSettings,
  updateAdminPlatformSettings,
} from '@/lib/api/platform-settings';
import { bookingKeys } from '@/queries/bookings';
import type { UpdatePlatformSettingsInput } from '@/types/admin/platform-settings';

export const platformSettingsKeys = {
  all: ['platform-settings'] as const,
  admin: () => [...platformSettingsKeys.all, 'admin'] as const,
};

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiClientError ? error.message : fallback);
}

export function useAdminPlatformSettings(enabled = true) {
  return useQuery({
    queryKey: platformSettingsKeys.admin(),
    queryFn: getAdminPlatformSettings,
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePlatformSettingsInput) =>
      updateAdminPlatformSettings(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformSettingsKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success('Platform settings updated');
    },
    onError: (error) => toastError(error, 'Unable to update platform settings'),
  });
}
