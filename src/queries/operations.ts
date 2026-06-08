'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  attachPromotionListings,
  browseChargingProducts,
  createChargingProduct,
  createPromotion,
  activatePromotion,
  deactivatePromotion,
  detachPromotionListing,
  getAdminEnergyRequests,
  getAdminFleet,
  getAdminFleetRequest,
  getAdminPromotion,
  getAdminPromotions,
  getSustainabilityByBuyerType,
  getSustainabilityByCountry,
  getSustainabilityByVehicleType,
  getSustainabilityFleetReport,
  getSustainabilityOverview,
  updateChargingProduct,
  updateEnergyRequestStatus,
  updateFleetRequestStatus,
  updatePromotion,
} from '@/lib/api/operations';
import type {
  AdminEnergyRequestsFilters,
  AdminFleetFilters,
  SustainabilityFilters,
} from '@/types/admin/operations';
import type { PromotionApiPayload } from '@/lib/admin/promotion-config';
import type {
  AttachPromotionInput,
  CreateChargingProductInput,
  CreatePromotionInput,
  UpdateChargingProductInput,
  UpdateEnergyRequestStatusInput,
  UpdateFleetStatusInput,
} from '@/schemas/operations';

export const operationsKeys = {
  all: ['operations'] as const,
  fleet: (filters: AdminFleetFilters) =>
    [...operationsKeys.all, 'fleet', filters] as const,
  fleetRequest: (id: string) =>
    [...operationsKeys.all, 'fleet-request', id] as const,
  chargingProducts: () => [...operationsKeys.all, 'charging-products'] as const,
  energyRequests: (filters: AdminEnergyRequestsFilters) =>
    [...operationsKeys.all, 'energy-requests', filters] as const,
  promotions: () => [...operationsKeys.all, 'promotions'] as const,
  promotion: (id: string) => [...operationsKeys.all, 'promotion', id] as const,
  sustainability: (filters: SustainabilityFilters) =>
    [...operationsKeys.all, 'sustainability', filters] as const,
  sustainabilityBuyer: (filters: SustainabilityFilters) =>
    [...operationsKeys.all, 'sustainability-buyer', filters] as const,
  sustainabilityCountry: (filters: SustainabilityFilters) =>
    [...operationsKeys.all, 'sustainability-country', filters] as const,
  sustainabilityVehicle: (filters: SustainabilityFilters) =>
    [...operationsKeys.all, 'sustainability-vehicle', filters] as const,
  sustainabilityFleet: (client: string, filters: SustainabilityFilters) =>
    [...operationsKeys.all, 'sustainability-fleet', client, filters] as const,
};

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof ApiClientError ? error.message : fallback);
}

export function useAdminFleet(filters: AdminFleetFilters) {
  return useQuery({
    queryKey: operationsKeys.fleet(filters),
    queryFn: () => getAdminFleet(filters),
  });
}

export function useAdminFleetRequest(id: string | null) {
  return useQuery({
    queryKey: operationsKeys.fleetRequest(id ?? ''),
    queryFn: () => getAdminFleetRequest(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateFleetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFleetStatusInput }) =>
      updateFleetRequestStatus(id, body),
    onSuccess: (_, { id }) => {
      toast.success('Fleet request updated');
      void queryClient.invalidateQueries({ queryKey: operationsKeys.all });
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.fleetRequest(id),
      });
    },
    onError: (error) => toastError(error, 'Failed to update fleet request'),
  });
}

export function useChargingProducts() {
  return useQuery({
    queryKey: operationsKeys.chargingProducts(),
    queryFn: browseChargingProducts,
  });
}

export function useCreateChargingProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      photos,
    }: {
      body: CreateChargingProductInput;
      photos: File[];
    }) => createChargingProduct(body, photos),
    onSuccess: () => {
      toast.success('Charging product created');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.chargingProducts(),
      });
    },
    onError: (error) => toastError(error, 'Failed to create product'),
  });
}

export function useUpdateChargingProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
      photos,
    }: {
      id: string;
      body: UpdateChargingProductInput;
      photos: File[];
    }) => updateChargingProduct(id, body, photos),
    onSuccess: () => {
      toast.success('Charging product updated');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.chargingProducts(),
      });
    },
    onError: (error) => toastError(error, 'Failed to update product'),
  });
}

