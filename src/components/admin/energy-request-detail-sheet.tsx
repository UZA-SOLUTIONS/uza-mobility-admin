'use client';

import { useState } from 'react';
import { AdminDetailSheet } from '@/components/admin/shared/admin-detail-sheet';
import {
  DetailRow,
  DetailSection,
} from '@/components/admin/shared/detail-fields';
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

function solarFleetSiteVisit(request: EnergyRequest) {
  const parts = [
    request.solarSupportNeeded ? 'Solar' : '',
    request.fleetUse ? 'Fleet' : '',
    request.siteVisitRequested ? 'Site visit' : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '—';
}

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
    <AdminDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      title={request?.contactName ?? 'Energy request'}
      description={
        request
          ? `Energy quote request · ${request.phone}`
          : undefined
      }
      footer={
        canUpdate && request ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Update status</p>
            <div className="space-y-1.5">
              <Label>New status</Label>
              <Select
                value={nextStatus}
                onValueChange={(v) => setNextStatus(v as EnergyRequestStatus)}
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
        ) : undefined
      }
    >
      {request ? (
        <>
          <StatusBadge status={request.status} />

          <DetailSection title="Request details">
            <DetailRow label="Email" value={request.email} />
            <DetailRow
              label="Location"
              value={
                [request.city, request.location].filter(Boolean).join(', ') ||
                '—'
              }
            />
            <DetailRow
              label="Client type"
              value={request.clientType?.replaceAll('_', ' ') ?? '—'}
            />
            <DetailRow label="EVs" value={request.numberOfEvs} />
            <DetailRow
              label="Product"
              value={request.chargingProduct?.name ?? '—'}
            />
            <DetailRow
              label="Solar / fleet / site visit"
              value={solarFleetSiteVisit(request)}
            />
            <DetailRow
              label="Submitted"
              value={formatDateTime(request.createdAt)}
            />
          </DetailSection>

          {request.notes ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {request.notes}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </AdminDetailSheet>
  );
}