'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { formatUsd } from '@/lib/admin/format';
import { useUpdateBookingFee } from '@/queries/bookings';
import type { VehicleBooking } from '@/types/buyer/bookings';

type EditBookingFeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: VehicleBooking | null;
};

export function EditBookingFeeDialog({
  open,
  onOpenChange,
  booking,
}: EditBookingFeeDialogProps) {
  const update = useUpdateBookingFee();
  const [fee, setFee] = useState('');

  useEffect(() => {
    if (open && booking) {
      setFee(String(booking.bookingFeeUsd));
    }
  }, [open, booking]);

  const parsedFee = Number(fee);
  const canSave =
    Boolean(booking) &&
    Number.isFinite(parsedFee) &&
    parsedFee > 0 &&
    parsedFee !== booking?.bookingFeeUsd;

  const onSave = () => {
    if (!booking || !canSave) return;
    update.mutate(
      { id: booking.id, bookingFeeUsd: parsedFee },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit booking fee</DialogTitle>
        </DialogHeader>

        {booking ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {booking.listing?.listingTitle ?? booking.bookingNumber} ·{' '}
              {booking.bookingNumber}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="booking-fee">Fee (USD)</Label>
              <NumberInput
                id="booking-fee"
                min={0.01}
                step="0.01"
                value={fee}
                onChange={(event) => setFee(event.target.value)}
                disabled={update.isPending}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current fee: {formatUsd(booking.bookingFeeUsd)}. The buyer is
              notified when you change this.
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={update.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave || update.isPending}
            onClick={onSave}
          >
            {update.isPending ? 'Saving…' : 'Save fee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
