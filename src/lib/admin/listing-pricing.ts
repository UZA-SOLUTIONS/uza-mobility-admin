import type { PricingRule } from '@/types/admin/platform';
import type { PriceBreakdown } from '@/types/pricing';
import type { AdminListingPricing } from '@/types/admin/marketplace';
import { formatRwf, usdtToRwf } from '@/lib/admin/format';

export function parseListingPricingRuleId(
  priceNotes: string | null | undefined,
): string | undefined {
  if (!priceNotes) return undefined;
  try {
    const parsed = JSON.parse(priceNotes) as { pricingRuleId?: string };
    return parsed.pricingRuleId;
  } catch {
    return undefined;
  }
}

export function parseListingPricingRuleDiscountRate(
  priceNotes: string | null | undefined,
): number | undefined {
  if (!priceNotes) return undefined;
  try {
    const parsed = JSON.parse(priceNotes) as {
      discountRatePercentApplied?: number;
    };
    return parsed.discountRatePercentApplied;
  } catch {
    return undefined;
  }
}

export function parseListingPricingRuleMarginRate(
  priceNotes: string | null | undefined,
): number | undefined {
  if (!priceNotes) return undefined;
  try {
    const parsed = JSON.parse(priceNotes) as {
      platformMarginPercentApplied?: number;
    };
    return parsed.platformMarginPercentApplied;
  } catch {
    return undefined;
  }
}

function derivePlatformMarginRatePercent(
  pricing: AdminListingPricing,
  sellerType: string,
): number | undefined {
  const fromNotes = parseListingPricingRuleMarginRate(pricing.priceNotes);
  if (fromNotes != null) return fromNotes;

  if (
    sellerType === 'UZA_CHINA_SOURCING' &&
    (pricing.landingCostRwf ?? pricing.landingCostUsd) != null &&
    (pricing.landingCostRwf ?? 0) + (pricing.landingCostUsd ?? 0) > 0 &&
    (pricing.marginRwf != null || pricing.marginUsd != null)
  ) {
    const landing =
      pricing.landingCostRwf ?? usdtToRwf(pricing.landingCostUsd) ?? 0;
    const margin = pricing.marginRwf ?? usdtToRwf(pricing.marginUsd) ?? 0;
    if (landing > 0) {
      return (margin / landing) * 100;
    }
  }

  if (
    sellerType === 'INTERNATIONAL_SELLER' &&
    (pricing.marginRwf != null || pricing.marginUsd != null)
  ) {
    const base =
      (pricing.fobPriceRwf ?? usdtToRwf(pricing.fobPriceUsd) ?? 0) +
      (pricing.shippingCostRwf ?? usdtToRwf(pricing.shippingCostUsd) ?? 0) +
      (pricing.localChargesRwf ?? usdtToRwf(pricing.localChargesUsd) ?? 0) +
      (pricing.taxesEstimateRwf ?? usdtToRwf(pricing.taxesEstimateUsd) ?? 0);
    const margin = pricing.marginRwf ?? usdtToRwf(pricing.marginUsd) ?? 0;
    if (base > 0) {
      return (margin / base) * 100;
    }
  }

  return undefined;
}

function asRwf(
  amountRwf: number | null | undefined,
  amountUsd: number | null | undefined,
): number | undefined {
  if (amountRwf != null) return amountRwf;
  return usdtToRwf(amountUsd) ?? undefined;
}

