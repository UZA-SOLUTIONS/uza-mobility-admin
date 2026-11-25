'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/permissions';
import { PageHeader } from '@/components/shared/page-header';
import { SellerDetailSheet } from '@/components/admin/seller-detail-sheet';
import { AdminErrorState } from '@/components/admin/shared/admin-error-state';
import { AdminFiltersBar } from '@/components/admin/shared/admin-filters-bar';
import { AdminTableEmpty } from '@/components/admin/shared/admin-table-empty';
import { AdminTableSkeletonRows } from '@/components/admin/shared/admin-table-skeleton-rows';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdminSellers,
  useReactivateSeller,
  useSuspendSeller,
  useVerifySeller,
} from '@/queries/admin';
import {
  sellerStatuses,
  type AdminSeller,
  type AdminSellersFilters,
  type SellerStatus,
} from '@/types/admin/marketplace';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(
    new Date(value),
  );
}

function SellerActions({
  seller,
  onView,
}: {
  seller: AdminSeller;
  onView: () => void;
}) {
  const { can } = usePermissions();
  const verify = useVerifySeller();
  const suspend = useSuspendSeller();
  const reactivate = useReactivateSeller();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');

  const busy = verify.isPending || suspend.isPending || reactivate.isPending;

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1">
        <Button size="sm" variant="ghost" disabled={busy} onClick={onView}>
          View
        </Button>
        {!seller.isVerified &&
        seller.status !== 'SUSPENDED' &&
        can('sellers:verify') ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => verify.mutate(seller.id)}
          >
            Verify
          </Button>
        ) : null}
        {seller.status !== 'SUSPENDED' && can('sellers:suspend') ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setSuspendOpen(true)}
          >
            Suspend
          </Button>
        ) : null}
        {seller.status === 'SUSPENDED' && can('sellers:suspend') ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => reactivate.mutate(seller.id)}
          >
            Reactivate
          </Button>
        ) : null}
      </div>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend seller</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Internal note (optional)</Label>
            <Textarea
              id="suspend-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() =>
                suspend.mutate(
                  { id: seller.id, body: { reason: reason || undefined } },
                  { onSuccess: () => setSuspendOpen(false) },
                )
              }
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminSellersPanel() {
  const [filters, setFilters] = useState<AdminSellersFilters>({
    page: 1,
    limit: 25,
  });
  const [search, setSearch] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const queryFilters: AdminSellersFilters = {
    ...filters,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error } = useAdminSellers(queryFilters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sellers"
        description="Verify and suspend marketplace dealers (not UZA platform inventory profiles)."
      />

      <AdminFiltersBar>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                status: value === 'ALL' ? undefined : (value as SellerStatus),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {sellerStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Verified</Label>
          <Select
            value={
              filters.isVerified === undefined
                ? 'ALL'
                : filters.isVerified
                  ? 'true'
                  : 'false'
            }
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                isVerified: value === 'ALL' ? undefined : value === 'true',
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Any</SelectItem>
              <SelectItem value="true">Verified</SelectItem>
              <SelectItem value="false">Not verified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:min-w-[260px]">
          <Label htmlFor="seller-search">Search</Label>
          <Input
            id="seller-search"
            placeholder="Business name, email, city…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setFilters((current) => ({ ...current, page: 1 }));
            }}
          />
        </div>
      </AdminFiltersBar>

      {isError ? (
        <AdminErrorState
          message={
            error instanceof Error ? error.message : 'Failed to load sellers.'
          }
        />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <AdminTableSkeletonRows columns={7} /> : null}
            {!isLoading && data?.items.length === 0 ? (
              <AdminTableEmpty
                colSpan={7}
                title="No sellers match these filters"
                description="Try another status, verification filter, or search term."
              />
            ) : null}
            {!isLoading
              ? data?.items.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell>
                      <div className="font-medium">{seller.businessName}</div>
                      <div className="text-xs text-muted-foreground">
                        {seller.city ?? '—'}, {seller.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{seller.user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {seller.phone ?? seller.user.phone ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {seller.sellerType.replaceAll('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={seller.status} />
                      {seller.isVerified ? (
                        <span className="mt-1 block text-xs text-emerald-600 dark:text-emerald-400">
                          Verified
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{seller._count.listings}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(seller.createdAt)}
                    </TableCell>
                    <TableCell>
                      <SellerActions
                        seller={seller}
                        onView={() => {
                          setSelectedSellerId(seller.id);
                          setDetailOpen(true);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <SellerDetailSheet
        sellerId={selectedSellerId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedSellerId(null);
        }}
      />

      {data?.meta ? (
        <PaginationBar
          meta={data.meta}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}
    </div>
  );
}
