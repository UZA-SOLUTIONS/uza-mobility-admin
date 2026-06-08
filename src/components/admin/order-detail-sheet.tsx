'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/permissions';
import { formatDate, formatDateTime, formatUsd } from '@/lib/admin/format';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import {
  useAdminOrder,
  useAdvanceOrder,
  useCancelOrder,
} from '@/queries/commerce';
import { advanceOrderSchema, type AdvanceOrderInput } from '@/schemas/commerce';

type OrderDetailSheetProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const { can, isSuperAdmin } = usePermissions();
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useAdminOrder(open ? orderId : null);
  const advance = useAdvanceOrder();
  const cancel = useCancelOrder();
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const form = useForm<AdvanceOrderInput>({
    resolver: zodResolver(advanceOrderSchema),
    defaultValues: { description: '', location: '' },
  });

  const busy = advance.isPending || cancel.isPending;
  const canAdvance =
    order &&
    order.status !== 'DELIVERED' &&
    order.status !== 'CANCELLED' &&
    can('orders:update-status');

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl">
          {isLoading ? (
            <div className="space-y-4 px-6 py-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}

          {isError ? (
            <p className="px-6 py-6 text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load order.'}
            </p>
          ) : null}

          {order && !isLoading ? (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">{order.orderNumber}</SheetTitle>
                <SheetDescription>
                  {order.listing.listingTitle} ·{' '}
                  {formatSellerChannel(order.sellerType)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <StatusBadge status={order.status} />

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Vehicle</dt>
                    <dd>
                      {order.listing.brand} {order.listing.model} ·{' '}
                      {order.listing.manufacturingYear}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Invoice</dt>
                    <dd>{order.invoice.invoiceNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium">
                      {formatUsd(order.invoice.totalAmountUsd)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>
                      {[order.deliveryCity, order.deliveryCountry]
                        .filter(Boolean)
                        .join(', ') ||
                        order.deliveryAddress ||
                        '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Est. delivery</dt>
                    <dd>{formatDate(order.estimatedDeliveryDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Actual delivery</dt>
                    <dd>{formatDate(order.actualDeliveryDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDateTime(order.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd>{formatDateTime(order.updatedAt)}</dd>
                  </div>
                </dl>

                {order.handoverNotes ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Handover notes</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {order.handoverNotes}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <p className="text-sm font-medium">Tracking timeline</p>
                  {order.trackingEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No tracking events yet.
                    </p>
                  ) : (
                    <ol className="space-y-3 border-l pl-4">
                      {order.trackingEvents.map((event) => (
                        <li key={event.id} className="relative text-sm">
                          <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-primary" />
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(event.occurredAt)}
                            {event.location ? ` · ${event.location}` : ''}
                          </p>
                          {event.description ? (
                            <p className="mt-1 text-muted-foreground">
                              {event.description}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
                  {canAdvance ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => setAdvanceOpen(true)}
                    >
                      Advance status
                    </Button>
                  ) : null}
                  {isSuperAdmin && order.status !== 'CANCELLED' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel order
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={advanceOpen} onOpenChange={setAdvanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance order</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((values) => {
              if (!order) return;
              advance.mutate(
                { id: order.id, body: values },
                {
                  onSuccess: () => {
                    setAdvanceOpen(false);
                    form.reset();
                  },
                },
              );
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="advance-location">Location (optional)</Label>
              <Input id="advance-location" {...form.register('location')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="advance-desc">Note (optional)</Label>
              <Textarea
                id="advance-desc"
                rows={3}
                {...form.register('description')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdvanceOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Advance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order?"
        description={
          order
            ? `${order.orderNumber} will be cancelled. This is restricted to administrators.`
            : ''
        }
        confirmLabel="Cancel order"
        variant="destructive"
        loading={cancel.isPending}
        onConfirm={() => {
          if (!order) return;
          cancel.mutate(order.id, {
            onSuccess: () => {
              setCancelOpen(false);
              onOpenChange(false);
            },
          });
        }}
      />
    </>
  );
}
