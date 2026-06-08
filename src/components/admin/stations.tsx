'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatDateTime } from '@/lib/admin/format';
import { usePermissions } from '@/hooks/permissions';
import {
  useAdminOperators,
  useAdminStations,
  useApproveAdminOperator,
  useApproveAdminStation,
  useRejectAdminOperator,
  useRejectAdminStation,
  useSuspendAdminStation,
} from '@/queries/admin';
import type {
  AdminOperator,
  AdminOperatorFilters,
  AdminStation,
  AdminStationFilters,
} from '@/types/admin/stations';

export function AdminStationsPanel() {
  const { can } = usePermissions();
  const canRead = can('stations:read-all');
  const [pendingReason, setPendingReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [operatorCity, setOperatorCity] = useState('');
  const [operatorCountry, setOperatorCountry] = useState('');
  const [stationCity, setStationCity] = useState('');
  const [stationCountry, setStationCountry] = useState('');
  const [selectedOperator, setSelectedOperator] =
    useState<AdminOperator | null>(null);
  const [selectedStation, setSelectedStation] = useState<AdminStation | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<{
    kind:
      | 'approve-operator'
      | 'reject-operator'
      | 'approve-station'
      | 'reject-station'
      | 'suspend-station';
    id: string;
    label: string;
  } | null>(null);
  const [operatorFilters, setOperatorFilters] = useState<AdminOperatorFilters>({
    page: 1,
    limit: 25,
  });
  const [stationFilters, setStationFilters] = useState<AdminStationFilters>({
    page: 1,
    limit: 25,
  });

  const operators = useAdminOperators(operatorFilters);
  const stations = useAdminStations(stationFilters);
  const approveOperator = useApproveAdminOperator();
  const rejectOperator = useRejectAdminOperator();
  const approveStation = useApproveAdminStation();
  const rejectStation = useRejectAdminStation();
  const suspendStation = useSuspendAdminStation();

  const actionBody = pendingReason.trim()
    ? { reason: pendingReason.trim() }
    : {};
  const busy =
    approveOperator.isPending ||
    rejectOperator.isPending ||
    approveStation.isPending ||
    rejectStation.isPending ||
    suspendStation.isPending;
  const confirmOpen = Boolean(pendingAction);
  const requiresReason =
    pendingAction?.kind === 'reject-operator' ||
    pendingAction?.kind === 'reject-station' ||
    pendingAction?.kind === 'suspend-station';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Charging stations moderation"
        description="Review operator applications and station submissions."
      />

      {!canRead ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          You do not have permission to view charging-station moderation data.
          Required permission:{' '}
          <span className="font-medium">stations:read-all</span>.
        </div>
      ) : null}

      <Tabs defaultValue="operators">
        <TabsList>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
        </TabsList>

        <TabsContent value="operators" className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Search</Label>
              <Input
                className="w-64"
                value={operatorFilters.q ?? ''}
                onChange={(event) =>
                  setOperatorFilters((current) => ({
                    ...current,
                    q: event.target.value || undefined,
                    page: 1,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                className="w-48"
                value={operatorCity}
                onChange={(event) => {
                  const value = event.target.value;
                  setOperatorCity(value);
                  setOperatorFilters((current) => ({
                    ...current,
                    city: value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                className="w-28"
                maxLength={2}
                value={operatorCountry}
                onChange={(event) => {
                  const value = event.target.value.toUpperCase();
                  setOperatorCountry(value);
                  setOperatorFilters((current) => ({
                    ...current,
                    country: value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={operatorFilters.status ?? 'ALL'}
                onValueChange={(value) =>
                  setOperatorFilters((current) => ({
                    ...current,
                    status: value === 'ALL' ? undefined : (value as never),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`op-skeleton-${index}`}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
                {operators.isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-destructive"
                    >
                      {operators.error instanceof Error
                        ? operators.error.message
                        : 'Failed to load operator applications.'}
                    </TableCell>
                  </TableRow>
                ) : null}
                {operators.data?.items.map((operator) => (
                  <TableRow key={operator.id}>
                    <TableCell>
                      <p className="font-medium">{operator.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {operator.contactPerson} · {operator.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={operator.status} />
                    </TableCell>
                    <TableCell>
                      {operator.city}, {operator.country}
                    </TableCell>
                    <TableCell>{formatDateTime(operator.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOperator(operator)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || operator.status !== 'PENDING'}
                          onClick={() =>
                            setPendingAction({
                              kind: 'approve-operator',
                              id: operator.id,
                              label: operator.businessName,
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy || operator.status !== 'PENDING'}
                          onClick={() =>
                            setPendingAction({
                              kind: 'reject-operator',
                              id: operator.id,
                              label: operator.businessName,
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!operators.isLoading &&
                !operators.isError &&
                (operators.data?.items.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No operator applications found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {operators.data?.meta ? (
            <PaginationBar
              meta={operators.data.meta}
              onPageChange={(page) =>
                setOperatorFilters((current) => ({ ...current, page }))
              }
            />
          ) : null}
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Search</Label>
              <Input
                className="w-64"
                value={stationFilters.q ?? ''}
                onChange={(event) =>
                  setStationFilters((current) => ({
                    ...current,
                    q: event.target.value || undefined,
                    page: 1,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input
                className="w-48"
                value={stationCity}
                onChange={(event) => {
                  const value = event.target.value;
                  setStationCity(value);
                  setStationFilters((current) => ({
                    ...current,
                    city: value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                className="w-28"
                maxLength={2}
                value={stationCountry}
                onChange={(event) => {
                  const value = event.target.value.toUpperCase();
                  setStationCountry(value);
                  setStationFilters((current) => ({
                    ...current,
                    country: value || undefined,
                    page: 1,
                  }));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={stationFilters.status ?? 'ALL'}
                onValueChange={(value) =>
                  setStationFilters((current) => ({
                    ...current,
                    status: value === 'ALL' ? undefined : (value as never),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="PENDING_REVIEW">PENDING_REVIEW</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.isLoading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <TableRow key={`station-skeleton-${index}`}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
                {stations.isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-destructive"
                    >
                      {stations.error instanceof Error
                        ? stations.error.message
                        : 'Failed to load charging stations.'}
                    </TableCell>
                  </TableRow>
                ) : null}
                {stations.data?.items.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell>
                      <p className="font-medium">{station.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {station.city}, {station.country}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={station.status} />
                    </TableCell>
                    <TableCell>
                      {station.operator?.businessName ?? '—'}
                    </TableCell>
                    <TableCell>{formatDateTime(station.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedStation(station)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy || station.status !== 'PENDING_REVIEW'}
                          onClick={() =>
                            setPendingAction({
                              kind: 'approve-station',
                              id: station.id,
                              label: station.name,
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busy || station.status !== 'PENDING_REVIEW'}
                          onClick={() =>
                            setPendingAction({
                              kind: 'reject-station',
                              id: station.id,
                              label: station.name,
                            })
                          }
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy || station.status !== 'ACTIVE'}
                          onClick={() =>
                            setPendingAction({
                              kind: 'suspend-station',
                              id: station.id,
                              label: station.name,
                            })
                          }
                        >
                          Suspend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!stations.isLoading &&
                !stations.isError &&
                (stations.data?.items.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No charging stations found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          {stations.data?.meta ? (
            <PaginationBar
              meta={stations.data.meta}
              onPageChange={(page) =>
                setStationFilters((current) => ({ ...current, page }))
              }
            />
          ) : null}
        </TabsContent>
      </Tabs>

      <Sheet
        open={Boolean(selectedOperator)}
        onOpenChange={(open) => !open && setSelectedOperator(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedOperator?.businessName}</SheetTitle>
            <SheetDescription>Operator application details</SheetDescription>
          </SheetHeader>
          {selectedOperator ? (
            <dl className="grid gap-3 px-4 pb-6 text-sm">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={selectedOperator.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd>{selectedOperator.contactPerson}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{selectedOperator.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{selectedOperator.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd>
                  {selectedOperator.city}, {selectedOperator.country}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd>{selectedOperator.address ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Description</dt>
                <dd>{selectedOperator.description ?? '—'}</dd>
              </div>
            </dl>
          ) : null}
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(selectedStation)}
        onOpenChange={(open) => !open && setSelectedStation(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedStation?.name}</SheetTitle>
            <SheetDescription>Station moderation details</SheetDescription>
          </SheetHeader>
          {selectedStation ? (
            <div className="space-y-4 px-4 pb-6 text-sm">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedStation.status} />
                <span className="text-muted-foreground">
                  Updated {formatDateTime(selectedStation.updatedAt)}
                </span>
              </div>
              <p>{selectedStation.description ?? 'No description provided.'}</p>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>{selectedStation.address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd>
                    {selectedStation.city}, {selectedStation.country}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ports</dt>
                  <dd>{selectedStation.ports.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Pricing entries</dt>
                  <dd>{selectedStation.pricing.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Compatibility entries
                  </dt>
                  <dd>{selectedStation.compatibleVehicles.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Photos</dt>
                  <dd>{selectedStation.photos.length}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setPendingReason('');
            setReasonError(null);
          }
        }}
        title="Confirm moderation action"
        description={
          pendingAction
            ? `Apply ${pendingAction.kind.replace('-', ' ')} to "${pendingAction.label}"?`
            : ''
        }
        confirmLabel="Proceed"
        variant={
          pendingAction?.kind?.includes('reject') ||
          pendingAction?.kind === 'suspend-station'
            ? 'destructive'
            : 'default'
        }
        loading={busy}
        onConfirm={() => {
          if (!pendingAction) return;
          if (requiresReason && !pendingReason.trim()) {
            setReasonError('Reason is required for reject/suspend actions.');
            return;
          }
          if (pendingAction.kind === 'approve-operator') {
            approveOperator.mutate(pendingAction.id, {
              onSuccess: () => {
                setPendingAction(null);
                setPendingReason('');
                setReasonError(null);
              },
            });
            return;
          }
          if (pendingAction.kind === 'reject-operator') {
            rejectOperator.mutate(
              { id: pendingAction.id, body: actionBody },
              {
                onSuccess: () => {
                  setPendingAction(null);
                  setPendingReason('');
                  setReasonError(null);
                },
              },
            );
            return;
          }
          if (pendingAction.kind === 'approve-station') {
            approveStation.mutate(pendingAction.id, {
              onSuccess: () => {
                setPendingAction(null);
                setPendingReason('');
                setReasonError(null);
              },
            });
            return;
          }
          if (pendingAction.kind === 'reject-station') {
            rejectStation.mutate(
              { id: pendingAction.id, body: actionBody },
              {
                onSuccess: () => {
                  setPendingAction(null);
                  setPendingReason('');
                  setReasonError(null);
                },
              },
            );
            return;
          }
          if (pendingAction.kind === 'suspend-station') {
            suspendStation.mutate(
              { id: pendingAction.id, body: actionBody },
              {
                onSuccess: () => {
                  setPendingAction(null);
                  setPendingReason('');
                  setReasonError(null);
                },
              },
            );
          }
        }}
      >
        {requiresReason ? (
          <div className="space-y-2 px-6">
            <Label>Reason (required)</Label>
            <Textarea
              placeholder="Enter moderation reason"
              value={pendingReason}
              onChange={(event) => {
                setPendingReason(event.target.value);
                if (reasonError) setReasonError(null);
              }}
            />
            {reasonError ? (
              <p className="text-xs text-destructive">{reasonError}</p>
            ) : null}
          </div>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
