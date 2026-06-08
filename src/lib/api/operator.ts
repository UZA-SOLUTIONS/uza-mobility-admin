'use client';

import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import { authenticatedMultipartFetch } from '@/lib/api/multipart';
import { toSearchParams } from '@/lib/api/query-params';
import type {
  AddCompatibilityInput,
  CreatePortInput,
  CreateStationInput,
  OperatorApplyInput,
  OperatorUpdateProfileInput,
  SetPricingInput,
  UpdateStationInput,
} from '@/schemas/operator';
import type {
  ChargingStation,
  ChargingStationFilters,
  ChargingStationPage,
  OperatorProfile,
  StationPhoto,
} from '@/types/operator/stations';

const OPERATOR_BASE = '/charging-stations/operators';
const STATIONS_BASE = '/charging-stations/stations';

export function applyOperatorProfile(body: OperatorApplyInput, token?: string) {
  return authenticatedFetch<OperatorProfile>(`${OPERATOR_BASE}/apply`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function getMyOperatorProfile(token?: string) {
  return authenticatedFetch<OperatorProfile>(`${OPERATOR_BASE}/me`, { token });
}

export function updateMyOperatorProfile(
  body: OperatorUpdateProfileInput,
  token?: string,
) {
  return authenticatedFetch<OperatorProfile>(`${OPERATOR_BASE}/me`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export function getMyChargingStations(
  filters: ChargingStationFilters = {},
  token?: string,
) {
  const searchParams = toSearchParams({
    q: filters.q,
    status: filters.status,
    page: filters.page,
    limit: filters.limit,
  });
  return authenticatedPaginatedFetch<ChargingStation>(`${STATIONS_BASE}/my`, {
    searchParams,
    token,
  }) as Promise<ChargingStationPage>;
}

export function createMyStation(body: CreateStationInput, token?: string) {
  return authenticatedFetch<ChargingStation>(STATIONS_BASE, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function updateMyStation(
  stationId: string,
  body: UpdateStationInput,
  token?: string,
) {
  return authenticatedFetch<ChargingStation>(`${STATIONS_BASE}/${stationId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export function submitMyStation(stationId: string, token?: string) {
  return authenticatedFetch<ChargingStation>(
    `${STATIONS_BASE}/${stationId}/submit`,
    {
      method: 'POST',
      token,
    },
  );
}

export function createMyStationPort(body: CreatePortInput, token?: string) {
  const { stationId, ...payload } = body;
  return authenticatedFetch<ChargingStation>(
    `${STATIONS_BASE}/${stationId}/ports`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}

export function setMyStationPricing(body: SetPricingInput, token?: string) {
  const { stationId, ...payload } = body;
  return authenticatedFetch<ChargingStation>(
    `${STATIONS_BASE}/${stationId}/pricing`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}

export function addMyStationCompatibility(
  body: AddCompatibilityInput,
  token?: string,
) {
  const { stationId, ...payload } = body;
  return authenticatedFetch<ChargingStation>(
    `${STATIONS_BASE}/${stationId}/compatibility`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}

export async function uploadMyStationPhotos(
  stationId: string,
  files: File[],
  token?: string,
) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }
  return authenticatedMultipartFetch<StationPhoto[]>(
    `${STATIONS_BASE}/${stationId}/photos`,
    formData,
    { method: 'POST', token },
  );
}
