import { apiFetch } from '@/lib/api/api';
import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
} from '@/lib/api/multipart';
import { toSearchParams } from '@/lib/api/query-params';
import type {
  AdminEnergyRequestsFilters,
  AdminFleetFilters,
  AdminPromotion,
  AdminPromotionDetail,
  ChargingProduct,
  EnergyRequest,
  FleetRequest,
  FleetRequestDetail,
  SustainabilityBreakdownRow,
  SustainabilityFilters,
  SustainabilityOverview,
} from '@/types/admin/operations';
import type { PromotionApiPayload } from '@/lib/admin/promotion-config';
import type {
  AttachPromotionInput,
  CreateChargingProductInput,
  UpdateChargingProductInput,
  UpdateEnergyRequestStatusInput,
  UpdateFleetStatusInput,
} from '@/schemas/operations';
export function getAdminFleet(filters: AdminFleetFilters = {}) {
  return authenticatedPaginatedFetch<FleetRequest>('/admin/fleet', {
    searchParams: toSearchParams(filters),
  });
}

export function getAdminFleetRequest(id: string) {
  return authenticatedFetch<FleetRequestDetail>(`/admin/fleet/${id}`);
}

export function updateFleetRequestStatus(
  id: string,
  body: UpdateFleetStatusInput,
) {
  return authenticatedFetch<FleetRequest>(`/admin/fleet/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function browseChargingProducts() {
  return apiFetch<ChargingProduct[]>('/energy/products');
}

export function createChargingProduct(
  body: CreateChargingProductInput,
  photos: File[],
) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<ChargingProduct>(
    '/admin/energy/products',
    form,
  );
}

export function updateChargingProduct(
  id: string,
  body: UpdateChargingProductInput,
  photos: File[],
) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<ChargingProduct>(
    `/admin/energy/products/${id}`,
    form,
    { method: 'PATCH' },
  );
}

export function getAdminEnergyRequests(
  filters: AdminEnergyRequestsFilters = {},
) {
  return authenticatedPaginatedFetch<EnergyRequest>('/admin/energy/requests', {
    searchParams: toSearchParams(filters),
  });
}

export function updateEnergyRequestStatus(
  id: string,
  body: UpdateEnergyRequestStatusInput,
) {
  return authenticatedFetch<EnergyRequest>(
    `/admin/energy/requests/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function getAdminPromotions() {
  return authenticatedFetch<AdminPromotion[]>('/admin/promotions');
}

export function getAdminPromotion(id: string) {
  return authenticatedFetch<AdminPromotionDetail>(`/admin/promotions/${id}`);
}

export function createPromotion(body: PromotionApiPayload, banner?: File) {
  const form = buildMultipartFormData(
    body,
    banner ? [{ field: 'banner', files: [banner] }] : undefined,
  );
  return authenticatedMultipartFetch<AdminPromotion>('/admin/promotions', form);
}

export function updatePromotion(
  id: string,
  body: Partial<PromotionApiPayload>,
  banner?: File,
) {
  const form = buildMultipartFormData(
    body,
    banner ? [{ field: 'banner', files: [banner] }] : undefined,
  );
  return authenticatedMultipartFetch<AdminPromotion>(
    `/admin/promotions/${id}`,
    form,
    { method: 'PATCH' },
  );
}

export function deactivatePromotion(id: string) {
  return authenticatedFetch<AdminPromotion>(`/admin/promotions/${id}`, {
    method: 'DELETE',
  });
}

export function activatePromotion(id: string) {
  return authenticatedFetch<AdminPromotionDetail>(
    `/admin/promotions/${id}/activate`,
    { method: 'PATCH' },
  );
}

export function attachPromotionListings(
  id: string,
  body: AttachPromotionInput,
) {
  return authenticatedFetch<AdminPromotionDetail>(
    `/admin/promotions/${id}/listings`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export function detachPromotionListing(promotionId: string, listingId: string) {
  return authenticatedFetch<{ promotionId: string; listingId: string }>(
    `/admin/promotions/${promotionId}/listings/${listingId}`,
    { method: 'DELETE' },
  );
}

export function getSustainabilityOverview(filters: SustainabilityFilters = {}) {
  return authenticatedFetch<SustainabilityOverview>('/admin/sustainability', {
    searchParams: toSearchParams(filters),
  });
}

export function getSustainabilityByBuyerType(
  filters: SustainabilityFilters = {},
) {
  return authenticatedFetch<SustainabilityBreakdownRow[]>(
    '/admin/sustainability/by-buyer-type',
    { searchParams: toSearchParams(filters) },
  );
}

export function getSustainabilityByCountry(
  filters: SustainabilityFilters = {},
) {
  return authenticatedFetch<SustainabilityBreakdownRow[]>(
    '/admin/sustainability/by-country',
    { searchParams: toSearchParams(filters) },
  );
}

export function getSustainabilityByVehicleType(
  filters: SustainabilityFilters = {},
) {
  return authenticatedFetch<SustainabilityBreakdownRow[]>(
    '/admin/sustainability/by-vehicle-type',
    { searchParams: toSearchParams(filters) },
  );
}

export function getSustainabilityFleetReport(
  clientName: string,
  filters: SustainabilityFilters = {},
) {
  const encoded = encodeURIComponent(clientName);
  return authenticatedFetch<SustainabilityOverview>(
    `/admin/sustainability/fleet/${encoded}`,
    { searchParams: toSearchParams(filters) },
  );
}
