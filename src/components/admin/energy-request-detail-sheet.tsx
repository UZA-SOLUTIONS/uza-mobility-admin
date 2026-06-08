'use client';

import { useState } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/permissions';
import { formatDateTime } from '@/lib/admin/format';
import { useUpdateEnergyRequestStatus } from '@/queries/operations';
import {
  energyRequestStatuses,
  type EnergyRequest,
  type EnergyRequestStatus,
} from '@/types/admin/operations';

type EnergyRequestDetailSheetProps = {
  request: EnergyRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EnergyRequestDetailSheet({
  request,
  open,
  onOpenChange,
}: EnergyRequestDetailSheetProps) {
  const { can } = usePermissions();
  const updateStatus = useUpdateEnergyRequestStatus();
  const [nextStatus, setNextStatus] = useState<EnergyRequestStatus | ''>('');

  const canUpdate = can('fleet:update-status');

  const saveStatus = () => {
    if (!request || !nextStatus) return;
    updateStatus.mutate(
      { id: request.id, body: { status: nextStatus } },
      {
        onSuccess: () => {
          setNextStatus('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {request ? (
          <>
            <SheetHeader>
              <SheetTitle>{request.contactName}</SheetTitle>
              <SheetDescription>
                Energy quote request · {request.phone}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <StatusBadge status={request.status} />

              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{request.email ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd>
                    {[request.city, request.location]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Client type</dt>
                  <dd>{request.clientType?.replaceAll('_', ' ') ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">EVs</dt>
                  <dd>{request.numberOfEvs ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Product</dt>
                  <dd>{request.chargingProduct?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Solar / fleet / site visit
                  </dt>
                  <dd>
                    {request.solarSupportNeeded ? 'Solar' : ''}
                    {request.fleetUse ? ' · Fleet' : ''}
                    {request.siteVisitRequested ? ' · Site visit' : ''}
                    {!request.solarSupportNeeded &&
                    !request.fleetUse &&
                    !request.siteVisitRequested
                      ? '—'
                      : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd>{formatDateTime(request.createdAt)}</dd>
                </div>
              </dl>

              {request.notes ? (
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {request.notes}
                </p>
              ) : null}

              {canUpdate ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">Update status</p>
                  <div className="space-y-1.5">
                    <Label>New status</Label>
                    <Select
                      value={nextStatus}
                      onValueChange={(v) =>
                        setNextStatus(v as EnergyRequestStatus)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {energyRequestStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replaceAll('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    disabled={!nextStatus || updateStatus.isPending}
                    onClick={saveStatus}
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
