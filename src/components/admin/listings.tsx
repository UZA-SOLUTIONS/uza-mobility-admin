'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/permissions';
import { PageHeader } from '@/components/shared/page-header';
import { ListingFormDialog } from '@/components/admin/listing-form-dialog';
import { ListingDetailSheet } from '@/components/admin/listing-detail-sheet';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminListings } from '@/queries/admin';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import {
  adminListingChannelTypes,
  listingStatuses,
  type AdminListing,
  type AdminListingsFilters,
  type ListingStatus,
} from '@/types/admin/marketplace';

function formatUsd(value: number | null | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminListingsPanel() {
  const { can } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<AdminListing | null>(
    null,
  );
  const [filters, setFilters] = useState<AdminListingsFilters>({
    page: 1,
    limit: 25,
  });
  const [sellerIdInput, setSellerIdInput] = useState('');
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedSellerId = useDebounce(sellerIdInput, 400);

  const queryFilters: AdminListingsFilters = {
    ...filters,
    sellerId: debouncedSellerId || undefined,
  };

  const { data, isLoading, isError, error } = useAdminListings(queryFilters);

  const setStatus = (status: string) => {
    setFilters((current) => ({
      ...current,
      status: status === 'ALL' ? undefined : (status as ListingStatus),
      page: 1,
    }));
  };

  const openDetail = (listing: AdminListing) => {
    setSelectedListing(listing);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Listings"
          description="Create UZA stock/sourcing listings, review queue, and publishing."
        />
        {can('listings:create') ? (
          <Button onClick={() => setCreateOpen(true)}>New listing</Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={filters.status ?? 'ALL'} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {listingStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Channel</Label>
          <Select
            value={filters.sellerType ?? 'ALL'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                sellerType:
                  value === 'ALL'
                    ? undefined
                    : (value as AdminListingsFilters['sellerType']),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All channels</SelectItem>
              {adminListingChannelTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatSellerChannel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load listings.'}
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <TableCell key={cell}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
            {!isLoading && data?.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No listings match these filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading
              ? data?.items.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="font-medium">{listing.listingTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {listing.brand} {listing.model} ·{' '}
                        {listing.category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{listing.seller.businessName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatSellerChannel(listing.sellerType)}
                        {' · '}
                        {listing.seller.city ?? listing.seller.country}
                        {listing.seller.isVerified ? ' · Verified' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={listing.status} />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {listing.isFeatured ? (
                          <span className="text-xs text-muted-foreground">
                            Featured
                          </span>
                        ) : null}
                        {listing.isHotDeal ? (
                          <span className="text-xs text-muted-foreground">
                            Hot deal
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatUsd(listing.listingPricing?.finalPriceUsd)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(listing.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(listing)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      {data?.meta ? (
        <PaginationBar
          meta={data.meta}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}

      <ListingDetailSheet
        listing={selectedListing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canEdit={can('listings:create')}
        onEdit={(listing) => {
          setDetailOpen(false);
          setEditingListing(listing);
        }}
      />

      <ListingFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <ListingFormDialog
        open={Boolean(editingListing)}
        onOpenChange={(open) => {
          if (!open) setEditingListing(null);
        }}
        listing={editingListing}
      />
    </div>
  );
}
