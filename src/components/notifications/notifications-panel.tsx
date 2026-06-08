'use client';

import { useState } from 'react';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { NotificationList } from '@/components/notifications/notification-list';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { NOTIFICATIONS_PAGE_SIZE } from '@/lib/notifications/constants';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/queries/notifications';

export function NotificationsPanel() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const unread = useUnreadNotificationCount();
  const list = useNotifications({
    page,
    limit: NOTIFICATIONS_PAGE_SIZE,
    unreadOnly,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unread.data?.unreadCount ?? 0;
  const items = list.data?.items ?? [];
  const busy = markRead.isPending || markAllRead.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Notifications"
          description={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : 'All caught up — no unread notifications.'
          }
        />
        {unreadCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            disabled={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all as read
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
        <Switch
          id="notifications-unread-only"
          checked={unreadOnly}
          onCheckedChange={(checked) => {
            setUnreadOnly(checked);
            setPage(1);
          }}
        />
        <Label htmlFor="notifications-unread-only" className="cursor-pointer">
          Show unread only
        </Label>
      </div>

      <div className="rounded-lg border">
        {list.isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : null}

        {list.isError ? (
          <p className="p-4 text-sm text-destructive">
            Could not load notifications.
          </p>
        ) : null}

        {!list.isLoading && !list.isError ? (
          <NotificationList
            items={items}
            emptyMessage={
              unreadOnly ? 'No unread notifications.' : 'No notifications yet.'
            }
            onItemClick={(item) => {
              if (!item.isRead && !busy) {
                markRead.mutate(item.id);
              }
            }}
          />
        ) : null}

        {list.data?.meta && list.data.meta.total > 0 ? (
          <div className="px-4 pb-4">
            <PaginationBar meta={list.data.meta} onPageChange={setPage} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