export function useAdminEnergyRequests(filters: AdminEnergyRequestsFilters) {
  return useQuery({
    queryKey: operationsKeys.energyRequests(filters),
    queryFn: () => getAdminEnergyRequests(filters),
  });
}

export function useUpdateEnergyRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateEnergyRequestStatusInput;
    }) => updateEnergyRequestStatus(id, body),
    onSuccess: () => {
      toast.success('Energy request updated');
      void queryClient.invalidateQueries({ queryKey: operationsKeys.all });
    },
    onError: (error) => toastError(error, 'Failed to update energy request'),
  });
}

export function useAdminPromotions() {
  return useQuery({
    queryKey: operationsKeys.promotions(),
    queryFn: getAdminPromotions,
  });
}

export function useAdminPromotion(id: string | null) {
  return useQuery({
    queryKey: operationsKeys.promotion(id ?? ''),
    queryFn: () => getAdminPromotion(id!),
    enabled: Boolean(id),
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      body,
      banner,
    }: {
      body: PromotionApiPayload;
      banner?: File;
    }) => createPromotion(body, banner),
    onSuccess: () => {
      toast.success('Promotion created');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
    },
    onError: (error) => toastError(error, 'Failed to create promotion'),
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
      banner,
    }: {
      id: string;
      body: Partial<PromotionApiPayload>;
      banner?: File;
    }) => updatePromotion(id, body, banner),
    onSuccess: () => {
      toast.success('Promotion updated');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
    },
    onError: (error) => toastError(error, 'Failed to update promotion'),
  });
}

export function useDeactivatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivatePromotion(id),
    onSuccess: (_, id) => {
      toast.success('Promotion deactivated');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotion(id),
      });
    },
    onError: (error) => toastError(error, 'Failed to deactivate promotion'),
  });
}

export function useActivatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activatePromotion(id),
    onSuccess: (detail) => {
      toast.success('Promotion reactivated');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
      void queryClient.setQueryData(
        operationsKeys.promotion(detail.id),
        detail,
      );
    },
    onError: (error) => toastError(error, 'Failed to reactivate promotion'),
  });
}

export function useAttachPromotionListings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AttachPromotionInput }) =>
      attachPromotionListings(id, body),
    onSuccess: (detail) => {
      toast.success('Listings attached');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
      void queryClient.setQueryData(
        operationsKeys.promotion(detail.id),
        detail,
      );
    },
    onError: (error) => toastError(error, 'Failed to attach listings'),
  });
}

export function useDetachPromotionListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      promotionId,
      listingId,
    }: {
      promotionId: string;
      listingId: string;
    }) => detachPromotionListing(promotionId, listingId),
    onSuccess: (_, { promotionId }) => {
      toast.success('Listing detached');
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotions(),
      });
      void queryClient.invalidateQueries({
        queryKey: operationsKeys.promotion(promotionId),
      });
    },
    onError: (error) => toastError(error, 'Failed to detach listing'),
  });
}

export function useSustainabilityOverview(filters: SustainabilityFilters) {
  return useQuery({
    queryKey: operationsKeys.sustainability(filters),
    queryFn: () => getSustainabilityOverview(filters),
  });
}

export function useSustainabilityByBuyerType(filters: SustainabilityFilters) {
  return useQuery({
    queryKey: operationsKeys.sustainabilityBuyer(filters),
    queryFn: () => getSustainabilityByBuyerType(filters),
  });
}

export function useSustainabilityByCountry(filters: SustainabilityFilters) {
  return useQuery({
    queryKey: operationsKeys.sustainabilityCountry(filters),
    queryFn: () => getSustainabilityByCountry(filters),
  });
}

export function useSustainabilityByVehicleType(filters: SustainabilityFilters) {
  return useQuery({
    queryKey: operationsKeys.sustainabilityVehicle(filters),
    queryFn: () => getSustainabilityByVehicleType(filters),
  });
}

export function useSustainabilityFleetReport(
  clientName: string | null,
  filters: SustainabilityFilters,
) {
  return useQuery({
    queryKey: operationsKeys.sustainabilityFleet(clientName ?? '', filters),
    queryFn: () => getSustainabilityFleetReport(clientName!, filters),
    enabled: Boolean(clientName?.trim()),
  });
}
