export const fleetRequestStatuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUOTED',
  'APPROVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type FleetRequestStatus = (typeof fleetRequestStatuses)[number];

export const FLEET_STATUS_TRANSITIONS: Record<
  FleetRequestStatus,
  FleetRequestStatus[]
> = {
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['QUOTED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export type FleetRequest = {
  id: string;
  userId: string;
  associationId: string | null;
  status: FleetRequestStatus;
  organizationName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  buyerType: string;
  vehicleCategoryId: string | null;
  vehicleSubcategoryId: string | null;
  quantity: number;
  useCase: string | null;
  preferredDeliveryTimeline: string | null;
  budgetRangeMin: number | null;
  budgetRangeMax: number | null;
  financingRequested: boolean;
  chargingSupportRequested: boolean;
  notes: string | null;
  adminNotes?: string | null;
  quotedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FleetRequestDetail = FleetRequest & {
  association: {
    id: string;
    name: string;
    type: string;
    country: string;
  } | null;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export type AdminFleetFilters = {
  status?: FleetRequestStatus;
  q?: string;
  page?: number;
  limit?: number;
};

export const chargingProductTypes = [
  'HOME_CHARGER',
  'COMMERCIAL_CHARGER',
  'FLEET_CHARGING_SYSTEM',
  'PUBLIC_CHARGING_STATION',
  'DC_FAST_CHARGER',
  'AC_CHARGER',
  'CHARGING_ACCESSORY',
  'SOLAR_EV_PACKAGE',
  'BATTERY_STORAGE',
  'SMART_CHARGING',
  'ENERGY_MANAGEMENT',
  'SITE_EQUIPMENT',
] as const;

export type ChargingProductType = (typeof chargingProductTypes)[number];

export type ChargingProductPhoto = {
  id: string;
  url: string;
  isPrimary: boolean;
};

export type ChargingProduct = {
  id: string;
  name: string;
  slug: string;
  productType: ChargingProductType;
  brand: string | null;
  powerKw: number | null;
  voltage: string | null;
  connectorTypes: string[];
  solarIncluded: boolean;
  priceUsd: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  photos: ChargingProductPhoto[];
};

export const energyRequestStatuses = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'QUOTED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type EnergyRequestStatus = (typeof energyRequestStatuses)[number];

export type EnergyRequest = {
  id: string;
  clientType: string | null;
  location: string | null;
  city: string | null;
  numberOfEvs: number | null;
  chargerTypeNeeded: ChargingProductType | null;
  solarSupportNeeded: boolean;
  fleetUse: boolean;
  siteVisitRequested: boolean;
  contactName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: EnergyRequestStatus;
  chargingProductId: string | null;
  createdAt: string;
  updatedAt: string;
  chargingProduct?: { name: string; slug: string } | null;
};

export type AdminEnergyRequestsFilters = {
  status?: EnergyRequestStatus;
  page?: number;
  limit?: number;
};

export const promotionTypes = [
  'FEATURED_LISTING',
  'HOMEPAGE_BANNER',
  'CATEGORY_SPONSORSHIP',
  'SPONSORED_SUPPLIER',
  'BANK_PARTNER_BANNER',
  'CHARGING_PARTNER_BANNER',
  'DEAL_OF_WEEK',
  'NEW_ARRIVAL_HIGHLIGHT',
  'DISCOUNT_CAMPAIGN',
  'FLEET_DISCOUNT',
  'TAXI_ASSOCIATION_CAMPAIGN',
  'SEASONAL_PROMOTION',
  'REFERRAL_PROMOTION',
] as const;

export type PromotionType = (typeof promotionTypes)[number];

export type AdminPromotion = {
  id: string;
  name: string;
  type: PromotionType;
  sponsorName: string | null;
  discountAmountUsd: number | null;
  discountPercent: number | null;
  bannerImageUrl: string | null;
  bannerPlacement: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  clickUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { listings: number };
};

export type PromotionListingLink = {
  listing: {
    id: string;
    listingTitle: string;
    slug: string;
    status: string;
  };
};

export type AdminPromotionDetail = AdminPromotion & {
  listings?: PromotionListingLink[];
};

export type SustainabilityFilters = {
  country?: string;
  buyerType?: string;
  vehicleType?: string;
  fleetClientName?: string;
  from?: string;
  to?: string;
};

export type SustainabilitySummary = {
  records: number;
  co2AvoidedKg: number;
  fuelSavedLitres: number;
  greenKmEnabled: number;
  treesEquivalent: number;
};

export type SustainabilityMetricRow = {
  id: string;
  recordedAt: string;
  vehicleType: string;
  buyerType: string | null;
  country: string | null;
  estimatedCo2AvoidedKg: number;
  estimatedFuelSavedL: number;
  greenKmSupported: number;
  listing?: {
    id: string;
    listingTitle: string;
    slug: string;
    brand: string | null;
    model: string | null;
  };
};

export type SustainabilityOverview = {
  summary: SustainabilitySummary;
  recent: SustainabilityMetricRow[];
};

export type SustainabilityBreakdownRow = {
  buyerType?: string | null;
  country?: string | null;
  vehicleType?: string | null;
  records: number;
  co2AvoidedKg: number;
  fuelSavedLitres: number;
  greenKmEnabled: number;
};

/** Mirrors backend sustainability.constants.ts (read-only reference). */
export const EMISSIONS_FACTORS_REFERENCE = [
  {
    vehicleType: 'PASSENGER_EV',
    co2PerKmKg: 0.12,
    fuelSavedPerKmL: 0.07,
    annualKmEstimate: 20000,
  },
  {
    vehicleType: 'TWO_THREE_WHEEL',
    co2PerKmKg: 0.06,
    fuelSavedPerKmL: 0.035,
    annualKmEstimate: 15000,
  },
  {
    vehicleType: 'COMMERCIAL_EV',
    co2PerKmKg: 0.25,
    fuelSavedPerKmL: 0.15,
    annualKmEstimate: 40000,
  },
  {
    vehicleType: 'EV_PARTS_ACCESSORIES',
    co2PerKmKg: 0.05,
    fuelSavedPerKmL: 0.03,
    annualKmEstimate: 5000,
  },
  {
    vehicleType: 'EV_INFRASTRUCTURE_ENERGY',
    co2PerKmKg: 0.08,
    fuelSavedPerKmL: 0.04,
    annualKmEstimate: 10000,
  },
] as const;