export function listingPricingToBreakdown(
  pricing: AdminListingPricing | null | undefined,
  sellerType: string,
): PriceBreakdown | null {
  if (!pricing) return null;

  const finalPriceRwf =
    asRwf(
      pricing.finalPriceRwf ?? pricing.displayPriceRwf,
      pricing.finalPriceUsd,
    ) ?? 0;

  return {
    sellerType,
    basePriceRwf: asRwf(pricing.basePriceRwf, pricing.basePriceUsd),
    fobPriceRwf: asRwf(pricing.fobPriceRwf, pricing.fobPriceUsd),
    sellerDesiredPayoutRwf: asRwf(
      pricing.sellerDesiredPayoutRwf,
      pricing.sellerDesiredPayoutUsd,
    ),
    shippingCostRwf: asRwf(pricing.shippingCostRwf, pricing.shippingCostUsd),
    localChargesRwf: asRwf(pricing.localChargesRwf, pricing.localChargesUsd),
    taxesEstimateRwf: asRwf(pricing.taxesEstimateRwf, pricing.taxesEstimateUsd),
    insuranceRwf: asRwf(pricing.insuranceRwf, pricing.insuranceUsd),
    storageRwf: asRwf(pricing.storageRwf, pricing.storageUsd),
    clearingFeeRwf: asRwf(pricing.clearingFeeRwf, pricing.clearingFeeUsd),
    landingCostRwf: asRwf(pricing.landingCostRwf, pricing.landingCostUsd),
    marginRwf: asRwf(pricing.marginRwf, pricing.marginUsd),
    platformMarginRatePercent: derivePlatformMarginRatePercent(
      pricing,
      sellerType,
    ),
    commissionRwf: asRwf(pricing.commissionRwf, pricing.commissionUsd),
    ruleDiscountRwf: asRwf(pricing.ruleDiscountRwf, pricing.ruleDiscountUsd),
    ruleDiscountRatePercent: parseListingPricingRuleDiscountRate(
      pricing.priceNotes,
    ),
    discountRwf: asRwf(pricing.discountRwf, pricing.discountUsd),
    finalPriceRwf,
    displayPriceRwf: pricing.displayPriceRwf ?? finalPriceRwf,
    finalPriceUsd: pricing.finalPriceUsd,
    deliveryDaysMin: 0,
    deliveryDaysMax: 0,
    currency: pricing.currency === 'USD' ? 'USD' : 'RWF',
  };
}

export function formatPricingRuleLabel(rule: PricingRule): string {
  const parts = [rule.sellerType.replaceAll('_', ' ')];

  if (rule.originCountry || rule.destinationCountry) {
    parts.push(
      [rule.originCountry, rule.destinationCountry].filter(Boolean).join(' → '),
    );
  }

  if (rule.platformMarginPercent != null) {
    parts.push(`${rule.platformMarginPercent}% margin`);
  }
  if (rule.discountRatePercent != null && rule.discountRatePercent > 0) {
    parts.push(`${rule.discountRatePercent}% discount`);
  }
  if (rule.commissionRate != null) {
    parts.push(`${(rule.commissionRate * 100).toFixed(1)}% commission`);
  }
  if (rule.shippingCostRwf != null) {
    parts.push(`${formatRwf(rule.shippingCostRwf)} shipping`);
  }
  if (rule.localChargesRwf != null) {
    parts.push(`${formatRwf(rule.localChargesRwf)} local`);
  }
  if (rule.taxRatePercent != null) {
    parts.push(`${rule.taxRatePercent}% tax`);
  }
  if (rule.insuranceRatePercent != null) {
    parts.push(`${rule.insuranceRatePercent}% insurance`);
  }
  if (rule.clearingFeeRwf != null) {
    parts.push(`${formatRwf(rule.clearingFeeRwf)} clearing`);
  }
  if (rule.deliveryDaysMin != null && rule.deliveryDaysMax != null) {
    parts.push(`${rule.deliveryDaysMin}–${rule.deliveryDaysMax}d delivery`);
  }
  if (!rule.isActive) {
    parts.push('inactive');
  }

  return parts.join(' · ');
}

/** All pricing rules the admin can attach to a listing (not filtered by channel). */
export function selectableListingPricingRules(
  rules: PricingRule[] | undefined,
  selectedRuleId?: string,
  preferredSellerType?: PricingRule['sellerType'],
): PricingRule[] {
  if (!rules?.length) return [];

  const list = rules.filter(
    (rule) => rule.isActive || (selectedRuleId && rule.id === selectedRuleId),
  );

  if (!preferredSellerType) {
    return list;
  }

  return [...list].sort((a, b) => {
    const aMatches = a.sellerType === preferredSellerType ? 0 : 1;
    const bMatches = b.sellerType === preferredSellerType ? 0 : 1;
    if (aMatches !== bMatches) return aMatches - bMatches;
    return formatPricingRuleLabel(a).localeCompare(formatPricingRuleLabel(b));
  });
}
