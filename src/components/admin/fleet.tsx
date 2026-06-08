'use client';

import { useState } from 'react';
import { FleetDetailSheet } from '@/components/admin/fleet-detail-sheet';
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
        title="Fleet"
        description="Review bulk vehicle requests and advance them through the quote workflow."
      />

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
        <div className="flex flex-1 flex-col gap-1.5 sm:max-w-md">
          <Label htmlFor="fleet-q">Search</Label>
          <div className="flex gap-2">
            <Input
              id="fleet-q"
              placeholder="Organization, contact, phone…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            />
            <Button type="button" variant="secondary" onClick={applySearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'Failed to load fleet requests.'}
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!isLoading && data?.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No fleet requests found.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.organizationName}
                </TableCell>
                <TableCell>
                  <div>{request.contactPerson}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.phone}
                  </div>
                </TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>{formatDate(request.createdAt)}</TableCell>
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
