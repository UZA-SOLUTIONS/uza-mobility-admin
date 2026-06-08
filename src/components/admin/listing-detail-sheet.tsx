'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ListingActions } from '@/components/admin/listing-actions';
import { canAdminEditOwnListing } from '@/lib/admin/listing-form';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import type { AdminListing } from '@/types/admin/marketplace';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function formatUsd(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

type ListingDetailSheetProps = {
  listing: AdminListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (listing: AdminListing) => void;
  canEdit?: boolean;
};

export function ListingDetailSheet({
  listing,
  open,
  onOpenChange,
  onEdit,
  canEdit = false,
}: ListingDetailSheetProps) {
  const { data: session } = useSession();
  const showEdit =
    canEdit &&
    listing &&
    onEdit &&
    canAdminEditOwnListing(listing, session?.user?.id);

  if (!listing) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl">{listing.listingTitle}</SheetTitle>
          <SheetDescription>
            {listing.brand} {listing.model} · {listing.manufacturingYear}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={listing.status} />
            <span className="text-xs text-muted-foreground">
              {formatSellerChannel(listing.sellerType)}
            </span>
            {listing.isFeatured ? (
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                Featured
              </span>
            ) : null}
            {listing.isHotDeal ? (
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                Hot deal
              </span>
            ) : null}
          </div>

          {listing.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {listing.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
                >
                  <Image
                    src={photo.url}
                    alt={photo.altText ?? listing.listingTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 33vw, 280px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photos uploaded.</p>
          )}

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Price</dt>
              <dd className="font-medium">
                {formatUsd(listing.listingPricing?.finalPriceUsd)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Seller profile</dt>
              <dd className="font-medium">{listing.seller.businessName}</dd>
            </div>
            {listing.createdBy ? (
              <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-muted-foreground">Created by</dt>
                <dd>
                  {listing.createdBy.firstName} {listing.createdBy.lastName}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Category</dt>
              <dd>
                {listing.category.name}
                {listing.subcategory ? ` · ${listing.subcategory.name}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
              <dt className="text-muted-foreground">Location</dt>
              <dd>
                {[listing.city, listing.country].filter(Boolean).join(', ') ||
                  listing.vehicleLocation ||
                  '—'}
              </dd>
            </div>
            {listing.mileageKm != null ? (
              <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                <dt className="text-muted-foreground">Mileage</dt>
                <dd>{listing.mileageKm.toLocaleString()} km</dd>
              </div>
            ) : null}
          </dl>

          {listing.description ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">
                {listing.description}
              </p>
            </div>
          ) : null}

          {listing.adminNotes ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Admin notes</p>
              <p className="mt-1 whitespace-pre-wrap">{listing.adminNotes}</p>
            </div>
          ) : null}

          {showEdit ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => onEdit(listing)}
            >
              Edit listing
            </Button>
          ) : null}

          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Actions</p>
            <ListingActions
              listing={listing}
              onActionComplete={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
