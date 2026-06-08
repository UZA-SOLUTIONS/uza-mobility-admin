'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboard } from '@/queries/admin';
import {
  Clock,
  ShoppingCart,
  CreditCard,
  Truck,
  BatteryCharging,
  Leaf,
  Droplet,
  Trees,
  ListIcon,
  Landmark,
} from 'lucide-react';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-3 pb-2">
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { data, isLoading, isError, error } = useDashboard(true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Overview"
          description="Platform metrics for administrators."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Overview" />
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'Unable to load dashboard metrics.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Live counts from listings, orders, payments, fleet, financing, and sustainability."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-muted-foreground">
          Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Published listings"
            value={formatNumber(data.listings.total)}
            icon={<ListIcon className="size-5" />}
          />
          <MetricCard
            label="Pending review"
            value={formatNumber(data.listings.pendingReview)}
            icon={<Clock className="size-5" />}
          />
          <MetricCard
            label="Total orders"
            value={formatNumber(data.orders.total)}
            icon={<ShoppingCart className="size-5" />}
          />
          <MetricCard
            label="Payments to verify"
            value={formatNumber(data.payments.pendingVerification)}
            icon={<CreditCard className="size-5" />}
          />
          <MetricCard
            label="Active fleet requests"
            value={formatNumber(data.fleet.active)}
            icon={<Truck className="size-5" />}
          />
          <MetricCard
            label="Financing in progress"
            value={formatNumber(data.financing.pending)}
            icon={<Landmark className="size-5" />}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-muted-foreground">
          Sustainability impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="EVs delivered"
            value={formatNumber(data.impact.evsDelivered)}
            icon={<BatteryCharging className="size-5" />}
          />
          <MetricCard
            label="CO₂ avoided (kg)"
            value={formatNumber(Math.round(data.impact.co2AvoidedKg))}
            icon={<Leaf className="size-5" />}
          />
          <MetricCard
            label="Fuel saved (L)"
            value={formatNumber(Math.round(data.impact.fuelSavedLitres))}
            icon={<Droplet className="size-5" />}
          />
          <MetricCard
            label="Trees equivalent"
            value={formatNumber(data.impact.treesEquivalent)}
            icon={<Trees className="size-5" />}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {data.impact.methodologyNote}
        </p>
      </section>
    </div>
  );
}
