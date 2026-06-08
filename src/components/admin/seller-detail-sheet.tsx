'use client';

import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAdminSeller } from '@/queries/admin';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

type SellerDetailSheetProps = {
  sellerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SellerDetailSheet({
  sellerId,
  open,
  onOpenChange,
}: SellerDetailSheetProps) {
  const {
    data: seller,
    isLoading,
    isError,
    error,
  } = useAdminSeller(open ? sellerId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-xl">
        {isLoading ? (
          <div className="space-y-4 px-6 py-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {isError ? (
          <p className="px-6 py-6 text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load seller.'}
          </p>
        ) : null}

        {seller && !isLoading ? (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-xl">{seller.businessName}</SheetTitle>
              <SheetDescription>
                {seller.sellerType.replaceAll('_', ' ')}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-6">
              <div className="flex items-center gap-3">
                <StatusBadge status={seller.status} />
                <span
                  className={
                    seller.isVerified
                      ? 'text-sm text-emerald-600 dark:text-emerald-400'
                      : 'text-sm text-muted-foreground'
                  }
                >
                  {seller.isVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Business email</dt>
                  <dd>{seller.email ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Business phone</dt>
                  <dd>{seller.phone ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd>
                    {[seller.city, seller.country].filter(Boolean).join(', ')}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Verified at</dt>
                  <dd>{formatDate(seller.verifiedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd>{formatDate(seller.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd>{formatDate(seller.updatedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Listings</dt>
                  <dd>{seller._count.listings}</dd>
                </div>
                <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                  <dt className="text-muted-foreground">Parts</dt>
                  <dd>{seller._count.parts}</dd>
                </div>
              </dl>

              <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium">Account owner</p>
                <p>
                  {[seller.user.firstName, seller.user.lastName]
                    .filter(Boolean)
                    .join(' ') || '—'}
                </p>
                <p className="text-muted-foreground">{seller.user.email}</p>
                <p className="text-muted-foreground">
                  {seller.user.phone ?? 'No phone'} ·{' '}
                  {seller.user.isActive ? 'Active user' : 'Inactive user'}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
