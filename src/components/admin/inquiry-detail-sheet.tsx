'use client';

import Link from 'next/link';
import {
  DetailRow,
  DetailSection,
  formatDateTime,
  formatEnumLabel,
} from '@/components/admin/shared/detail-fields';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { adminDetailSheetClassName } from '@/lib/admin/detail-sheet';
import type { AdminInquiry } from '@/types/admin/inquiries';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type InquiryDetailSheetProps = {
  inquiry: AdminInquiry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InquiryDetailSheet({
  inquiry,
  open,
  onOpenChange,
}: InquiryDetailSheetProps) {
  if (!inquiry) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={`${adminDetailSheetClassName} overflow-y-auto`}>
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle>{inquiry.quoteNumber}</SheetTitle>
          <SheetDescription>
            {inquiry.listing?.listingTitle ?? inquiry.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={inquiry.status} />
            <span className="text-xs text-muted-foreground">
              {formatEnumLabel(inquiry.buyerType)}
            </span>
          </div>

          <DetailSection title="Buyer">
            <DetailRow label="Name" value={inquiry.name} />
            <DetailRow label="Email" value={inquiry.email} />
            <DetailRow label="Phone" value={inquiry.phone} />
            <DetailRow label="Country" value={inquiry.country} />
            <DetailRow
              label="Submitted"
              value={formatDateTime(inquiry.createdAt)}
            />
          </DetailSection>

          {inquiry.listing ? (
            <DetailSection title="Vehicle">
              <DetailRow label="Title" value={inquiry.listing.listingTitle} />
              <DetailRow
                label="Make / model"
                value={`${inquiry.listing.brand} ${inquiry.listing.model}`}
              />
              <DetailRow
                label="Year"
                value={inquiry.listing.manufacturingYear}
              />
              <DetailRow
                label="Listing"
                value={
                  <Link
                    href={`/vehicles/${inquiry.listing.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View on marketplace
                  </Link>
                }
              />
            </DetailSection>
          ) : null}

          {inquiry.message ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Message</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {inquiry.message}
              </p>
            </div>
          ) : null}

          {inquiry.internalNotes ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
              <p className="font-medium text-amber-900">Internal notes</p>
              <p className="mt-1 whitespace-pre-wrap text-amber-950">
                {inquiry.internalNotes}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" asChild>
              <a href={`mailto:${inquiry.email}`}>Email buyer</a>
            </Button>
            {inquiry.quotePdfUrl ? (
              <Button type="button" size="sm" variant="secondary" asChild>
                <a
                  href={inquiry.quotePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open quote PDF
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
