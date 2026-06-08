'use client';

import Image from 'next/image';
import { PartActions } from '@/components/admin/part-actions';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { partDisplayStatus } from '@/lib/admin/part-status';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAdminCategories, useAdminPart } from '@/queries/admin';
import type { AdminPart, Category } from '@/types/admin/marketplace';

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl">
        {isLoading ? (
          <div className="space-y-4 px-6 py-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="aspect-[4/3] w-full rounded-md"
                />
              ))}
            </div>
          </div>
        ) : null}

        {isError ? (
          <p className="px-6 py-6 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load part.'}
          </p>
        ) : null}

        {part && !isLoading ? (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-xl">{part.name}</SheetTitle>
              <SheetDescription>
                {part.slug}
                {part.seller?.businessName
                  ? ` · ${part.seller.businessName}`
                  : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-6">
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
                <p className="text-sm text-muted-foreground">
                  No photos uploaded.
                </p>
              )}

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd>{categoryLabel(part.categorySlug, categories)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd>{part.condition}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Price</dt>
                  <dd className="font-medium">{formatUsd(part.priceUsd)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Stock</dt>
                  <dd>
                    {part.stockQuantity} ({part.stockLabel})
                  </dd>
                </div>
                {part.deliveryEstimate ? (
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd>{part.deliveryEstimate}</dd>
                  </div>
                ) : null}
                {part.hasWarranty ? (
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Warranty</dt>
                    <dd>{part.warrantyDetails ?? 'Yes'}</dd>
                  </div>
                ) : null}
              </dl>

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

              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Actions</p>
                <PartActions
                  part={part}
                  onEdit={() => onEdit(part)}
                  onDelete={() => onDelete(part)}
                  onActionComplete={() => onOpenChange(false)}
                />
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
