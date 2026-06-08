'use client';

import type { PriceBreakdown } from '@/types/pricing';

function formatUsd(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
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
  sellerType?: 'LOCAL_SELLER' | 'INTERNATIONAL_SELLER' | string;
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

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Price estimate (from current platform rules)
      </p>
      {type === 'LOCAL_SELLER' ? (
        <>
          <Line
            label="Your payout"
            value={formatUsd(breakdown.sellerDesiredPayoutUsd)}
          />
          <Line
            label="Platform commission"
            value={formatUsd(breakdown.commissionUsd)}
          />
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
          <Line
            label="Insurance (est.)"
            value={formatUsd(breakdown.insuranceUsd)}
          />
          <Line
            label="Platform margin"
            value={formatUsd(breakdown.marginUsd)}
          />
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
      <p className="text-xs text-muted-foreground">
        Final numbers are fixed when an administrator approves the listing.
      </p>
    </div>
  );
}
