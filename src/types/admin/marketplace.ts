export const listingStatuses = [
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'SOLD',
  'RESERVED',
  'SUSPENDED',
  'REJECTED',
  'EXPIRED',
  'ARCHIVED',
] as const;

export type ListingStatus = (typeof listingStatuses)[number];

export const sellerStatuses = [
  'PENDING',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
] as const;
export type SellerStatus = (typeof sellerStatuses)[number];

export const sellerTypes = [
  'UZA_RWANDA_STOCK',
  'UZA_CHINA_SOURCING',
  'LOCAL_SELLER',
  'INTERNATIONAL_SELLER',
] as const;

export type SellerType = (typeof sellerTypes)[number];

export type AdminListingSeller = {
  id: string;
  businessName: string;
  country: string;
  city: string | null;
  isVerified: boolean;
  userId: string;
};

export type AdminListingCreatedBy = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type AdminListingCategory = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

export type AdminListingPricing = {
  finalPriceUsd: number;
  finalPriceRwf: number | null;
  currency: string;
  basePriceUsd?: number | null;
  fobPriceUsd?: number | null;
  discountUsd?: number | null;
};

export const verificationLevels = [
  'BASIC_LISTED',
  'UZA_REVIEWED',
  'UZA_VERIFIED',
  'UZA_INSPECTED',
  'BATTERY_VERIFIED',
  'PREMIUM_VERIFIED',
] as const;

export type VerificationLevel = (typeof verificationLevels)[number];

export type AdminListingPhoto = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

export type AdminVerificationReport = {
  id: string;
  verificationLevel: VerificationLevel;
  inspectionStatus: string | null;
  batteryReportStatus: string | null;
  documentStatus: string | null;
  reportUrl: string | null;
  batteryReportUrl: string | null;
  verifiedAt: string | null;
};

export type AdminListing = {
  id: string;
  listingTitle: string;
  slug: string;
  status: ListingStatus;
  brand: string;
  model: string;
  trim: string | null;
  manufacturingYear: number;
  condition: string;
  bodyType?: string | null;
  powertrainType?: string | null;
  color?: string | null;
  seats?: number | null;
  steeringPosition?: string | null;
  drivetrain?: string | null;
  hasWarranty?: boolean | null;
  warrantyDetails?: string | null;
  hasAccidentHistory?: boolean | null;
  ownershipCount?: number | null;
  registrationStatus?: string | null;
  videoUrl?: string | null;
  mileageKm: number | null;
  description: string | null;
  vehicleLocation: string | null;
  city: string | null;
  country: string;
  deliveryEstimateDays?: number | null;
  sellerType: SellerType;
  verificationLevel: VerificationLevel;
  isFeatured: boolean;
  isHotDeal: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  adminNotes: string | null;
  seller: AdminListingSeller;
  category: AdminListingCategory;
  subcategory: { id: string; name: string; slug: string } | null;
  listingPricing: AdminListingPricing | null;
  evSpecs: {
    rangeKm: number | null;
    batteryCapacityKwh?: number | null;
    batteryHealthPercent: number | null;
    batteryHealthReport?: boolean | null;
    chargingType?: string | null;
    fastChargingSupported?: boolean | null;
    chargingTimeHours?: number | null;
    motorPowerKw?: number | null;
    topSpeedKmh?: number | null;
    payloadCapacityKg?: number | null;
    grossVehicleWeightKg?: number | null;
    seatingCapacity?: number | null;
  } | null;
  useCaseTags?: { useCase: string }[];
  photos: AdminListingPhoto[];
  verificationReport: AdminVerificationReport | null;
  createdBy: AdminListingCreatedBy | null;
};

export const adminListingChannelTypes = [
  'UZA_RWANDA_STOCK',
  'UZA_CHINA_SOURCING',
] as const;

export type AdminListingChannelType = (typeof adminListingChannelTypes)[number];

export type AdminListingsFilters = {
  status?: ListingStatus;
  sellerId?: string;
  sellerType?: AdminListingChannelType;
  q?: string;
  page?: number;
  limit?: number;
};

export type AdminSellerUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
};

export type AdminSeller = {
  id: string;
  userId: string;
  sellerType: SellerType;
  status: SellerStatus;
  businessName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: AdminSellerUser;
  _count: { listings: number; parts: number };
};

export type AdminSellersFilters = {
  status?: SellerStatus;
  sellerType?: SellerType;
  isVerified?: boolean;
  q?: string;
  page?: number;
  limit?: number;
};

export type PartCondition = 'NEW' | 'USED' | 'REFURBISHED';

export type PartStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export type AdminPart = {
  id: string;
  sellerId: string | null;
  name: string;
  slug: string;
  categorySlug: string;
  compatibleBrands: string[];
  compatibleModels: string[];
  condition: PartCondition;
  priceUsd: number;
  stockQuantity: number;
  stockLabel: string;
  deliveryEstimate: string | null;
  hasWarranty: boolean;
  warrantyDetails: string | null;
  description: string | null;
  status: PartStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos?: { id: string; url: string; isPrimary: boolean }[];
  seller?: { id: string; businessName: string } | null;
};

export type AdminPartsFilters = {
  q?: string;
  category?: string;
  status?: PartStatus;
  page?: number;
  limit?: number;
};

export type CategoryType =
  | 'PASSENGER_EV'
  | 'TWO_THREE_WHEEL'
  | 'COMMERCIAL_EV'
  | 'EV_PARTS_ACCESSORIES'
  | 'EV_INFRASTRUCTURE_ENERGY';

export type Category = {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string | null;
  iconUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: Subcategory[];
  _count?: { listings: number };
};

export type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
};
