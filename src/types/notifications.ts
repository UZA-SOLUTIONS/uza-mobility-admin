export const notificationTypes = [
  'INVOICE_ISSUED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_REJECTED',
  'ORDER_STATUS_UPDATED',
  'LISTING_APPROVED',
  'LISTING_REJECTED',
  'FINANCING_UPDATE',
  'FLEET_REQUEST_UPDATE',
  'SYSTEM_ALERT',
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type NotificationsFilters = {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
};
