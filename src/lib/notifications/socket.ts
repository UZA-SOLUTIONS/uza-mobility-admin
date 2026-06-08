import { siteConfig } from '@/config/site';

/** Must match backend `NOTIFICATION_SOCKET_EVENT`. */
export const NOTIFICATION_SOCKET_EVENT = 'notification';

export function getNotificationsSocketUrl() {
  return `${siteConfig.apiUrl}/notifications`;
}
