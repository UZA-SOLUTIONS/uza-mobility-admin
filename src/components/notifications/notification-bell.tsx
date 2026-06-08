'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { NotificationList } from '@/components/notifications/notification-list';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { NOTIFICATION_PREVIEW_LIMIT } from '@/lib/notifications/constants';
import { notificationsHrefFromPathname } from '@/lib/notifications/paths';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/queries/notifications';
import { cn } from '@/lib/utils';

type NotificationBellProps = {
  /** Override when not inside a workspace (e.g. marketing navbar). */
  viewAllHref?: string;
  triggerClassName?: string;
  badgeClassName?: string;
};

export function NotificationBell({
  viewAllHref,
  triggerClassName,
  badgeClassName,
}: NotificationBellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [open, setOpen] = useState(false);
  const allNotificationsHref =
    viewAllHref ?? notificationsHrefFromPathname(pathname);
  const unread = useUnreadNotificationCount();
  const list = useNotifications(
    { page: 1, limit: NOTIFICATION_PREVIEW_LIMIT },
    open,
  );
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = unread.data?.unreadCount ?? 0;
  const items = useMemo(() => {
    const rows = list.data?.items ?? [];
    if (!currentUserId) return rows;
    return rows.filter((item) => item.userId === currentUserId);
  }, [list.data?.items, currentUserId]);

  const hasMore =
    (list.data?.meta.total ?? 0) > NOTIFICATION_PREVIEW_LIMIT ||
    unreadCount > items.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('relative', triggerClassName)}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground',
                badgeClassName,
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex w-[min(calc(100vw-1.5rem),22rem)] flex-col gap-0 overflow-hidden p-0 sm:w-96"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          ) : null}
        </div>

        <div className="max-h-[min(14rem,40vh)] min-h-0 overflow-y-auto overscroll-y-contain">
          {list.isLoading ? (
            <div className="space-y-2 p-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {list.isError ? (
            <p className="px-3 py-4 text-sm text-destructive">
              Could not load notifications.
            </p>
          ) : null}

          {!list.isLoading && !list.isError ? (
            <NotificationList
              compact
              items={items}
              onItemClick={(item) => {
                if (!item.isRead) {
                  markRead.mutate(item.id);
                }
              }}
            />
          ) : null}
        </div>

        <div className="shrink-0 border-t bg-popover p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
            onClick={() => setOpen(false)}
          >
            <Link href={allNotificationsHref}>
              {hasMore ? 'View all notifications' : 'Open notifications'}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
