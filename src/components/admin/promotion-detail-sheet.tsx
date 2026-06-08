'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { PromotionListingAttach } from '@/components/admin/promotion-listing-attach';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/permissions';
import { isListingDiscountType } from '@/lib/admin/promotion-config';
import { formatDate, formatUsd } from '@/lib/admin/format';
import {
  useActivatePromotion,
  useAdminPromotion,
  useDeactivatePromotion,
  useDetachPromotionListing,
} from '@/queries/operations';
import type { AdminPromotion } from '@/types/admin/operations';

type PromotionDetailSheetProps = {
  promotionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (promotion: AdminPromotion) => void;
  /** Shown after create — nudge to attach listings. */
  focusAttach?: boolean;
};

export function PromotionDetailSheet({
  promotionId,
  open,
  onOpenChange,
  onEdit,
  focusAttach = false,
}: PromotionDetailSheetProps) {
  const { can } = usePermissions();
  const {
    data: promotion,
    isLoading,
    isError,
    error,
  } = useAdminPromotion(open ? promotionId : null);
  const detach = useDetachPromotionListing();
  const deactivate = useDeactivatePromotion();
  const activate = useActivatePromotion();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

  const linked = promotion?.listings ?? [];
  const attachedIds = useMemo(
    () => new Set(linked.map((row) => row.listing.id)),
    [linked],
  );

  const busy = detach.isPending || deactivate.isPending || activate.isPending;
  const promotionEnded = promotion && new Date(promotion.endDate) < new Date();
  const needsListings =
    promotion && isListingDiscountType(promotion.type) && linked.length === 0;

  const handleDetach = (listingId: string) => {
    if (!promotion) return;
    detach.mutate({ promotionId: promotion.id, listingId });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {isLoading ? (
            <div className="space-y-4 px-6 py-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : null}

          {isError ? (
            <p className="px-6 py-6 text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : 'Failed to load promotion.'}
            </p>
          ) : null}

          {promotion && !isLoading ? (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">{promotion.name}</SheetTitle>
                <SheetDescription>
                  {promotion.type.replaceAll('_', ' ')} ·{' '}
                  {formatDate(promotion.startDate)} –{' '}
                  {formatDate(promotion.endDate)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={
                      promotion.isActive
                        ? 'ACTIVE'
                        : promotionEnded
                          ? 'EXPIRED'
                          : 'CANCELLED'
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {linked.length} listing{linked.length === 1 ? '' : 's'}{' '}
                    attached
                  </span>
                </div>

                {(focusAttach || needsListings) && can('promotions:manage') ? (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                    Attach at least one listing below so this offer applies on
                    the marketplace.
                  </p>
                ) : null}

                {promotion.bannerImageUrl ? (
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border">
                    <Image
                      src={promotion.bannerImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {promotion.discountAmountUsd != null ? (
                    <div>
                      <dt className="text-muted-foreground">Discount</dt>
                      <dd>{formatUsd(promotion.discountAmountUsd)}</dd>
                    </div>
                  ) : null}
                  {promotion.discountPercent != null ? (
                    <div>
                      <dt className="text-muted-foreground">Discount %</dt>
                      <dd>{promotion.discountPercent}%</dd>
                    </div>
                  ) : null}
                  {promotion.bannerPlacement ? (
                    <div>
                      <dt className="text-muted-foreground">Placement</dt>
                      <dd>{promotion.bannerPlacement.replaceAll('_', ' ')}</dd>
                    </div>
                  ) : null}
                  {promotion.clickUrl ? (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Partner link</dt>
                      <dd className="break-all">{promotion.clickUrl}</dd>
                    </div>
                  ) : null}
                </dl>

                {can('promotions:manage') ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(promotion)}
                    >
                      Edit
                    </Button>
                    {promotion.isActive ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busy}
                        onClick={() => setDeactivateOpen(true)}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy || promotionEnded}
                          onClick={() => setActivateOpen(true)}
                        >
                          Reactivate
                        </Button>
                        {promotionEnded ? (
                          <p className="w-full text-xs text-muted-foreground">
                            This campaign has ended. Edit the promotion and
                            extend the end date before reactivating.
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}

                {linked.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Attached listings</p>
                    <ul className="divide-y rounded-lg border text-sm">
                      {linked.map((row) => (
                        <li
                          key={row.listing.id}
                          className="flex items-center justify-between gap-2 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {row.listing.listingTitle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {row.listing.status.replaceAll('_', ' ')}
                            </p>
                          </div>
                          {can('promotions:manage') ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => handleDetach(row.listing.id)}
                            >
                              Detach
                            </Button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No listings attached yet.
                  </p>
                )}

                {can('promotions:manage') ? (
                  <PromotionListingAttach
                    promotionId={promotion.id}
                    promotionType={promotion.type}
                    attachedListingIds={attachedIds}
                  />
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate promotion?"
        description="This promotion will no longer appear on the storefront. You can reactivate it later if the campaign period has not ended."
        confirmLabel="Deactivate"
        variant="destructive"
        loading={deactivate.isPending}
        onConfirm={() => {
          if (!promotion) return;
          deactivate.mutate(promotion.id, {
            onSuccess: () => {
              setDeactivateOpen(false);
            },
          });
        }}
      />

      <ConfirmDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Reactivate promotion?"
        description="This promotion will be eligible on the storefront again for attached listings (within its date range)."
        confirmLabel="Reactivate"
        loading={activate.isPending}
        onConfirm={() => {
          if (!promotion) return;
          activate.mutate(promotion.id, {
            onSuccess: () => {
              setActivateOpen(false);
            },
          });
        }}
      />
    </>
  );
}
