import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import { toSearchParams } from '@/lib/api/query-params';
import type {
  AppNotification,
  NotificationsFilters,
} from '@/types/notifications';

export function getNotifications(
  filters: NotificationsFilters = {},
  accessToken?: string,
) {
  return authenticatedPaginatedFetch<AppNotification>('/notifications', {
    searchParams: toSearchParams({
      ...filters,
      unreadOnly: filters.unreadOnly ? 'true' : undefined,
    }),
    token: accessToken,
  });
}

export function getUnreadNotificationCount(accessToken?: string) {
  return authenticatedFetch<{ unreadCount: number }>(
    '/notifications/unread-count',
    { token: accessToken },
  );
}

export function markNotificationRead(id: string, accessToken?: string) {
  return authenticatedFetch<AppNotification>(`/notifications/${id}/read`, {
    method: 'PATCH',
    token: accessToken,
  });
}

export function markAllNotificationsRead(accessToken?: string) {
  return authenticatedFetch<{ markedCount: number }>(
    '/notifications/read-all',
    { method: 'PATCH', token: accessToken },
  );
}
