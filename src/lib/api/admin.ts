import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
  buildVerificationFormData,
} from '@/lib/api/multipart';
import { toSearchParams } from '@/lib/api/query-params';
import type { AdminDashboard } from '@/types/admin/dashboard';
import type {
  AdminListing,
  AdminListingsFilters,
  AdminPart,
  AdminPartsFilters,
  AdminSeller,
  AdminSellersFilters,
} from '@/types/admin/marketplace';
import type {
  AdminCreateListingInput,
  AdminUpdateListingInput,
  CreatePartInput,
  RejectListingInput,
  SuspendSellerInput,
  UpdatePartInput,
  UpdateVerificationInput,
} from '@/schemas/admin';
import type {
  AdminOperator,
  AdminOperatorFilters,
  AdminStation,
  AdminStationFilters,
  StationReviewActionInput,
} from '@/types/admin/stations';

export function getDashboard() {
  return authenticatedFetch<AdminDashboard>('/admin/dashboard');
}

type AdminListingFormFlattenKeys =
  | 'rangeKm'
  | 'batteryHealthPercent'
  | 'batteryCapacityKwh'
  | 'batteryHealthReport'
  | 'chargingType'
  | 'fastChargingSupported'
  | 'chargingTimeHours'
  | 'motorPowerKw'
  | 'topSpeedKmh'
  | 'payloadCapacityKg'
  | 'grossVehicleWeightKg'
  | 'seatingCapacity'
  | 'basePriceUsd'
  | 'fobPriceUsd'
  | 'discountUsd';

type AdminListingApiExtras = {
  isNew: boolean;
  pricing: {
    basePriceUsd?: number;
    fobPriceUsd?: number;
    discountUsd?: number;
  };
  evSpecs: {
    rangeKm: number;
    chargingType: string;
    batteryHealthPercent?: number;
    batteryCapacityKwh?: number;
    batteryHealthReport?: boolean;
    fastChargingSupported?: boolean;
    chargingTimeHours?: number;
    motorPowerKw?: number;
    topSpeedKmh?: number;
    payloadCapacityKg?: number;
    grossVehicleWeightKg?: number;
    seatingCapacity?: number;
  };
};

export type AdminCreateListingBody = Omit<
  AdminCreateListingInput,
  AdminListingFormFlattenKeys
> &
  AdminListingApiExtras;

export type AdminUpdateListingBody = Omit<
  AdminUpdateListingInput,
  AdminListingFormFlattenKeys
> &
  AdminListingApiExtras;

function buildAdminListingApiBody(
  input: AdminCreateListingInput | AdminUpdateListingInput,
) {
  const {
    basePriceUsd,
    fobPriceUsd,
    discountUsd,
    subcategoryId,
    description,
    trim,
    mileageKm,
    rangeKm,
    batteryHealthPercent,
    batteryCapacityKwh,
    batteryHealthReport,
    chargingType,
    fastChargingSupported,
    chargingTimeHours,
    motorPowerKw,
    topSpeedKmh,
    payloadCapacityKg,
    grossVehicleWeightKg,
    seatingCapacity,
    useCases,
    ...rest
  } = input;

  const evSpecs = {
    rangeKm: rangeKm!,
    chargingType: chargingType!,
    batteryHealthPercent:
      input.condition === 'NEW' ? undefined : batteryHealthPercent,
    ...(batteryCapacityKwh != null ? { batteryCapacityKwh } : {}),
    ...(batteryHealthReport != null ? { batteryHealthReport } : {}),
    ...(fastChargingSupported != null ? { fastChargingSupported } : {}),
    ...(chargingTimeHours != null ? { chargingTimeHours } : {}),
    ...(motorPowerKw != null ? { motorPowerKw } : {}),
    ...(topSpeedKmh != null ? { topSpeedKmh } : {}),
    ...(payloadCapacityKg != null ? { payloadCapacityKg } : {}),
    ...(grossVehicleWeightKg != null ? { grossVehicleWeightKg } : {}),
    ...(seatingCapacity != null ? { seatingCapacity } : {}),
  };

  return {
    ...rest,
    isNew: input.condition === 'NEW',
    subcategoryId: subcategoryId?.trim() || undefined,
    description: description?.trim() || undefined,
    trim: trim?.trim() || undefined,
    mileageKm,
    useCases: useCases?.length ? useCases : undefined,
    evSpecs,
    pricing: {
      basePriceUsd:
        input.sellerType === 'UZA_RWANDA_STOCK' ? basePriceUsd : undefined,
      fobPriceUsd:
        input.sellerType === 'UZA_CHINA_SOURCING' ? fobPriceUsd : undefined,
      discountUsd:
        discountUsd != null && discountUsd > 0 ? discountUsd : undefined,
    },
  };
}

export function toAdminCreateListingBody(
  input: AdminCreateListingInput,
): AdminCreateListingBody {
  return buildAdminListingApiBody(input) as AdminCreateListingBody;
}

export function toAdminUpdateListingBody(
  input: AdminUpdateListingInput,
): AdminUpdateListingBody {
  return buildAdminListingApiBody(input) as AdminUpdateListingBody;
}

export function createAdminListing(
  body: AdminCreateListingBody,
  photos: File[] = [],
  video?: File | null,
) {
  const fileEntries = [{ field: 'photos', files: photos }];
  if (video) {
    fileEntries.push({ field: 'video', files: [video] });
  }
  const form = buildMultipartFormData(body, fileEntries);
  return authenticatedMultipartFetch<AdminListing>('/admin/listings', form);
}

