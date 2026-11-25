'use client';

import { useState } from 'react';
import { SuperAdminGate } from '@/components/admin/super-admin-gate';
import { AdminErrorState } from '@/components/admin/shared/admin-error-state';
import { AdminFiltersBar } from '@/components/admin/shared/admin-filters-bar';
import { AdminTableEmpty } from '@/components/admin/shared/admin-table-empty';
import { AdminTableSkeletonRows } from '@/components/admin/shared/admin-table-skeleton-rows';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTime } from '@/lib/admin/format';
import { useAdminActivityLogs } from '@/queries/platform';
import type { ActivityLogsFilters } from '@/types/admin/platform';

function metadataPreview(metadata: Record<string, unknown> | null) {
  if (!metadata || Object.keys(metadata).length === 0) return '—';
  const email =
    (metadata.email as string) ||
    (metadata.performerEmail as string) ||
    (metadata.targetEmail as string);
  if (email) return email;
  try {
    const text = JSON.stringify(metadata, null, 0);
    return text.length > 96 ? `${text.slice(0, 96)}…` : text;
  } catch {
    return '—';
  }
}

export function AdminActivityLogsPanel() {
  const [filters, setFilters] = useState<ActivityLogsFilters>({
    page: 1,
    limit: 25,
  });
  const [emailInput, setEmailInput] = useState('');
  const [actionInput, setActionInput] = useState('');
  const [entityInput, setEntityInput] = useState('');

  const { data, isLoading, isError, error } = useAdminActivityLogs(filters);

  const applyFilters = () => {
    setFilters((current) => ({
      ...current,
      email: emailInput.trim() || undefined,
      action: actionInput.trim() || undefined,
      entity: entityInput.trim() || undefined,
      page: 1,
    }));
  };

  return (
    <SuperAdminGate>
      <div className="space-y-6">
        <PageHeader
          title="Activity logs"
          description="Platform audit trail — logins, role changes, and admin actions."
        />

        <AdminFiltersBar className="lg:flex-row lg:flex-wrap lg:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="log-email">Email</Label>
            <Input
              id="log-email"
              type="email"
              placeholder="user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log-action">Action</Label>
            <Input
              id="log-action"
              placeholder="auth:login"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="log-entity">Entity</Label>
            <Input
              id="log-entity"
              placeholder="User"
              value={entityInput}
              onChange={(e) => setEntityInput(e.target.value)}
            />
          </div>
          <DatePickerField
            id="log-from"
            label="From"
            value={filters.from?.slice(0, 10) ?? ''}
            disableFuture
            maxDate={filters.to ? new Date(filters.to.slice(0, 10)) : undefined}
            onChange={(from) =>
              setFilters((current) => ({
                ...current,
                from: from || undefined,
                page: 1,
              }))
            }
          />
          <DatePickerField
            id="log-to"
            label="To"
            value={filters.to?.slice(0, 10) ?? ''}
            disableFuture
            minDate={
              filters.from ? new Date(filters.from.slice(0, 10)) : undefined
            }
            onChange={(to) =>
              setFilters((current) => ({
                ...current,
                to: to || undefined,
                page: 1,
              }))
            }
          />
          <Button type="button" variant="secondary" onClick={applyFilters}>
            Apply filters
          </Button>
        </AdminFiltersBar>

        {isError ? (
          <AdminErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Failed to load activity logs.'
            }
          />
        ) : null}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor / detail</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <AdminTableSkeletonRows columns={5} rows={6} />
              ) : null}
              {data?.items.length === 0 && !isLoading ? (
                <AdminTableEmpty
                  colSpan={5}
                  title="No activity logs match your filters"
                  description="Try different email, action, entity, or date filters."
                />
              ) : null}
              {data?.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(log.occurredAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.action}
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="max-w-[280px]">
                    <code className="block truncate rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {metadataPreview(log.metadata)}
                    </code>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.ipAddress ?? '—'}
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
      </div>
    </SuperAdminGate>
  );
}
