'use client';

import { useState } from 'react';
import { FleetDetailSheet } from '@/components/admin/fleet-detail-sheet';
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
import { formatDate } from '@/lib/admin/format';
import { useAdminFleet } from '@/queries/operations';
import {
  fleetRequestStatuses,
  type AdminFleetFilters,
  type FleetRequest,
} from '@/types/admin/operations';

export function AdminFleetPanel() {
  const [filters, setFilters] = useState<AdminFleetFilters>({
    page: 1,
    limit: 25,
  });
  const [qInput, setQInput] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, error } = useAdminFleet(filters);

  const openDetail = (request: FleetRequest) => {
    setSelectedId(request.id);
    setDetailOpen(true);
  };

  const applySearch = () => {
    setFilters((current) => ({
      ...current,
      q: qInput.trim() || undefined,
      page: 1,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet requests"
        description="Review bulk vehicle inquiries from the For Business page — contact details, fleet size, and request PDFs."
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
                    : (value as AdminFleetFilters['status']),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {fleetRequestStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xl">
          <Label htmlFor="fleet-q">Search</Label>
          <div className="flex gap-2">
            <Input
              id="fleet-q"
              placeholder="Reference, organization, email, contact, phone…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            />
            <Button type="button" variant="secondary" onClick={applySearch}>
              Search
            </Button>
          </div>
        </div>
      </AdminFiltersBar>

      {isError ? (
        <AdminErrorState
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load fleet requests.'
          }
        />
      ) : null}

      <div className="w-full overflow-x-auto rounded-lg border">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <AdminTableSkeletonRows columns={8} /> : null}
            {!isLoading && data?.items.length === 0 ? (
              <AdminTableEmpty
                colSpan={8}
                title="No fleet requests found"
                description="Try another status or search term."
              />
            ) : null}
            {data?.items.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {request.referenceNumber}
                </TableCell>
                <TableCell className="font-medium">
                  {request.organizationName}
                </TableCell>
                <TableCell>
                  <div>{request.contactPerson}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.phone}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm">
                  {request.email}
                </TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(request.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetail(request)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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

      <FleetDetailSheet
        requestId={selectedId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