export function updateAdminListing(
  id: string,
  body: AdminUpdateListingBody,
  photos: File[] = [],
  video?: File | null,
) {
  const fileEntries = [{ field: 'photos', files: photos }];
  if (video) {
    fileEntries.push({ field: 'video', files: [video] });
  }
  const form = buildMultipartFormData(body, fileEntries);
  return authenticatedMultipartFetch<AdminListing>(
    `/admin/listings/${id}`,
    form,
    {
      method: 'PATCH',
    },
  );
}

export function getAdminListings(filters: AdminListingsFilters = {}) {
  return authenticatedPaginatedFetch<AdminListing>('/admin/listings', {
    searchParams: toSearchParams(filters),
  });
}

export function approveListing(id: string) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/approve`, {
    method: 'PATCH',
  });
}

export function publishListing(id: string) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/publish`, {
    method: 'PATCH',
  });
}

export function unpublishListing(id: string) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/unpublish`, {
    method: 'PATCH',
  });
}

export function rejectListing(id: string, body: RejectListingInput) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function featureListing(id: string) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/feature`, {
    method: 'PATCH',
  });
}

export function hotDealListing(id: string) {
  return authenticatedFetch<AdminListing>(`/admin/listings/${id}/hot-deal`, {
    method: 'PATCH',
  });
}

export function deleteListing(id: string) {
  return authenticatedFetch<{ message: string }>(`/admin/listings/${id}`, {
    method: 'DELETE',
  });
}

export function updateListingVerification(
  id: string,
  body: UpdateVerificationInput,
  files?: { report?: File; batteryReport?: File },
) {
  const form = buildVerificationFormData(body, files);
  return authenticatedMultipartFetch<AdminListing>(
    `/admin/listings/${id}/verification`,
    form,
    { method: 'PATCH' },
  );
}

export function getAdminSellers(filters: AdminSellersFilters = {}) {
  const params = toSearchParams({
    ...filters,
    isVerified:
      filters.isVerified === undefined ? undefined : String(filters.isVerified),
  });

  return authenticatedPaginatedFetch<AdminSeller>('/admin/sellers', {
    searchParams: params,
  });
}

export function getAdminSeller(id: string) {
  return authenticatedFetch<AdminSeller>(`/admin/sellers/${id}`);
}

export function verifySeller(id: string) {
  return authenticatedFetch<AdminSeller>(`/admin/sellers/${id}/verify`, {
    method: 'PATCH',
  });
}

export function suspendSeller(id: string, body: SuspendSellerInput = {}) {
  return authenticatedFetch<AdminSeller>(`/admin/sellers/${id}/suspend`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function reactivateSeller(id: string) {
  return authenticatedFetch<AdminSeller>(`/admin/sellers/${id}/reactivate`, {
    method: 'PATCH',
  });
}

export function getAdminParts(filters: AdminPartsFilters = {}) {
  return authenticatedPaginatedFetch<AdminPart>('/admin/parts', {
    searchParams: toSearchParams(filters),
  });
}

export function getAdminPart(id: string) {
  return authenticatedFetch<AdminPart>(`/admin/parts/${id}`);
}

export function createPart(body: CreatePartInput, photos: File[] = []) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<AdminPart>('/admin/parts', form);
}

export function updatePart(
  id: string,
  body: UpdatePartInput,
  photos: File[] = [],
) {
  const form = buildMultipartFormData(body, [
    { field: 'photos', files: photos },
  ]);
  return authenticatedMultipartFetch<AdminPart>(`/admin/parts/${id}`, form, {
    method: 'PATCH',
  });
}

export function deletePart(id: string) {
  return authenticatedFetch<{ message: string }>(`/admin/parts/${id}`, {
    method: 'DELETE',
  });
}

export function activatePart(id: string) {
  return authenticatedFetch<AdminPart>(`/admin/parts/${id}/activate`, {
    method: 'PATCH',
  });
}

export function deactivatePart(id: string) {
  return authenticatedFetch<AdminPart>(`/admin/parts/${id}/deactivate`, {
    method: 'PATCH',
  });
}

export function approvePart(id: string) {
  return authenticatedFetch<AdminPart>(`/admin/parts/${id}/approve`, {
    method: 'PATCH',
  });
}

export function rejectPart(id: string, body: { reason: string }) {
  return authenticatedFetch<AdminPart>(`/admin/parts/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function getAdminOperators(filters: AdminOperatorFilters = {}) {
  return authenticatedPaginatedFetch<AdminOperator>(
    '/admin/charging-stations/operators',
    {
      searchParams: toSearchParams(filters),
    },
  );
}

export function approveAdminOperator(id: string) {
  return authenticatedFetch<AdminOperator>(
    `/admin/charging-stations/operators/${id}/approve`,
    {
      method: 'PATCH',
    },
  );
}

export function rejectAdminOperator(
  id: string,
  body: StationReviewActionInput = {},
) {
  return authenticatedFetch<AdminOperator>(
    `/admin/charging-stations/operators/${id}/reject`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function getAdminStations(filters: AdminStationFilters = {}) {
  return authenticatedPaginatedFetch<AdminStation>(
    '/admin/charging-stations/stations',
    {
      searchParams: toSearchParams(filters),
    },
  );
}

export function approveAdminStation(id: string) {
  return authenticatedFetch<AdminStation>(
    `/admin/charging-stations/stations/${id}/approve`,
    {
      method: 'PATCH',
    },
  );
}

export function rejectAdminStation(
  id: string,
  body: StationReviewActionInput = {},
) {
  return authenticatedFetch<AdminStation>(
    `/admin/charging-stations/stations/${id}/reject`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function suspendAdminStation(
  id: string,
  body: StationReviewActionInput = {},
) {
  return authenticatedFetch<AdminStation>(
    `/admin/charging-stations/stations/${id}/suspend`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}
