export type {
  AdminOrder as BuyerOrder,
  AdminInvoice as BuyerInvoice,
  AdminPayment as BuyerPayment,
  AdminFinancingRequest as BuyerFinancingRequest,
  OrderTrackingEvent as BuyerOrderTrackingEvent,
  InvoiceStatus as BuyerInvoiceStatus,
  OrderStatus as BuyerOrderStatus,
  PaymentStatus as BuyerPaymentStatus,
  FinancingStatus as BuyerFinancingStatus,
} from '@/types/admin/commerce';

export type BuyerOrdersFilters = {
  status?: import('@/types/admin/commerce').OrderStatus;
  page?: number;
  limit?: number;
};

export type BuyerInvoicesFilters = {
  status?: import('@/types/admin/commerce').InvoiceStatus;
  pendingPurchase?: boolean;
  payableOnly?: boolean;
  listingId?: string;
  page?: number;
  limit?: number;
};

export type BuyerPaymentsFilters = {
  status?: import('@/types/admin/commerce').PaymentStatus;
  page?: number;
  limit?: number;
};

export type BuyerOrderTracking = {
  order: {
    id: string;
    orderNumber: string;
    status: import('@/types/admin/commerce').OrderStatus;
    sellerType: string;
    stages: import('@/types/admin/commerce').OrderStatus[];
  };
  events: import('@/types/admin/commerce').OrderTrackingEvent[];
};

export type PublicListingSummary = {
  id: string;
  listingTitle: string;
  slug: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  status: string;
  listingPricing?: {
    finalPriceUsd: number;
    currency: string;
  } | null;
};
