import type { OrderStatus, SellerType } from '@/types/admin/commerce';

export const ORDER_STAGES: Record<SellerType, OrderStatus[]> = {
  UZA_RWANDA_STOCK: [
    'PAYMENT_CONFIRMED',
    'VEHICLE_RESERVED',
    'READY_FOR_HANDOVER',
    'DELIVERED',
  ],
  LOCAL_SELLER: [
    'PAYMENT_CONFIRMED',
    'VEHICLE_RESERVED',
    'PROCESSING',
    'READY_FOR_HANDOVER',
    'DELIVERED',
  ],
  UZA_CHINA_SOURCING: [
    'PAYMENT_CONFIRMED',
    'VEHICLE_RESERVED',
    'PROCESSING',
    'IN_TRANSIT',
    'ARRIVED',
    'CLEARANCE',
    'READY_FOR_HANDOVER',
    'DELIVERED',
  ],
  INTERNATIONAL_SELLER: [
    'PAYMENT_CONFIRMED',
    'VEHICLE_RESERVED',
    'PROCESSING',
    'IN_TRANSIT',
    'ARRIVED',
    'CLEARANCE',
    'READY_FOR_HANDOVER',
    'DELIVERED',
  ],
};

export const ORDER_STAGE_LABELS: Record<OrderStatus, string> = {
  INVOICE_ISSUED: 'Invoice Issued',
  PAYMENT_SUBMITTED: 'Payment Submitted',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  VEHICLE_RESERVED: 'Vehicle Reserved',
  PROCESSING: 'Processing',
  IN_TRANSIT: 'In Transit',
  ARRIVED: 'Arrived',
  CLEARANCE: 'Customs Clearance',
  READY_FOR_HANDOVER: 'Ready for Handover',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function formatOrderStage(status: OrderStatus | string): string {
  return (
    ORDER_STAGE_LABELS[status as OrderStatus] ?? status.replaceAll('_', ' ')
  );
}

export function getNextOrderStatus(
  sellerType: SellerType | string,
  current: OrderStatus | string,
): OrderStatus | null {
  const stages = ORDER_STAGES[sellerType as SellerType];
  if (!stages) return null;
  const index = stages.indexOf(current as OrderStatus);
  if (index < 0 || index >= stages.length - 1) return null;
  return stages[index + 1] ?? null;
}

export function getOrderPipeline(
  sellerType: SellerType | string,
): OrderStatus[] {
  return ORDER_STAGES[sellerType as SellerType] ?? [];
}
