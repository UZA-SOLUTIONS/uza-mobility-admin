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
  useAdvanceListingInventoryStage,
} from '@/queries/admin';
import type { AdminListing } from '@/types/admin/marketplace';
import { rejectListingSchema } from '@/schemas/admin';

type InventoryStage = NonNullable<AdminListing['inventoryStage']>;

const NEXT_INVENTORY_STAGE: Record<InventoryStage, InventoryStage | null> = {
  CHINA_UNPAID: 'IN_TRANSIT',
  IN_TRANSIT: 'AT_PORT',
  AT_PORT: 'KIGALI_STOCK',
  KIGALI_STOCK: null,
};

const PREV_INVENTORY_STAGE: Record<InventoryStage, InventoryStage | null> = {
  CHINA_UNPAID: null,
  IN_TRANSIT: 'CHINA_UNPAID',
  AT_PORT: 'IN_TRANSIT',
  KIGALI_STOCK: 'AT_PORT',
};

const INVENTORY_STAGE_LABEL: Record<InventoryStage, string> = {
  CHINA_UNPAID: 'China',
  IN_TRANSIT: 'In transit',
  AT_PORT: 'At port',
  KIGALI_STOCK: 'Kigali stock',
};

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
  const advanceStage = useAdvanceListingInventoryStage();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [stageConfirm, setStageConfirm] = useState<{
    stage: InventoryStage;
    direction: 'forward' | 'back';
  } | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);

  const currentStage = listing.inventoryStage ?? 'KIGALI_STOCK';
  const nextStage = NEXT_INVENTORY_STAGE[currentStage];
  const prevStage = PREV_INVENTORY_STAGE[currentStage];
  const canMoveInventory = can('listings:create');
  const needsRwandaChannelSync =
    currentStage === 'KIGALI_STOCK' &&
    (listing.sellerType === 'UZA_CHINA_SOURCING' ||
      listing.listingPricing?.basePriceUsd == null);

  const busy =
    approve.isPending ||
    publish.isPending ||
    unpublish.isPending ||
    reject.isPending ||
    feature.isPending ||
    hotDeal.isPending ||
    remove.isPending ||
    advanceStage.isPending;

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

  const confirmStageMove = () => {
    if (!stageConfirm) return;
    advanceStage.mutate(
      { id: listing.id, stage: stageConfirm.stage },
      {
        onSuccess: () => {
          setStageConfirm(null);
          onSuccess();
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          Location: {INVENTORY_STAGE_LABEL[currentStage]}
        </span>
        {needsRwandaChannelSync && canMoveInventory ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              setStageConfirm({ stage: 'KIGALI_STOCK', direction: 'forward' })
            }
          >
            {listing.sellerType === 'UZA_CHINA_SOURCING'
              ? 'Fix channel → Rwanda stock'
              : 'Fix Rwanda pricing'}
          </Button>
        ) : null}
        {prevStage && canMoveInventory ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              setStageConfirm({ stage: prevStage, direction: 'back' })
            }
          >
            ← {INVENTORY_STAGE_LABEL[prevStage]}
          </Button>
        ) : null}
        {nextStage && canMoveInventory ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() =>
              setStageConfirm({ stage: nextStage, direction: 'forward' })
            }
          >
            → {INVENTORY_STAGE_LABEL[nextStage]}
          </Button>
        ) : null}
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
        open={stageConfirm != null}
        onOpenChange={(open) => {
          if (!open) setStageConfirm(null);
        }}
        title={
          stageConfirm?.stage === 'KIGALI_STOCK' &&
          currentStage === 'KIGALI_STOCK'
            ? listing.sellerType === 'UZA_CHINA_SOURCING'
              ? 'Update channel to Rwanda stock?'
              : 'Fix Rwanda pricing?'
            : stageConfirm?.direction === 'back'
              ? 'Move vehicle location back?'
              : 'Advance vehicle location?'
        }
        description={
          stageConfirm
            ? stageConfirm.stage === 'KIGALI_STOCK' &&
              currentStage === 'KIGALI_STOCK'
              ? listing.sellerType === 'UZA_CHINA_SOURCING'
                ? `This listing is already in Kigali but still marked as China sourcing. Update the channel to Rwanda stock and migrate FOB pricing into a Rwanda base price (buyer list price stays the same).`
                : `This Kigali listing is missing a Rwanda base price (common after China transit). Migrate from FOB/final into basePriceUsd so edit/view show the correct field.`
              : stageConfirm.direction === 'back'
                ? `Move "${listing.listingTitle}" from ${INVENTORY_STAGE_LABEL[currentStage]} back to ${INVENTORY_STAGE_LABEL[stageConfirm.stage]}? This can change the listing channel and location shown to buyers.`
                : `Move "${listing.listingTitle}" from ${INVENTORY_STAGE_LABEL[currentStage]} to ${INVENTORY_STAGE_LABEL[stageConfirm.stage]}?`
            : ''
        }
        confirmLabel={
          stageConfirm?.stage === 'KIGALI_STOCK' &&
          currentStage === 'KIGALI_STOCK'
            ? listing.sellerType === 'UZA_CHINA_SOURCING'
              ? 'Yes, fix channel'
              : 'Yes, fix pricing'
            : stageConfirm?.direction === 'back'
              ? 'Yes, move back'
              : 'Yes, advance'
        }
        variant={stageConfirm?.direction === 'back' ? 'destructive' : 'default'}
        loading={advanceStage.isPending}
        onConfirm={confirmStageMove}
      />

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
