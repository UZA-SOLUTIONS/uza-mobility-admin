'use client';

import { useState } from 'react';
import { SuperAdminGate } from '@/components/admin/super-admin-gate';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
  return JSON.stringify(metadata).slice(0, 80);
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

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
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
        </div>

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load activity logs.'}
          </p>
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
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {data?.items.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No activity logs match your filters.
                  </TableCell>
                </TableRow>
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
                  <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                    {metadataPreview(log.metadata)}
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
