import { z } from 'zod';
import type { ListingStatus } from '@/types/admin/marketplace';

export const rejectListingSchema = z.object({
  reason: z.string().min(1, 'Reason is required').max(2000),
});

export type RejectListingInput = z.infer<typeof rejectListingSchema>;

export const updateVerificationSchema = z.object({
  verificationLevel: z.enum([
    'BASIC_LISTED',
    'UZA_REVIEWED',
    'UZA_VERIFIED',
    'UZA_INSPECTED',
    'BATTERY_VERIFIED',
    'PREMIUM_VERIFIED',
  ]),
  inspectionStatus: z.string().max(200).optional(),
  batteryReportStatus: z.string().max(200).optional(),
  documentStatus: z.string().max(200).optional(),
});

export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;

export const listingConditions = [
  'NEW',
  'EXCELLENT',
  'VERY_GOOD',
  'GOOD',
  'FAIR',
  'NEEDS_REVIEW',
] as const;

/** Stored on listing EV specs (`EvSpec.chargingType`). */
export const listingChargingTypes = [
  'AC_TYPE1',
  'AC_TYPE2',
  'DC_CCS',
  'DC_CHADEMO',
  'DC_GB_T',
  'TESLA_NACS',
  'AC',
  'DC',
] as const;

export type ListingChargingType = (typeof listingChargingTypes)[number];

export function formatListingChargingType(value: string): string {
  return value.replaceAll('_', ' ');
}

export const listingBodyTypes = [
  'SEDAN',
  'SUV',
  'HATCHBACK',
  'CROSSOVER',
  'COUPE',
  'MPV',
  'PICKUP_TRUCK',
  'WAGON',
  'MINIVAN',
  'BUS',
  'MINIBUS',
  'VAN',
  'CARGO_VAN',
  'TRUCK',
  'LIGHT_TRUCK',
  'HEAVY_DUTY_TRUCK',
  'UTILITY_VEHICLE',
  'DELIVERY_VEHICLE',
  'FORKLIFT',
  'INDUSTRIAL',
  'SHUTTLE',
  'MOTORCYCLE',
  'SCOOTER',
  'BICYCLE',
  'TRICYCLE',
  'CARGO_BIKE',
] as const;

export const listingPowertrainTypes = ['BEV', 'PHEV', 'HEV', 'EREV'] as const;

export const listingSteeringPositions = [
  'LEFT_HAND_DRIVE',
  'RIGHT_HAND_DRIVE',
] as const;

export const listingDrivetrains = ['FWD', 'RWD', 'AWD', 'FOUR_WD'] as const;

export const listingUseCases = [
  'FAMILY',
  'TAXI',
  'DELIVERY',
  'CORPORATE',
  'FLEET',
  'SCHOOL',
  'HOTEL',
  'LOGISTICS',
  'INDUSTRIAL',
  'GOVERNMENT',
  'AGRICULTURE',
  'WAREHOUSE',
  'PERSONAL_MOBILITY',
  'COURIER',
  'CAMPUS',
  'LAST_MILE',
] as const;

export function formatListingEnumLabel(value: string): string {
  return value.replaceAll('_', ' ');
}

export const adminListingSellerTypes = [
  'UZA_RWANDA_STOCK',
  'UZA_CHINA_SOURCING',
] as const;

/** Matches backend `FilesInterceptor('photos', 20)` on admin listing create. */
export const MAX_LISTING_PHOTOS = 20;

/** Matches backend `FilesInterceptor('photos', 10)` on admin parts. */
export const MAX_PART_PHOTOS = 10;

export const adminListingInitialStatuses = ['DRAFT', 'PENDING_REVIEW'] as const;

/** Status options when editing an admin-owned listing in the form. */
export function adminListingStatusEditOptions(
  current: ListingStatus,
): ListingStatus[] {
  if (current === 'DRAFT') {
    return ['DRAFT', 'PENDING_REVIEW'];
  }
  if (current === 'REJECTED') {
    return ['REJECTED', 'DRAFT', 'PENDING_REVIEW'];
  }
  return [current];
}

const adminListingFormFieldsSchema = z.object({
  sellerType: z.enum(adminListingSellerTypes),
  listingTitle: z.string().min(1).max(200),
  categoryId: z.string().min(1, 'Category is required'),
  subcategoryId: z.string().optional(),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional(),
  manufacturingYear: z.number().int().min(1990).max(2100),
  condition: z.enum(listingConditions),
  bodyType: z.enum(listingBodyTypes).optional(),
  powertrainType: z.enum(listingPowertrainTypes).optional(),
  color: z.string().max(100).optional(),
  seats: z.number().int().min(1).optional(),
  steeringPosition: z.enum(listingSteeringPositions).optional(),
  drivetrain: z.enum(listingDrivetrains).optional(),
  hasWarranty: z.boolean().optional(),
  warrantyDetails: z.string().max(500).optional(),
  hasAccidentHistory: z.boolean().optional(),
  ownershipCount: z.number().int().min(0).optional(),
  registrationStatus: z.string().max(200).optional(),
  useCases: z.array(z.enum(listingUseCases)).optional(),
  deliveryEstimateDays: z.number().int().min(0).optional(),
  vehicleLocation: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  country: z.string().length(2),
  description: z.string().max(5000).optional(),
  mileageKm: z.number().min(0).optional(),
  rangeKm: z.number().min(1).optional(),
  batteryCapacityKwh: z.number().min(0).optional(),
  batteryHealthPercent: z.number().min(0).max(100).optional(),
  batteryHealthReport: z.boolean().optional(),
  chargingType: z.enum(listingChargingTypes).optional(),
  fastChargingSupported: z.boolean().optional(),
  chargingTimeHours: z.number().min(0).optional(),
  motorPowerKw: z.number().min(0).optional(),
  topSpeedKmh: z.number().min(0).optional(),
  payloadCapacityKg: z.number().min(0).optional(),
  grossVehicleWeightKg: z.number().min(0).optional(),
  seatingCapacity: z.number().int().min(1).optional(),
  basePriceUsd: z.number().min(0).optional(),
  fobPriceUsd: z.number().min(0).optional(),
  discountUsd: z.number().min(0).optional(),
});

