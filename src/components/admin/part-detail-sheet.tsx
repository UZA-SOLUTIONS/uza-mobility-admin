'use client';

import Image from 'next/image';
import { PartActions } from '@/components/admin/part-actions';
import { AdminDetailSheet } from '@/components/admin/shared/admin-detail-sheet';
import {
  DetailRow,
  DetailSection,
} from '@/components/admin/shared/detail-fields';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { partDisplayStatus } from '@/lib/admin/part-status';
import { formatDateTime, formatUsd } from '@/lib/admin/format';
import { marketplaceSparePartsUrl } from '@/lib/marketplace-url';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminCategories, useAdminPart } from '@/queries/admin';
import type { AdminPart, Category } from '@/types/admin/marketplace';

function categoryLabel(slug: string, categories: Category[] | undefined) {
  const partsCategory = categories?.find(
    (c) => c.type === 'EV_PARTS_ACCESSORIES',
  );
  const match = partsCategory?.subcategories?.find((sub) => sub.slug === slug);
  return match?.name ?? slug;
}

type PartDetailSheetProps = {
  partId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (part: AdminPart) => void;
  onDelete: (part: AdminPart) => void;
};

export function PartDetailSheet({
  partId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: PartDetailSheetProps) {
  const {
    data: part,
    isLoading,
    isError,
    error,
  } = useAdminPart(open ? partId : null);
  const { data: categories } = useAdminCategories({ isActive: true }, open);

  const photos = part?.photos ?? [];

  const description = part
    ? [
        part.slug,
        part.seller?.businessName ? ` · ${part.seller.businessName}` : '',
      ].join('')
    : undefined;

  const showActions = Boolean(part && !isLoading);
  const partsMarketplaceHref = part
    ? marketplaceSparePartsUrl(part.categorySlug)
    : null;

  return (
    <AdminDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={part?.name ?? 'Part details'}
      description={description}
      footer={
        showActions && part ? (
          <PartActions
            part={part}
            onEdit={() => onEdit(part)}
            onDelete={() => onDelete(part)}
            onActionComplete={() => onOpenChange(false)}
          />
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3] w-full rounded-md" />
            ))}
          </div>
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load part.'}
        </p>
      ) : null}

      {part && !isLoading ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={partDisplayStatus(part)} />
          </div>

          {photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
                >
                  <Image
                    src={photo.url}
                    alt={part.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 33vw, 280px"
                    unoptimized
                  />
                  {photo.isPrimary ? (
                    <span className="absolute top-2 left-2 rounded bg-background/90 px-2 py-0.5 text-xs font-medium">
                      Primary
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photos uploaded.</p>
          )}

          <DetailSection title="Part details">
            <DetailRow
              label="Category"
              value={categoryLabel(part.categorySlug, categories)}
            />
            {partsMarketplaceHref ? (
              <DetailRow
                label="Marketplace"
                value={
                  <a
                    href={partsMarketplaceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View category on marketplace
                  </a>
                }
              />
            ) : null}
            <DetailRow label="Condition" value={part.condition} />
            <DetailRow label="Price" value={formatUsd(part.priceUsd)} />
            <DetailRow
              label="Stock"
              value={`${part.stockQuantity} (${part.stockLabel})`}
            />
            {part.deliveryEstimate ? (
              <DetailRow label="Delivery" value={part.deliveryEstimate} />
            ) : null}
            <DetailRow label="Active" value={part.isActive ? 'Yes' : 'No'} />
            <DetailRow
              label="Seller ID"
              value={<span className="font-mono text-xs">{part.sellerId ?? '—'}</span>}
            />
            <DetailRow label="Created" value={formatDateTime(part.createdAt)} />
            <DetailRow label="Updated" value={formatDateTime(part.updatedAt)} />
            {part.hasWarranty ? (
              <DetailRow
                label="Warranty"
                value={part.warrantyDetails ?? 'Yes'}
              />
            ) : null}
          </DetailSection>

          {part.compatibleBrands.length > 0 ||
          part.compatibleModels.length > 0 ? (
            <div className="space-y-2 text-sm">
              {part.compatibleBrands.length > 0 ? (
                <p>
                  <span className="font-medium">Compatible brands: </span>
                  {part.compatibleBrands.join(', ')}
                </p>
              ) : null}
              {part.compatibleModels.length > 0 ? (
                <p>
                  <span className="font-medium">Compatible models: </span>
                  {part.compatibleModels.join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}

          {part.description ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {part.description}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </AdminDetailSheet>
  );
}