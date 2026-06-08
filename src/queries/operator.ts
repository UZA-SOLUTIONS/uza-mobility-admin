'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import { fetchMeUser } from '@/lib/auth/sync-me';
import {
  addMyStationCompatibility,
  applyOperatorProfile,
  createMyStation,
  createMyStationPort,
  getMyChargingStations,
  getMyOperatorProfile,
  setMyStationPricing,
  submitMyStation,
  updateMyOperatorProfile,
  updateMyStation,
  uploadMyStationPhotos,
} from '@/lib/api/operator';
import type {
  AddCompatibilityInput,
  CreatePortInput,
  CreateStationInput,
  OperatorApplyInput,
  OperatorUpdateProfileInput,
  SetPricingInput,
  UpdateStationInput,
} from '@/schemas/operator';
import type { ChargingStationFilters } from '@/types/operator/stations';

export const operatorKeys = {
  all: ['operator'] as const,
  profile: () => [...operatorKeys.all, 'profile'] as const,
  stations: (filters?: ChargingStationFilters) =>
    [...operatorKeys.all, 'stations', filters ?? {}] as const,
};

function useOperatorAuth() {
  const { data, status } = useSession();
  return {
    token: data?.accessToken,
    ready: status === 'authenticated' && Boolean(data?.accessToken),
  };
}

function mutationError(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : 'Something went wrong. Please try again.';
}

export function useMyOperatorProfile() {
  const { token, ready } = useOperatorAuth();
  return useQuery({
    queryKey: operatorKeys.profile(),
    queryFn: async () => {
      try {
        return await getMyOperatorProfile(token);
      } catch (error) {
        if (error instanceof ApiClientError && error.statusCode === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: ready,
    retry: false,
  });
}

export function useMyChargingStations(
  filters: ChargingStationFilters = {},
  options?: { enabled?: boolean },
) {
  const { token, ready } = useOperatorAuth();
  return useQuery({
    queryKey: operatorKeys.stations(filters),
    queryFn: () => getMyChargingStations(filters, token),
    enabled: ready && (options?.enabled ?? true),
  });
}

export function useApplyOperatorProfile() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  const { update } = useSession();
  return useMutation({
    mutationFn: (body: OperatorApplyInput) => applyOperatorProfile(body, token),
    onSuccess: async () => {
      toast.success('Operator application submitted');
      if (token) {
        const me = await fetchMeUser(token);
        await update({ user: me });
      }
      void queryClient.invalidateQueries({ queryKey: operatorKeys.profile() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateMyOperatorProfile() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  const { update } = useSession();
  return useMutation({
    mutationFn: (body: OperatorUpdateProfileInput) =>
      updateMyOperatorProfile(body, token),
    onSuccess: async () => {
      toast.success('Operator profile updated');
      if (token) {
        const me = await fetchMeUser(token);
        await update({ user: me });
      }
      void queryClient.invalidateQueries({ queryKey: operatorKeys.profile() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: (body: CreateStationInput) => createMyStation(body, token),
    onSuccess: () => {
      toast.success('Station draft created');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUpdateStation() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStationInput }) =>
      updateMyStation(id, body, token),
    onSuccess: () => {
      toast.success('Station updated');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useSubmitStation() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: (stationId: string) => submitMyStation(stationId, token),
    onSuccess: () => {
      toast.success('Station sent for review');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useCreateStationPort() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: (body: CreatePortInput) => createMyStationPort(body, token),
    onSuccess: () => {
      toast.success('Port added');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useSetStationPricing() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: (body: SetPricingInput) => setMyStationPricing(body, token),
    onSuccess: () => {
      toast.success('Pricing updated');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAddStationCompatibility() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: (body: AddCompatibilityInput) =>
      addMyStationCompatibility(body, token),
    onSuccess: () => {
      toast.success('Compatibility saved');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useUploadStationPhotos() {
  const queryClient = useQueryClient();
  const { token } = useOperatorAuth();
  return useMutation({
    mutationFn: ({ stationId, files }: { stationId: string; files: File[] }) =>
      uploadMyStationPhotos(stationId, files, token),
    onSuccess: () => {
      toast.success('Photos uploaded');
      void queryClient.invalidateQueries({ queryKey: operatorKeys.stations() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}
