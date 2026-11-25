'use client';

import { AdminDetailSheet } from '@/components/admin/shared/admin-detail-sheet';
import {
  DetailRow,
  DetailSection,
} from '@/components/admin/shared/detail-fields';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    <AdminDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={seller?.businessName ?? 'Seller details'}
      description={
        seller ? seller.sellerType.replaceAll('_', ' ') : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load seller.'}
        </p>
      ) : null}

      {seller && !isLoading ? (
        <>
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

          <DetailSection title="Business">
            <DetailRow label="Business email" value={seller.email} />
            <DetailRow label="Business phone" value={seller.phone} />
            <DetailRow
              label="Location"
              value={[seller.city, seller.country].filter(Boolean).join(', ')}
            />
            <DetailRow label="Verified at" value={formatDate(seller.verifiedAt)} />
            <DetailRow label="Joined" value={formatDate(seller.createdAt)} />
            <DetailRow label="Last updated" value={formatDate(seller.updatedAt)} />
            <DetailRow label="Listings" value={seller._count.listings} />
            <DetailRow label="Parts" value={seller._count.parts} />
          </DetailSection>

          <DetailSection title="Account owner">
            <DetailRow
              label="Name"
              value={
                [seller.user.firstName, seller.user.lastName]
                  .filter(Boolean)
                  .join(' ') || '—'
              }
            />
            <DetailRow label="Email" value={seller.user.email} />
            <DetailRow label="Phone" value={seller.user.phone ?? 'No phone'} />
            <DetailRow
              label="User status"
              value={seller.user.isActive ? 'Active user' : 'Inactive user'}
            />
          </DetailSection>
        </>
      ) : null}
    </AdminDetailSheet>
  );
}