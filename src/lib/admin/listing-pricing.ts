import type { PricingRule } from '@/types/admin/platform';
import type { PriceBreakdown } from '@/types/pricing';
import type { AdminListingPricing } from '@/types/admin/marketplace';

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
    pricing.landingCostUsd != null &&
    pricing.landingCostUsd > 0 &&
    pricing.marginUsd != null
  ) {
    return (pricing.marginUsd / pricing.landingCostUsd) * 100;
  }

  if (sellerType === 'INTERNATIONAL_SELLER' && pricing.marginUsd != null) {
    const base =
      (pricing.fobPriceUsd ?? 0) +
      (pricing.shippingCostUsd ?? 0) +
      (pricing.localChargesUsd ?? 0) +
      (pricing.taxesEstimateUsd ?? 0);
    if (base > 0) {
      return (pricing.marginUsd / base) * 100;
    }
  }

  return undefined;
}

export function listingPricingToBreakdown(
  pricing: AdminListingPricing | null | undefined,
  sellerType: string,
): PriceBreakdown | null {
  if (!pricing) return null;

  return {
    sellerType,
    basePriceUsd: pricing.basePriceUsd ?? undefined,
    fobPriceUsd: pricing.fobPriceUsd ?? undefined,
    sellerDesiredPayoutUsd: pricing.sellerDesiredPayoutUsd ?? undefined,
    shippingCostUsd: pricing.shippingCostUsd ?? undefined,
    localChargesUsd: pricing.localChargesUsd ?? undefined,
    taxesEstimateUsd: pricing.taxesEstimateUsd ?? undefined,
    insuranceUsd: pricing.insuranceUsd ?? undefined,
    storageUsd: pricing.storageUsd ?? undefined,
    clearingFeeUsd: pricing.clearingFeeUsd ?? undefined,
    landingCostUsd: pricing.landingCostUsd ?? undefined,
    marginUsd: pricing.marginUsd ?? undefined,
    platformMarginRatePercent: derivePlatformMarginRatePercent(
      pricing,
      sellerType,
    ),
    commissionUsd: pricing.commissionUsd ?? undefined,
    ruleDiscountUsd: pricing.ruleDiscountUsd ?? undefined,
    ruleDiscountRatePercent: parseListingPricingRuleDiscountRate(
      pricing.priceNotes,
    ),
    discountUsd: pricing.discountUsd ?? undefined,
    finalPriceUsd: pricing.finalPriceUsd,
    deliveryDaysMin: 0,
    deliveryDaysMax: 0,
    currency: pricing.currency ?? 'USD',
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
  if (rule.shippingCostUsd != null) {
    parts.push(`$${rule.shippingCostUsd} shipping`);
  }
  if (rule.localChargesUsd != null) {
    parts.push(`$${rule.localChargesUsd} local`);
  }
  if (rule.taxRatePercent != null) {
    parts.push(`${rule.taxRatePercent}% tax`);
  }
  if (rule.insuranceRatePercent != null) {
    parts.push(`${rule.insuranceRatePercent}% insurance`);
  }
  if (rule.clearingFeeUsd != null) {
    parts.push(`$${rule.clearingFeeUsd} clearing`);
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
