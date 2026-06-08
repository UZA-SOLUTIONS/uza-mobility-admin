import { authenticatedFetch } from '@/lib/api/authenticated';
import type {
  PlatformSettings,
  UpdatePlatformSettingsInput,
} from '@/types/admin/platform-settings';

export function getAdminPlatformSettings() {
  return authenticatedFetch<PlatformSettings>('/admin/platform-settings');
}

export function updateAdminPlatformSettings(body: UpdatePlatformSettingsInput) {
  return authenticatedFetch<PlatformSettings>('/admin/platform-settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
