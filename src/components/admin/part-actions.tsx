'use client';

import { useState } from 'react';
import { usePermissions } from '@/hooks/permissions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useActivatePart,
  useApprovePart,
  useDeactivatePart,
  useRejectPart,
} from '@/queries/admin';
import { rejectListingSchema } from '@/schemas/admin';
import type { AdminPart } from '@/types/admin/marketplace';

type PartActionsProps = {
  part: AdminPart;
  disabled?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onActionComplete?: () => void;
};

export function PartActions({
  part,
  disabled = false,
  onEdit,
  onDelete,
  onActionComplete,
}: PartActionsProps) {
  const { isSuperAdmin, user } = usePermissions();
  const canApprove =
    isSuperAdmin || user?.roles?.includes('SUPER_ADMIN') === true;
  const approve = useApprovePart();
  const reject = useRejectPart();
  const activate = useActivatePart();
  const deactivate = useDeactivatePart();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const busy =
    disabled ||
    approve.isPending ||
    reject.isPending ||
    activate.isPending ||
    deactivate.isPending;

  const onSuccess = () => onActionComplete?.();

  const handleReject = () => {
    const parsed = rejectListingSchema.safeParse({ reason });
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message ?? 'Invalid reason');
      return;
    }
    setReasonError(null);
    reject.mutate(
      { id: part.id, body: parsed.data },
      {
        onSuccess: () => {
          setRejectOpen(false);
          onSuccess();
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {part.status === 'PENDING_REVIEW' && canApprove ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => approve.mutate(part.id, { onSuccess })}
          >
            Approve
          </Button>
        ) : null}
        {part.status === 'PENDING_REVIEW' && canApprove ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setRejectOpen(true)}
          >
            Reject
          </Button>
        ) : null}
        {part.status === 'APPROVED' && !part.isActive ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => activate.mutate(part.id, { onSuccess })}
          >
            Publish
          </Button>
        ) : null}
        {part.status === 'APPROVED' && part.isActive ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => deactivate.mutate(part.id, { onSuccess })}
          >
            Unpublish
          </Button>
        ) : null}
        {onEdit ? (
          <Button size="sm" variant="outline" disabled={busy} onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={onDelete}
          >
            Delete
          </Button>
        ) : null}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject part</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="part-reject-reason">Reason for seller</Label>
            <Textarea
              id="part-reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
            />
            {reasonError ? (
              <p className="text-sm text-destructive">{reasonError}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={handleReject}
            >
              Reject part
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
