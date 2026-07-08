'use client';

import type { PriceBreakdown } from '@/types/pricing';

function formatUsd(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatAmountWithPercent(
  amount: number | undefined,
  ratePercent?: number,
): string {
  const formatted = formatUsd(amount);
  if (ratePercent != null && ratePercent > 0) {
    const displayRate =
      ratePercent % 1 === 0 ? ratePercent.toFixed(0) : ratePercent.toFixed(2);
    return `${formatted} (${displayRate}%)`;
  }
  return formatted;
}

function Line({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex justify-between gap-4 text-sm ${emphasis ? 'font-medium' : ''}`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

type PricingBreakdownProps = {
  breakdown: PriceBreakdown | null | undefined;
  loading?: boolean;
  sellerType?: string;
};

export function PricingBreakdown({
  breakdown,
  loading,
  sellerType,
}: PricingBreakdownProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Calculating estimate…</p>
    );
  }

  if (!breakdown) {
    return null;
  }

  const type = sellerType ?? breakdown.sellerType;
  const showDiscount =
    (breakdown.ruleDiscountUsd ?? 0) > 0 ||
    breakdown.ruleDiscountRatePercent != null;

  const discountLine = showDiscount ? (
    <Line
      label="Discount"
      value={formatAmountWithPercent(
        breakdown.ruleDiscountUsd,
        breakdown.ruleDiscountRatePercent,
      )}
    />
  ) : null;

  const marginLine =
    breakdown.marginUsd != null ? (
      <Line
        label="Platform margin"
        value={formatAmountWithPercent(
          breakdown.marginUsd,
          breakdown.platformMarginRatePercent,
        )}
      />
    ) : null;

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Buyer price breakdown
      </p>
      {type === 'UZA_RWANDA_STOCK' ? (
        <>
          <Line label="Base price" value={formatUsd(breakdown.basePriceUsd)} />
          {discountLine}
          <Line
            label="Buyer pays (list price)"
            value={formatUsd(breakdown.finalPriceUsd)}
            emphasis
          />
        </>
      ) : type === 'UZA_CHINA_SOURCING' ? (
        <>
          <Line label="FOB price" value={formatUsd(breakdown.fobPriceUsd)} />
          <Line label="Shipping" value={formatUsd(breakdown.shippingCostUsd)} />
          <Line
            label="Local charges"
            value={formatUsd(breakdown.localChargesUsd)}
          />
          <Line
            label="Taxes (est.)"
            value={formatUsd(breakdown.taxesEstimateUsd)}
          />
          <Line
            label="Insurance (est.)"
            value={formatUsd(breakdown.insuranceUsd)}
          />
          <Line label="Storage" value={formatUsd(breakdown.storageUsd)} />
          <Line
            label="Clearing fee"
            value={formatUsd(breakdown.clearingFeeUsd)}
          />
          <Line
            label="Landing cost"
            value={formatUsd(breakdown.landingCostUsd)}
          />
          {marginLine}
          {discountLine}
          <Line
            label="Buyer pays (list price)"
            value={formatUsd(breakdown.finalPriceUsd)}
            emphasis
          />
        </>
      ) : type === 'LOCAL_SELLER' ? (
        <>
          <Line
            label="Seller payout"
            value={formatUsd(breakdown.sellerDesiredPayoutUsd)}
          />
          <Line
            label="Platform commission"
            value={formatUsd(breakdown.commissionUsd)}
          />
          {discountLine}
          <Line
            label="Buyer pays (list price)"
            value={formatUsd(breakdown.finalPriceUsd)}
            emphasis
          />
        </>
      ) : type === 'INTERNATIONAL_SELLER' ? (
        <>
          <Line label="FOB price" value={formatUsd(breakdown.fobPriceUsd)} />
          <Line label="Shipping" value={formatUsd(breakdown.shippingCostUsd)} />
          <Line
            label="Local charges"
            value={formatUsd(breakdown.localChargesUsd)}
          />
          <Line
            label="Taxes (est.)"
            value={formatUsd(breakdown.taxesEstimateUsd)}
          />
          {marginLine}
          {discountLine}
          <Line
            label="Buyer pays (list price)"
            value={formatUsd(breakdown.finalPriceUsd)}
            emphasis
          />
        </>
      ) : (
        <Line
          label="Buyer pays (list price)"
          value={formatUsd(breakdown.finalPriceUsd)}
          emphasis
        />
      )}
    </div>
  );
}
