'use client';

import { PageHeader } from '@/components/shared/page-header';
import { AdminStatTile } from '@/components/admin/shared/admin-stat-tile';
import { Skeleton } from '@/components/ui/skeleton';
import { adminRoutes } from '@/config/routes';
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
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'Unable to load dashboard metrics.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="Live counts from listings, orders, payments, fleet, financing, and sustainability."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminStatTile
            label="Published listings"
            value={formatNumber(data.listings.total)}
            href={adminRoutes.listings}
            icon={<ListIcon className="size-5" />}
          />
          <AdminStatTile
            label="Pending review"
            value={formatNumber(data.listings.pendingReview)}
            href={adminRoutes.listings}
            icon={<Clock className="size-5" />}
          />
          <AdminStatTile
            label="Total orders"
            value={formatNumber(data.orders.total)}
            href={adminRoutes.orders}
            icon={<ShoppingCart className="size-5" />}
          />
          <AdminStatTile
            label="Payments to verify"
            value={formatNumber(data.payments.pendingVerification)}
            href={adminRoutes.payments}
            icon={<CreditCard className="size-5" />}
          />
          <AdminStatTile
            label="Active fleet requests"
            value={formatNumber(data.fleet.active)}
            href={adminRoutes.fleet}
            icon={<Truck className="size-5" />}
          />
          <AdminStatTile
            label="Financing in progress"
            value={formatNumber(data.financing.pending)}
            href={adminRoutes.financing}
            icon={<Landmark className="size-5" />}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Sustainability impact
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatTile
            label="EVs delivered"
            value={formatNumber(data.impact.evsDelivered)}
            href={adminRoutes.sustainability}
            icon={<BatteryCharging className="size-5" />}
          />
          <AdminStatTile
            label="CO₂ avoided (kg)"
            value={formatNumber(Math.round(data.impact.co2AvoidedKg))}
            href={adminRoutes.sustainability}
            icon={<Leaf className="size-5" />}
          />
          <AdminStatTile
            label="Fuel saved (L)"
            value={formatNumber(Math.round(data.impact.fuelSavedLitres))}
            href={adminRoutes.sustainability}
            icon={<Droplet className="size-5" />}
          />
          <AdminStatTile
            label="Trees equivalent"
            value={formatNumber(data.impact.treesEquivalent)}
            href={adminRoutes.sustainability}
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
