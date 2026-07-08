import type { PaginationMeta } from '@/types/api/pagination';

export type DiscountSalesFilters = {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type DiscountSaleRow = {
  invoiceId: string;
  invoiceNumber: string;
  soldAt: string | null;
  buyerName: string;
  buyerEmail: string | null;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  sellerType: string | null;
  listPriceUsd: number;
  ruleDiscountUsd: number;
  listingDiscountUsd: number;
  totalDiscountUsd: number;
  amountPaidUsd: number;
};

export type DiscountSalesSummary = {
  saleCount: number;
  totalRuleDiscountUsd: number;
  totalListingDiscountUsd: number;
  totalDiscountUsd: number;
  totalRevenueUsd: number;
};

export type DiscountSalesMeta = PaginationMeta & {
  summary: DiscountSalesSummary;
};

export type DiscountSalesResult = {
  items: DiscountSaleRow[];
  meta: DiscountSalesMeta;
};
