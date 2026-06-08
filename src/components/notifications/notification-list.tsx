'use client';

import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/admin/format';
import type { AppNotification } from '@/types/notifications';

type NotificationListProps = {
  items: AppNotification[];
  onItemClick?: (item: AppNotification) => void;
  emptyMessage?: string;
  /** Tighter rows for the header popover preview. */
  compact?: boolean;
};

export function NotificationList({
  items,
  onItemClick,
  emptyMessage = 'No notifications yet.',
  compact = false,
}: NotificationListProps) {
  if (items.length === 0) {
    return (
      <p
        className={cn(
          'text-center text-sm text-muted-foreground',
          compact ? 'px-4 py-8' : 'p-6',
        )}
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={cn(
              'w-full text-left transition-colors hover:bg-muted/50',
              compact ? 'px-3 py-2.5' : 'px-4 py-3',
              !item.isRead && 'bg-primary/5',
            )}
            onClick={() => onItemClick?.(item)}
          >
            <p className="text-sm leading-snug font-medium">{item.title}</p>
            <p
              className={cn(
                'mt-0.5 text-xs text-muted-foreground',
                compact ? 'line-clamp-1' : 'line-clamp-2',
              )}
            >
              {item.body}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {formatDateTime(item.createdAt)}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
