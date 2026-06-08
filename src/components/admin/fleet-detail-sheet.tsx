'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/permissions';
import { formatDate, formatDateTime, formatUsd } from '@/lib/admin/format';
import {
  useAdminFleetRequest,
  useUpdateFleetStatus,
} from '@/queries/operations';
import {
  updateFleetStatusSchema,
  type UpdateFleetStatusInput,
} from '@/schemas/operations';
import {
  FLEET_STATUS_TRANSITIONS,
  type FleetRequestStatus,
} from '@/types/admin/operations';

type FleetDetailSheetProps = {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FleetDetailSheet({
  requestId,
  open,
  onOpenChange,
}: FleetDetailSheetProps) {
  const { can } = usePermissions();
  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useAdminFleetRequest(open ? requestId : null);
  const updateStatus = useUpdateFleetStatus();
  const [nextStatus, setNextStatus] = useState<FleetRequestStatus | ''>('');

  const allowedTransitions = useMemo(() => {
    if (!request) return [];
    return FLEET_STATUS_TRANSITIONS[request.status] ?? [];
  }, [request]);

  const form = useForm<UpdateFleetStatusInput>({
    resolver: zodResolver(updateFleetStatusSchema),
    defaultValues: { adminNotes: '' },
  });

  const canUpdate = can('fleet:update-status') && allowedTransitions.length > 0;

  const submitStatus = () => {
    if (!request || !nextStatus) return;
    updateStatus.mutate(
      {
        id: request.id,
        body: {
          status: nextStatus,
          adminNotes: form.getValues('adminNotes') || undefined,
        },
      },
      {
        onSuccess: () => {
          setNextStatus('');
          form.reset({ adminNotes: '' });
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        {isLoading ? (
          <div className="space-y-4 px-6 py-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {isError ? (
          <p className="px-6 py-6 text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load fleet request.'}
          </p>
        ) : null}

        {request && !isLoading ? (
          <>
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle className="text-xl">
                {request.organizationName}
              </SheetTitle>
              <SheetDescription>
                {request.contactPerson} · {request.quantity} vehicle
                {request.quantity === 1 ? '' : 's'}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-6">
              <StatusBadge status={request.status} />

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{request.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{request.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Buyer type</dt>
                  <dd>{request.buyerType.replaceAll('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Use case</dt>
                  <dd>{request.useCase?.replaceAll('_', ' ') ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Timeline</dt>
                  <dd>{request.preferredDeliveryTimeline ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd>
                    {request.budgetRangeMin != null ||
                    request.budgetRangeMax != null
                      ? `${request.budgetRangeMin != null ? formatUsd(request.budgetRangeMin) : '?'} – ${request.budgetRangeMax != null ? formatUsd(request.budgetRangeMax) : '?'}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Financing</dt>
                  <dd>{request.financingRequested ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Charging support</dt>
                  <dd>{request.chargingSupportRequested ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd>{formatDateTime(request.createdAt)}</dd>
                </div>
                {request.quotedAt ? (
                  <div>
                    <dt className="text-muted-foreground">Quoted at</dt>
                    <dd>{formatDateTime(request.quotedAt)}</dd>
                  </div>
                ) : null}
              </dl>

              {request.association ? (
                <div className="rounded-lg border p-4 text-sm">
                  <p className="font-medium">Association</p>
                  <p className="text-muted-foreground">
                    {request.association.name} · {request.association.type} ·{' '}
                    {request.association.country}
                  </p>
                </div>
              ) : null}

              {request.notes ? (
                <div className="text-sm">
                  <p className="font-medium">Customer notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {request.notes}
                  </p>
                </div>
              ) : null}

              {request.adminNotes ? (
                <div className="text-sm">
                  <p className="font-medium">Admin notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {request.adminNotes}
                  </p>
                </div>
              ) : null}

              {canUpdate ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">Update status</p>
                  <div className="space-y-1.5">
                    <Label>New status</Label>
                    <Select
                      value={nextStatus}
                      onValueChange={(v) =>
                        setNextStatus(v as FleetRequestStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select next status" />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTransitions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fleet-admin-notes">Admin notes</Label>
                    <Textarea
                      id="fleet-admin-notes"
                      rows={3}
                      {...form.register('adminNotes')}
                    />
                  </div>
                  <Button
                    disabled={!nextStatus || updateStatus.isPending}
                    onClick={submitStatus}
                  >
                    {updateStatus.isPending ? 'Saving…' : 'Save status'}
                  </Button>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
