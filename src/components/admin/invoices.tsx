'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/permissions';
import { FleetInvoiceFormDialog } from '@/components/admin/fleet-invoice-form-dialog';
import { InvoiceDetailSheet } from '@/components/admin/invoice-detail-sheet';
import { PageHeader } from '@/components/shared/page-header';
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
import { formatDate, formatUsd } from '@/lib/admin/format';
import { useAdminInvoices } from '@/queries/commerce';
import {
  invoiceStatuses,
  type AdminInvoicesFilters,
} from '@/types/admin/commerce';

export function AdminInvoicesPanel() {
  const { can, user, isSuperAdmin } = usePermissions();
  const [filters, setFilters] = useState<AdminInvoicesFilters>({
    page: 1,
    limit: 25,
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [fleetFormOpen, setFleetFormOpen] = useState(false);

  const roles = user?.roles ?? [];
  const showFleetCreate =
    can('invoices:send') &&
    (isSuperAdmin ||
      roles.includes('FLEET_ADMIN') ||
      roles.includes('FINANCE_ADMIN'));

  const queryFilters: AdminInvoicesFilters = {
    ...filters,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error } = useAdminInvoices(queryFilters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Invoices"
          description="Browse invoices, create fleet invoices for buyers, open documents, and cancel when needed."
        />
        {showFleetCreate ? (
          <Button onClick={() => setFleetFormOpen(true)}>Fleet invoice</Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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
                    : (value as AdminInvoicesFilters['status']),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {invoiceStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:min-w-[260px]">
          <Label htmlFor="invoice-search">Search</Label>
          <Input
            id="invoice-search"
            placeholder="Invoice #, buyer, pay ref…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setFilters((current) => ({ ...current, page: 1 }));
            }}
          />
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load invoices.'}
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
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
                  No invoices match these filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading
              ? data?.items.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.paymentReference}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{invoice.buyerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.buyerEmail ?? '—'}
                      </div>
                    </TableCell>
                    <TableCell>{formatUsd(invoice.totalAmountUsd)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invoice.issuedAt ?? invoice.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingId(invoice.id);
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

      <InvoiceDetailSheet
        invoiceId={viewingId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setViewingId(null);
        }}
      />

      <FleetInvoiceFormDialog
        open={fleetFormOpen}
        onOpenChange={setFleetFormOpen}
        onCreated={(invoiceId) => {
          setViewingId(invoiceId);
          setDetailOpen(true);
        }}
      />
    </div>
  );
}
