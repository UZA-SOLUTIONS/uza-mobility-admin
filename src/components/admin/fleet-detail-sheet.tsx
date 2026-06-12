'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLink } from 'lucide-react';
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
import { formatDateTime, formatUsd } from '@/lib/admin/format';
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

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

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

  const vehicleInterest = [
    request?.vehicleCategory?.name,
    request?.vehicleSubcategory?.name,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl">
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-xs text-muted-foreground">
                    {request.referenceNumber}
                  </p>
                  <SheetTitle className="text-xl">
                    {request.organizationName}
                  </SheetTitle>
                  <SheetDescription>
                    {request.contactPerson} · {request.quantity} vehicle
                    {request.quantity === 1 ? '' : 's'}
                  </SheetDescription>
                </div>
                <StatusBadge status={request.status} />
              </div>
            </SheetHeader>

            <div className="space-y-6 px-6 py-6">
              {request.summaryPdfUrl ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Request summary PDF</p>
                    <p className="text-xs text-muted-foreground">
                      Same document emailed to the requester (no pricing).
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={request.summaryPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open PDF
                      <ExternalLink className="ml-2 size-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : null}

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">Contact</h3>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Contact person"
                    value={request.contactPerson}
                  />
                  <DetailField label="Phone" value={request.phone} />
                  <DetailField label="Email" value={request.email} />
                  <DetailField
                    label="Buyer type"
                    value={request.buyerType.replaceAll('_', ' ')}
                  />
                  {request.user ? (
                    <DetailField
                      label="Linked account"
                      value={`${[request.user.firstName, request.user.lastName].filter(Boolean).join(' ') || 'Buyer'} (${request.user.email})`}
                      className="sm:col-span-2"
                    />
                  ) : (
                    <DetailField
                      label="Linked account"
                      value="Guest (no account yet)"
                    />
                  )}
                </dl>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold">Fleet requirements</h3>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="Fleet size" value={request.quantity} />
                  <DetailField
                    label="Vehicle category"
                    value={vehicleInterest || '—'}
                  />
                  <DetailField
                    label="Use case"
                    value={request.useCase?.replaceAll('_', ' ') ?? '—'}
                  />
                  <DetailField
                    label="Preferred timeline"
                    value={request.preferredDeliveryTimeline ?? '—'}
                  />
                  <DetailField
                    label="Budget range"
                    value={
                      request.budgetRangeMin != null ||
                      request.budgetRangeMax != null
                        ? `${request.budgetRangeMin != null ? formatUsd(request.budgetRangeMin) : '?'} – ${request.budgetRangeMax != null ? formatUsd(request.budgetRangeMax) : '?'}`
                        : '—'
                    }
                  />
                  <DetailField
                    label="Financing requested"
                    value={request.financingRequested ? 'Yes' : 'No'}
                  />
                  <DetailField
                    label="Charging support"
                    value={request.chargingSupportRequested ? 'Yes' : 'No'}
                  />
                  <DetailField
                    label="Submitted"
                    value={formatDateTime(request.createdAt)}
                  />
                  {request.quotedAt ? (
                    <DetailField
                      label="Quoted at"
                      value={formatDateTime(request.quotedAt)}
                    />
                  ) : null}
                </dl>
              </section>

              {request.association ? (
                <section className="rounded-lg border p-4 text-sm">
                  <p className="font-medium">Association</p>
                  <p className="mt-1 text-muted-foreground">
                    {request.association.name} · {request.association.type} ·{' '}
                    {request.association.country}
                  </p>
                </section>
              ) : null}

              {request.notes ? (
                <section className="text-sm">
                  <p className="font-medium">Customer message</p>
                  <p className="mt-2 rounded-lg border bg-muted/20 p-4 whitespace-pre-wrap text-muted-foreground">
                    {request.notes}
                  </p>
                </section>
              ) : null}

              {request.adminNotes ? (
                <section className="text-sm">
                  <p className="font-medium">Admin notes</p>
                  <p className="mt-2 rounded-lg border bg-muted/20 p-4 whitespace-pre-wrap text-muted-foreground">
                    {request.adminNotes}
                  </p>
                </section>
              ) : null}

              {canUpdate ? (
                <section className="space-y-3 rounded-lg border p-4">
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
                </section>
              ) : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
