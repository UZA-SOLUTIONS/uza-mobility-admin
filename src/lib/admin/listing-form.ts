import type { AdminListingFormInput } from '@/schemas/admin';
import {
  listingBodyTypes,
  listingChargingTypes,
  listingConditions,
  listingDrivetrains,
  listingPowertrainTypes,
  listingSteeringPositions,
  listingUseCases,
} from '@/schemas/admin';
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
    subcategoryId: listing.subcategory?.id ?? '',
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
    color: listing.color ?? undefined,
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
    registrationStatus: listing.registrationStatus ?? undefined,
    useCases: useCases?.length ? useCases : undefined,
    deliveryEstimateDays: listing.deliveryEstimateDays ?? undefined,
    vehicleLocation: listing.vehicleLocation ?? '',
    city: listing.city ?? '',
    country: listing.country,
    description: listing.description ?? '',
    mileageKm: listing.mileageKm ?? undefined,
    rangeKm: listing.evSpecs?.rangeKm ?? undefined,
    batteryCapacityKwh: listing.evSpecs?.batteryCapacityKwh ?? undefined,
    batteryHealthPercent: listing.evSpecs?.batteryHealthPercent ?? undefined,
    batteryHealthReport: listing.evSpecs?.batteryHealthReport ?? undefined,
    chargingType: parseEnumValue(
      listing.evSpecs?.chargingType ?? undefined,
      listingChargingTypes,
    ),
    fastChargingSupported: listing.evSpecs?.fastChargingSupported ?? undefined,
    chargingTimeHours: listing.evSpecs?.chargingTimeHours ?? undefined,
    motorPowerKw: listing.evSpecs?.motorPowerKw ?? undefined,
    topSpeedKmh: listing.evSpecs?.topSpeedKmh ?? undefined,
    payloadCapacityKg: listing.evSpecs?.payloadCapacityKg ?? undefined,
    grossVehicleWeightKg: listing.evSpecs?.grossVehicleWeightKg ?? undefined,
    seatingCapacity: listing.evSpecs?.seatingCapacity ?? undefined,
    basePriceUsd: listing.listingPricing?.basePriceUsd ?? undefined,
    fobPriceUsd: listing.listingPricing?.fobPriceUsd ?? undefined,
    discountUsd: listing.listingPricing?.discountUsd ?? undefined,
    status: listing.status,
  };
}
