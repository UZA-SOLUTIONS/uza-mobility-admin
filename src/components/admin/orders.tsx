'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { OrderDetailSheet } from '@/components/admin/order-detail-sheet';
import { AdminErrorState } from '@/components/admin/shared/admin-error-state';
import { AdminFiltersBar } from '@/components/admin/shared/admin-filters-bar';
import { AdminTableEmpty } from '@/components/admin/shared/admin-table-empty';
import { AdminTableSkeletonRows } from '@/components/admin/shared/admin-table-skeleton-rows';
import { PageHeader } from '@/components/shared/page-header';
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
import { formatDate, formatInvoiceTotal } from '@/lib/admin/format';
import { formatSellerChannel } from '@/lib/auth/seller-profiles';
import { useAdminOrders } from '@/queries/commerce';
import { orderStatuses, type AdminOrdersFilters } from '@/types/admin/commerce';

export function AdminOrdersPanel() {
  const [filters, setFilters] = useState<AdminOrdersFilters>({
    page: 1,
    limit: 25,
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const queryFilters: AdminOrdersFilters = {
    ...filters,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error } = useAdminOrders(queryFilters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Track fulfillment stages and advance orders through the logistics pipeline."
      />

      <AdminFiltersBar>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={filters.status ?? 'ALL'}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                status:
                  value === 'ALL'
                    ? undefined
                    : (value as AdminOrdersFilters['status']),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:min-w-[260px]">
          <Label htmlFor="order-search">Search</Label>
          <Input
            id="order-search"
            placeholder="Order #, buyer email, vehicle…"
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
            error instanceof Error ? error.message : 'Failed to load orders.'
          }
        />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <AdminTableSkeletonRows columns={7} /> : null}
            {!isLoading && data?.items.length === 0 ? (
              <AdminTableEmpty
                colSpan={7}
                title="No orders match these filters"
                description="Try another status or search term."
              />
            ) : null}
            {!isLoading
              ? data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.invoice.invoiceNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.listing.listingTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.listing.brand} {order.listing.model}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatSellerChannel(order.sellerType)}
                    </TableCell>
                    <TableCell>
                      {formatInvoiceTotal(order.invoice)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingId(order.id);
                          setDetailOpen(true);
                        }}
                      >
                        View
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

      <OrderDetailSheet
        orderId={viewingId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setViewingId(null);
        }}
      />
    </div>
  );
}
