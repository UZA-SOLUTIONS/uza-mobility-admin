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
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import {
  useApproveListing,
  useDeleteListing,
  useFeatureListing,
  useHotDealListing,
  usePublishListing,
  useRejectListing,
  useUnpublishListing,
} from '@/queries/admin';
import type { AdminListing } from '@/types/admin/marketplace';
import { rejectListingSchema } from '@/schemas/admin';

type ListingActionsProps = {
  listing: AdminListing;
  onActionComplete?: () => void;
};

export function ListingActions({
  listing,
  onActionComplete,
}: ListingActionsProps) {
  const { can, isSuperAdmin, user } = usePermissions();
  const canApprove =
    isSuperAdmin || user?.roles?.includes('SUPER_ADMIN') === true;
  const approve = useApproveListing();
  const publish = usePublishListing();
  const unpublish = useUnpublishListing();
  const reject = useRejectListing();
  const feature = useFeatureListing();
  const hotDeal = useHotDealListing();
  const remove = useDeleteListing();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const busy =
    approve.isPending ||
    publish.isPending ||
    unpublish.isPending ||
    reject.isPending ||
    feature.isPending ||
    hotDeal.isPending ||
    remove.isPending;

  const onSuccess = () => onActionComplete?.();

  const handleReject = () => {
    const parsed = rejectListingSchema.safeParse({ reason });
    if (!parsed.success) {
      setReasonError(parsed.error.issues[0]?.message ?? 'Invalid reason');
      return;
    }
    setReasonError(null);
    reject.mutate(
      { id: listing.id, body: parsed.data },
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
        {listing.status === 'PENDING_REVIEW' && canApprove ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => approve.mutate(listing.id, { onSuccess })}
          >
            Approve
          </Button>
        ) : null}
        {listing.status === 'APPROVED' && canApprove ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => publish.mutate(listing.id, { onSuccess })}
          >
            Publish
          </Button>
        ) : null}
        {listing.status === 'SUSPENDED' && canApprove ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => publish.mutate(listing.id, { onSuccess })}
          >
            Republish
          </Button>
        ) : null}
        {listing.status === 'PUBLISHED' && canApprove ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => unpublish.mutate(listing.id, { onSuccess })}
          >
            Unpublish
          </Button>
        ) : null}
        {(listing.status === 'PENDING_REVIEW' ||
          listing.status === 'APPROVED') &&
        canApprove ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setRejectOpen(true)}
          >
            Reject
          </Button>
        ) : null}
        {can('listings:feature') ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => feature.mutate(listing.id, { onSuccess })}
            >
              {listing.isFeatured ? 'Unfeature' : 'Feature'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => hotDeal.mutate(listing.id, { onSuccess })}
            >
              {listing.isHotDeal ? 'Unhot' : 'Hot deal'}
            </Button>
          </>
        ) : null}
        {can('listings:delete') ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete listing permanently?"
        description={`"${listing.listingTitle}" will be removed from the database. This cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="destructive"
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(listing.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              onSuccess();
            },
          })
        }
      />

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject listing</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason for seller</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain what needs to change…"
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
              Reject listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
