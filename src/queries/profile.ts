'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { refreshSession } from '@/lib/auth/session-update';
import {
  updateBuyerProfile,
  updateProfile,
  updateSellerProfile,
} from '@/lib/api/profile';
import { ApiClientError } from '@/lib/api';
import { authKeys } from '@/queries/auth';
import type {
  UpdateBuyerProfileInput,
  UpdateProfileInput,
  UpdateSellerProfileInput,
} from '@/schemas/profile';

function mutationError(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : 'Something went wrong. Please try again.';
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, photo }: { body: UpdateProfileInput; photo?: File }) =>
      updateProfile(body, photo),
    onSuccess: async (updated) => {
      toast.success('Profile updated');
      void queryClient.setQueryData(authKeys.me(), updated);
      try {
        await refreshSession();
      } catch {
        // Session refresh optional if provider not mounted yet
      }
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateBuyerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateBuyerProfileInput) => updateBuyerProfile(body),
    onSuccess: () => {
      toast.success('Buyer profile updated');
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateSellerProfileInput) => updateSellerProfile(body),
    onSuccess: () => {
      toast.success('Seller profile updated');
      void queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}
