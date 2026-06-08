export const assignableRoleNames = [
  'SUPER_ADMIN',
  'MARKETPLACE_ADMIN',
  'FINANCE_ADMIN',
  'LOGISTICS_ADMIN',
  'FLEET_ADMIN',
  'SUSTAINABILITY_ADMIN',
  'ADVERTISING_ADMIN',
  'SALES_AGENT',
  'SELLER',
  'BUYER',
] as const;

export type AssignableRoleName = (typeof assignableRoleNames)[number];

export type AdminUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  deletedAt: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  occurredAt: string;
};

export type ActivityLogsFilters = {
  email?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export const pricingSellerTypes = [
  'UZA_RWANDA_STOCK',
  'UZA_CHINA_SOURCING',
  'LOCAL_SELLER',
  'INTERNATIONAL_SELLER',
] as const;

export type PricingSellerType = (typeof pricingSellerTypes)[number];

export type PricingRule = {
  id: string;
  sellerType: PricingSellerType;
  originCountry: string | null;
  destinationCountry: string | null;
  shippingCostUsd: number | null;
  localChargesUsd: number | null;
  taxRatePercent: number | null;
  insuranceRatePercent: number | null;
  storagePerDayUsd: number | null;
  clearingFeeUsd: number | null;
  platformMarginPercent: number | null;
  commissionRate: number | null;
  exchangeRateRwf: number | null;
  deliveryDaysMin: number | null;
  deliveryDaysMax: number | null;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
};
