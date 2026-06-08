'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from '@/hooks/use-debounce';
import { usePermissions } from '@/hooks/permissions';
import { FinancingDetailSheet } from '@/components/admin/financing-detail-sheet';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate, formatUsd } from '@/lib/admin/format';
import {
  useAdminBanks,
  useAdminFinancing,
  useCreateBank,
} from '@/queries/commerce';
import { createBankSchema, type CreateBankInput } from '@/schemas/commerce';
import {
  financingStatuses,
  type AdminFinancingFilters,
} from '@/types/admin/commerce';

export function AdminFinancingPanel() {
  const { isSuperAdmin } = usePermissions();
  const [filters, setFilters] = useState<AdminFinancingFilters>({
    page: 1,
    limit: 25,
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bankFormOpen, setBankFormOpen] = useState(false);

  const queryFilters: AdminFinancingFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error } = useAdminFinancing(queryFilters);
  const { data: banks } = useAdminBanks();
  const createBank = useCreateBank();

  const bankForm = useForm<CreateBankInput>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      name: '',
      country: 'RW',
      contactEmail: '',
      contactPhone: '',
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financing"
        description="Review buyer financing requests, assign bank partners, and record outcomes."
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
                    : (value as AdminFinancingFilters['status']),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {financingStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:min-w-[260px]">
          <Label htmlFor="financing-search">Search</Label>
          <Input
            id="financing-search"
            placeholder="Name, phone, organization…"
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
          {error instanceof Error
            ? error.message
            : 'Failed to load financing requests.'}
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
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
                  No financing requests match these filters.
                </TableCell>
              </TableRow>
            ) : null}
            {!isLoading
              ? data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.buyerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.invoice ? (
                        <>
                          <div className="text-sm">
                            {item.invoice.invoiceNumber}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatUsd(item.invoice.totalAmountUsd)}
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.assignedBank?.name ?? item.preferredBankName ?? '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewingId(item.id);
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

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Bank partners</h2>
            <p className="text-sm text-muted-foreground">
              Active institutions available when assigning financing requests.
            </p>
          </div>
          {isSuperAdmin ? (
            <Button variant="outline" onClick={() => setBankFormOpen(true)}>
              Add bank
            </Button>
          ) : null}
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!banks?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No bank partners configured.
                  </TableCell>
                </TableRow>
              ) : (
                banks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell>{bank.country}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bank.contactEmail ?? bank.contactPhone ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <FinancingDetailSheet
        requestId={viewingId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setViewingId(null);
        }}
      />

      <Dialog open={bankFormOpen} onOpenChange={setBankFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add bank partner</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={bankForm.handleSubmit((values) => {
              createBank.mutate(values, {
                onSuccess: () => {
                  setBankFormOpen(false);
                  bankForm.reset();
                },
              });
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="bank-name">Name</Label>
              <Input id="bank-name" {...bankForm.register('name')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-country">Country code</Label>
              <Input
                id="bank-country"
                maxLength={2}
                {...bankForm.register('country')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-email">Contact email (optional)</Label>
              <Input
                id="bank-email"
                type="email"
                {...bankForm.register('contactEmail')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank-phone">Contact phone (optional)</Label>
              <Input id="bank-phone" {...bankForm.register('contactPhone')} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBankFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBank.isPending}>
                Create bank
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
