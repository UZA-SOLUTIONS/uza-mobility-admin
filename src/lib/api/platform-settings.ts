import { apiFetch } from '@/lib/api/api';
import { authenticatedFetch } from '@/lib/api/authenticated';
import type {
  ExchangeRateSnapshot,
  PlatformSettings,
  UpdatePlatformSettingsInput,
} from '@/types/admin/platform-settings';

export function getExchangeRate() {
  return apiFetch<ExchangeRateSnapshot>('/exchange-rate');
}

export function getAdminPlatformSettings() {
  return authenticatedFetch<PlatformSettings>('/admin/platform-settings');
}

export function updateAdminPlatformSettings(body: UpdatePlatformSettingsInput) {
  return authenticatedFetch<PlatformSettings>('/admin/platform-settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