function refineListingEvSpecs(
  data: z.infer<typeof adminListingFormFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (data.rangeKm == null || data.rangeKm <= 0) {
    ctx.addIssue({
      code: 'custom',
      message: 'Electric range (km) is required',
      path: ['rangeKm'],
    });
  }

  if (!data.chargingType) {
    ctx.addIssue({
      code: 'custom',
      message: 'Charging type is required',
      path: ['chargingType'],
    });
  }

  if (
    data.condition !== 'NEW' &&
    (data.batteryHealthPercent == null || data.batteryHealthPercent <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Battery health (%) is required for pre-owned vehicles',
      path: ['batteryHealthPercent'],
    });
  }
}

function refineAdminListingPricing(
  data: z.infer<typeof adminListingFormFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  if (
    data.sellerType === 'UZA_RWANDA_STOCK' &&
    (data.basePriceUsd == null || data.basePriceUsd <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Base price (USD) is required for Rwanda stock',
      path: ['basePriceUsd'],
    });
  }
  if (
    data.sellerType === 'UZA_CHINA_SOURCING' &&
    (data.fobPriceUsd == null || data.fobPriceUsd <= 0)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'FOB price (USD) is required for China sourcing',
      path: ['fobPriceUsd'],
    });
  }
}

/** Shared react-hook-form shape for create + edit listing dialogs. */
export const adminListingFormSchema = adminListingFormFieldsSchema
  .extend({
    initialStatus: z.enum(adminListingInitialStatuses).optional(),
    status: z
      .enum([
        'DRAFT',
        'PENDING_REVIEW',
        'REJECTED',
        'APPROVED',
        'PUBLISHED',
        'SOLD',
        'RESERVED',
        'SUSPENDED',
        'EXPIRED',
        'ARCHIVED',
      ])
      .optional(),
    removePhotoIds: z.array(z.string().min(1)).optional(),
    removeVideo: z.boolean().optional(),
  })
  .superRefine(refineAdminListingPricing)
  .superRefine(refineListingEvSpecs);

export type AdminListingFormInput = z.infer<typeof adminListingFormSchema>;

export const adminUpdateListingSchema = adminListingFormFieldsSchema
  .extend({
    status: z
      .enum([
        'DRAFT',
        'PENDING_REVIEW',
        'REJECTED',
        'APPROVED',
        'PUBLISHED',
        'SOLD',
        'RESERVED',
        'SUSPENDED',
        'EXPIRED',
        'ARCHIVED',
      ])
      .optional(),
    removePhotoIds: z.array(z.string().min(1)).optional(),
    removeVideo: z.boolean().optional(),
  })
  .superRefine(refineAdminListingPricing)
  .superRefine(refineListingEvSpecs);

export type AdminUpdateListingInput = z.infer<typeof adminUpdateListingSchema>;

export const adminCreateListingSchema = adminListingFormFieldsSchema
  .extend({
    initialStatus: z.enum(adminListingInitialStatuses),
  })
  .superRefine(refineAdminListingPricing)
  .superRefine(refineListingEvSpecs);

export type AdminCreateListingInput = z.infer<typeof adminCreateListingSchema>;

export const suspendSellerSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type SuspendSellerInput = z.infer<typeof suspendSellerSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1).max(150),
  type: z.enum([
    'PASSENGER_EV',
    'TWO_THREE_WHEEL',
    'COMMERCIAL_EV',
    'EV_PARTS_ACCESSORIES',
    'EV_INFRASTRUCTURE_ENERGY',
  ]),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const createSubcategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const updateSubcategorySchema = createSubcategorySchema
  .extend({
    displayOrder: z.number().int().min(0).optional(),
  })
  .partial();

export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

export const partConditions = ['NEW', 'USED', 'REFURBISHED'] as const;

export const createPartSchema = z.object({
  name: z.string().min(1).max(200),
  categorySlug: z.string().min(1).max(100),
  condition: z.enum(partConditions),
  priceUsd: z.number().min(0),
  stockQuantity: z.number().int().min(0),
  description: z.string().max(5000).optional(),
  deliveryEstimate: z.string().max(200).optional(),
});

export type CreatePartInput = z.infer<typeof createPartSchema>;

export const updatePartSchema = createPartSchema.partial();

export type UpdatePartInput = z.infer<typeof updatePartSchema>;
