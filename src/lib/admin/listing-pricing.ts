import type { PricingRule } from '@/types/admin/platform';

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
