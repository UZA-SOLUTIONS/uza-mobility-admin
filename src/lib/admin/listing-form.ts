import type { AdminListingFormInput } from '@/schemas/admin';
import {
  CHINA_SOURCING_DELIVERY_DAYS,
  listingBodyTypes,
  listingConditions,
  listingDrivetrains,
  listingPowertrainTypes,
  listingRegistrationStatuses,
  listingSteeringPositions,
  listingUseCases,
  RWANDA_STOCK_DELIVERY_DAYS,
} from '@/schemas/admin';
import { parseListingPricingRuleId } from '@/lib/admin/listing-pricing';
import { usdtToRwf } from '@/lib/admin/format';
import type { AdminListing } from '@/types/admin/marketplace';

function parseEnumValue<T extends readonly string[]>(
  value: string | null | undefined,
  allowed: T,
): T[number] | undefined {
  if (value && (allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }
  return undefined;
}

function parseListingCondition(
  value: string | undefined,
): AdminListingFormInput['condition'] {
  if (value && (listingConditions as readonly string[]).includes(value)) {
    return value as AdminListingFormInput['condition'];
  }
  return 'NEW';
}

export function canAdminEditOwnListing(
  listing: AdminListing,
  adminUserId: string | undefined,
): boolean {
  if (!adminUserId || !listing.createdBy) {
    return false;
  }

  if (listing.createdBy.id !== adminUserId) {
    return false;
  }

  return (
    listing.sellerType === 'UZA_RWANDA_STOCK' ||
    listing.sellerType === 'UZA_CHINA_SOURCING'
  );
}

export function adminListingToFormValues(
  listing: AdminListing,
): AdminListingFormInput {
  const sellerType =
    listing.sellerType === 'UZA_CHINA_SOURCING'
      ? 'UZA_CHINA_SOURCING'
      : 'UZA_RWANDA_STOCK';

  const useCases = listing.useCaseTags
    ?.map((tag) => tag.useCase)
    .filter((value): value is (typeof listingUseCases)[number] =>
      (listingUseCases as readonly string[]).includes(value),
    );

  return {
    sellerType,
    listingTitle: listing.listingTitle,
    categoryId: listing.category.id,
    brand: listing.brand,
    model: listing.model,
    trim: listing.trim ?? '',
    manufacturingYear: listing.manufacturingYear,
    condition: parseListingCondition(listing.condition),
    bodyType: parseEnumValue(listing.bodyType, listingBodyTypes),
    powertrainType: parseEnumValue(
      listing.powertrainType,
      listingPowertrainTypes,
    ),
    color: listing.color?.match(/^#[0-9A-Fa-f]{6}$/)
      ? listing.color
      : '#1a1a1a',
    seats: listing.seats ?? undefined,
    steeringPosition: parseEnumValue(
      listing.steeringPosition,
      listingSteeringPositions,
    ),
    drivetrain: parseEnumValue(listing.drivetrain, listingDrivetrains),
    hasWarranty: listing.hasWarranty ?? undefined,
    warrantyDetails: listing.warrantyDetails ?? undefined,
    hasAccidentHistory: listing.hasAccidentHistory ?? undefined,
    ownershipCount: listing.ownershipCount ?? undefined,
    registrationStatus: parseEnumValue(
      listing.registrationStatus,
      listingRegistrationStatuses,
    ),
    useCases: useCases?.length ? useCases : undefined,
    deliveryEstimateDays:
      listing.deliveryEstimateDays ??
      (sellerType === 'UZA_RWANDA_STOCK'
        ? RWANDA_STOCK_DELIVERY_DAYS.max
        : CHINA_SOURCING_DELIVERY_DAYS.min),
    city: listing.city ?? '',
    country: listing.country,
    description: listing.description ?? '',
    isFullOption: listing.isFullOption ?? false,
    mileageKm: listing.mileageKm ?? undefined,
    rangeKm: listing.evSpecs?.rangeKm ?? undefined,
    batteryCapacityKwh: listing.evSpecs?.batteryCapacityKwh ?? undefined,
    batteryHealthPercent: listing.evSpecs?.batteryHealthPercent ?? undefined,
    batteryHealthReport: listing.evSpecs?.batteryHealthReport ?? undefined,
    fastChargingSupported: listing.evSpecs?.fastChargingSupported ?? undefined,
    chargingTimeHours: listing.evSpecs?.chargingTimeHours ?? undefined,
    motorPowerKw: listing.evSpecs?.motorPowerKw ?? undefined,
    topSpeedKmh: listing.evSpecs?.topSpeedKmh ?? undefined,
    payloadCapacityKg: listing.evSpecs?.payloadCapacityKg ?? undefined,
    grossVehicleWeightKg: listing.evSpecs?.grossVehicleWeightKg ?? undefined,
    pricingRuleId:
      parseListingPricingRuleId(listing.listingPricing?.priceNotes) ?? '',
    basePriceRwf:
      listing.listingPricing?.basePriceRwf ??
      (sellerType === 'UZA_RWANDA_STOCK'
        ? (listing.listingPricing?.finalPriceRwf ??
          listing.listingPricing?.displayPriceRwf ??
          usdtToRwf(
            listing.listingPricing?.basePriceUsd ??
              listing.listingPricing?.finalPriceUsd ??
              listing.listingPricing?.fobPriceUsd,
          ) ??
          undefined)
        : undefined),
    fobPriceRwf:
      listing.listingPricing?.fobPriceRwf ??
      (sellerType === 'UZA_CHINA_SOURCING'
        ? (listing.listingPricing?.finalPriceRwf ??
          usdtToRwf(
            listing.listingPricing?.fobPriceUsd ??
              listing.listingPricing?.basePriceUsd ??
              listing.listingPricing?.finalPriceUsd,
          ) ??
          undefined)
        : undefined),
    discountRwf:
      listing.listingPricing?.discountRwf ??
      usdtToRwf(listing.listingPricing?.discountUsd) ??
      undefined,
    status: listing.status,
  };
}
