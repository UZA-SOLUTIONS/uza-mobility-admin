'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ListingActions } from '@/components/admin/listing-actions';
import {
  DetailRow,
  DetailSection,
  formatDateTime,
  formatEnumLabel,
  formatRegistrationStatus,
  formatUsd,
} from '@/components/admin/shared/detail-fields';
import { canAdminEditOwnListing } from '@/lib/admin/listing-form';
import { listingPricingToBreakdown } from '@/lib/admin/listing-pricing';
import { PricingBreakdown } from '@/components/shared/pricing-breakdown';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import { adminDetailSheetClassName } from '@/lib/admin/detail-sheet';
import type { AdminListing } from '@/types/admin/marketplace';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

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

  const pricing = listing.listingPricing;
  const pricingBreakdown = listingPricingToBreakdown(
    pricing,
    listing.sellerType,
  );
  const ev = listing.evSpecs;
  const verification = listing.verificationReport;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`${adminDetailSheetClassName} overflow-y-auto`}>
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl">{listing.listingTitle}</SheetTitle>
          <SheetDescription>
            {listing.brand} {listing.model}
            {listing.trim ? ` ${listing.trim}` : ''} ·{' '}
            {listing.manufacturingYear}
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
            {listing.isFullOption ? (
              <span className="rounded bg-muted px-2 py-0.5 text-xs">
                Full option
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

          <DetailSection title="Overview">
            <DetailRow label="Slug" value={listing.slug} />
            <DetailRow
              label="Verification"
              value={formatEnumLabel(listing.verificationLevel)}
            />
            <DetailRow
              label="Category"
              value={`${listing.category.name}${listing.subcategory ? ` · ${listing.subcategory.name}` : ''}`}
            />
            <DetailRow
              label="Location"
              value={
                [listing.city, listing.country].filter(Boolean).join(', ') ||
                listing.vehicleLocation ||
                '—'
              }
            />
            <DetailRow
              label="Delivery estimate"
              value={
                listing.deliveryEstimateDays != null
                  ? `${listing.deliveryEstimateDays} days`
                  : '—'
              }
            />
            <DetailRow
              label="Created"
              value={formatDateTime(listing.createdAt)}
            />
            <DetailRow
              label="Updated"
              value={formatDateTime(listing.updatedAt)}
            />
            <DetailRow
              label="Published"
              value={formatDateTime(listing.publishedAt)}
            />
          </DetailSection>

          <DetailSection title="Vehicle">
            <DetailRow
              label="Condition"
              value={formatEnumLabel(listing.condition)}
            />
            <DetailRow
              label="Body type"
              value={formatEnumLabel(listing.bodyType)}
            />
            <DetailRow
              label="Powertrain"
              value={formatEnumLabel(listing.powertrainType)}
            />
            <DetailRow label="Color" value={listing.color} />
            <DetailRow label="Seats" value={listing.seats} />
            <DetailRow
              label="Steering"
              value={formatEnumLabel(listing.steeringPosition)}
            />
            <DetailRow
              label="Drivetrain"
              value={formatEnumLabel(listing.drivetrain)}
            />
            <DetailRow
              label="Mileage"
              value={
                listing.mileageKm != null
                  ? `${listing.mileageKm.toLocaleString()} km`
                  : '—'
              }
            />
            <DetailRow
              label="Registration"
              value={formatRegistrationStatus(listing.registrationStatus)}
            />
            <DetailRow label="Ownership count" value={listing.ownershipCount} />
            <DetailRow
              label="Warranty"
              value={listing.hasWarranty ? 'Yes' : 'No'}
            />
            {listing.hasWarranty && listing.warrantyDetails ? (
              <DetailRow
                label="Warranty details"
                value={listing.warrantyDetails}
              />
            ) : null}
            <DetailRow
              label="Accident history"
              value={listing.hasAccidentHistory ? 'Yes' : 'No'}
            />
          </DetailSection>

          {ev ? (
            <DetailSection title="EV specifications">
              <DetailRow
                label="Range"
                value={ev.rangeKm != null ? `${ev.rangeKm} km` : '—'}
              />
              <DetailRow
                label="Battery"
                value={
                  ev.batteryCapacityKwh != null
                    ? `${ev.batteryCapacityKwh} kWh`
                    : '—'
                }
              />
              <DetailRow
                label="Battery health"
                value={
                  ev.batteryHealthPercent != null
                    ? `${ev.batteryHealthPercent}%`
                    : '—'
                }
              />
              <DetailRow
                label="Health report"
                value={ev.batteryHealthReport ? 'Available' : 'No'}
              />
              <DetailRow label="Charging type" value={ev.chargingType} />
              <DetailRow
                label="Fast charging"
                value={ev.fastChargingSupported ? 'Yes' : 'No'}
              />
              <DetailRow
                label="Charge time"
                value={
                  ev.chargingTimeHours != null
                    ? `${ev.chargingTimeHours} hrs`
                    : '—'
                }
              />
              <DetailRow
                label="Motor power"
                value={ev.motorPowerKw != null ? `${ev.motorPowerKw} kW` : '—'}
              />
              <DetailRow
                label="Top speed"
                value={ev.topSpeedKmh != null ? `${ev.topSpeedKmh} km/h` : '—'}
              />
              <DetailRow
                label="Payload"
                value={
                  ev.payloadCapacityKg != null
                    ? `${ev.payloadCapacityKg} kg`
                    : '—'
                }
              />
              <DetailRow
                label="GVW"
                value={
                  ev.grossVehicleWeightKg != null
                    ? `${ev.grossVehicleWeightKg} kg`
                    : '—'
                }
              />
            </DetailSection>
          ) : null}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Pricing</h3>
            {pricingBreakdown ? (
              <PricingBreakdown
                breakdown={pricingBreakdown}
                sellerType={listing.sellerType}
              />
            ) : (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <DetailRow
                  label="List price"
                  value={formatUsd(pricing?.finalPriceUsd)}
                />
              </dl>
            )}
          </div>

          <DetailSection title="Seller & creator">
            <DetailRow label="Seller" value={listing.seller.businessName} />
            <DetailRow
              label="Seller location"
              value={[listing.seller.city, listing.seller.country]
                .filter(Boolean)
                .join(', ')}
            />
            <DetailRow
              label="Seller verified"
              value={listing.seller.isVerified ? 'Yes' : 'No'}
            />
            {listing.createdBy ? (
              <>
                <DetailRow
                  label="Created by"
                  value={`${listing.createdBy.firstName} ${listing.createdBy.lastName}`}
                />
                <DetailRow
                  label="Creator email"
                  value={listing.createdBy.email}
                />
              </>
            ) : null}
          </DetailSection>

          {listing.useCaseTags && listing.useCaseTags.length > 0 ? (
            <DetailSection title="Use cases">
              <DetailRow
                label="Tags"
                value={listing.useCaseTags
                  .map((tag) => formatEnumLabel(tag.useCase))
                  .join(', ')}
                className="sm:col-span-2"
              />
            </DetailSection>
          ) : null}

          {verification ? (
            <DetailSection title="Verification report">
              <DetailRow
                label="Level"
                value={formatEnumLabel(verification.verificationLevel)}
              />
              <DetailRow
                label="Inspection"
                value={verification.inspectionStatus}
              />
              <DetailRow
                label="Battery report"
                value={verification.batteryReportStatus}
              />
              <DetailRow
                label="Documents"
                value={verification.documentStatus}
              />
              <DetailRow
                label="Verified at"
                value={formatDateTime(verification.verifiedAt)}
              />
              {verification.reportUrl ? (
                <DetailRow
                  label="Report"
                  value={
                    <Link
                      href={verification.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View report
                    </Link>
                  }
                />
              ) : null}
              {verification.batteryReportUrl ? (
                <DetailRow
                  label="Battery report file"
                  value={
                    <Link
                      href={verification.batteryReportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      View battery report
                    </Link>
                  }
                />
              ) : null}
            </DetailSection>
          ) : null}

          {(listing.videoUrl || listing.brochureUrl) && (
            <DetailSection title="Media">
              {listing.videoUrl ? (
                <DetailRow
                  label="Video"
                  value={
                    <Link
                      href={listing.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Open video
                    </Link>
                  }
                />
              ) : null}
              {listing.brochureUrl ? (
                <DetailRow
                  label="Brochure"
                  value={
                    <Link
                      href={listing.brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Download brochure
                    </Link>
                  }
                />
              ) : null}
            </DetailSection>
          )}

          {listing.description ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
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
