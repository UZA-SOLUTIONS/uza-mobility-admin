'use client';

import { useState } from 'react';
import { BookingDetailSheet } from '@/components/admin/booking-detail-sheet';
import { EditBookingFeeDialog } from '@/components/admin/edit-booking-fee-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/permissions';
import { formatUsd } from '@/lib/admin/format';
import { useAdminBookings } from '@/queries/bookings';
import type { AdminVehicleBooking } from '@/types/admin/bookings';

export function AdminBookingsPanel() {
  const { can } = usePermissions();
  const canManageFees = can('bookings:manage');
  const { data, isLoading, isError, error } = useAdminBookings({
    limit: 50,
  });
  const [feeTarget, setFeeTarget] = useState<AdminVehicleBooking | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdminVehicleBooking | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const openDetail = (booking: AdminVehicleBooking) => {
    setDetailTarget(booking);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle bookings"
        description="Review booking fee payment proofs and confirm or reject them."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load bookings.'}
        </p>
      ) : null}

      <div className="space-y-3">
        {data?.items.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium">
                {booking.listing?.listingTitle ?? booking.bookingNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking.bookingNumber} · {formatUsd(booking.bookingFeeUsd)}
              </p>
              <p className="text-xs text-muted-foreground">
                Ref: {booking.paymentReference}
                {(booking.proofs?.length ?? 0) > 0
                  ? ` · ${booking.proofs!.length} proof file(s)`
                  : ''}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={booking.status} />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => openDetail(booking as AdminVehicleBooking)}
              >
                Review
              </Button>
              {canManageFees && booking.status === 'AWAITING_PAYMENT' ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFeeTarget(booking as AdminVehicleBooking)}
                >
                  Edit fee
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {!isLoading && (data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : null}
      </div>

      <BookingDetailSheet
        booking={detailTarget}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailTarget(null);
        }}
      />

      <EditBookingFeeDialog
        open={Boolean(feeTarget)}
        onOpenChange={(open) => {
          if (!open) setFeeTarget(null);
        }}
        booking={feeTarget}
      />
    </div>
  );
}
