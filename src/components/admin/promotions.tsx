'use client';

import { useState } from 'react';
import { PromotionDetailSheet } from '@/components/admin/promotion-detail-sheet';
import { PromotionFormDialog } from '@/components/admin/promotion-form-dialog';
import { AdminErrorState } from '@/components/admin/shared/admin-error-state';
import { AdminTableEmpty } from '@/components/admin/shared/admin-table-empty';
import { AdminTableSkeletonRows } from '@/components/admin/shared/admin-table-skeleton-rows';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/permissions';
import { formatDate } from '@/lib/admin/format';
import { useAdminPromotions } from '@/queries/operations';
import type { AdminPromotion } from '@/types/admin/operations';

export function AdminPromotionsPanel() {
  const { can } = usePermissions();
  const { data, isLoading, isError, error } = useAdminPromotions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusAttach, setFocusAttach] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPromotion | null>(null);

  const openDetail = (promotion: AdminPromotion, attachFocus = false) => {
    setSelectedId(promotion.id);
    setFocusAttach(attachFocus);
    setDetailOpen(true);
  };

  const openDetailAfterCreate = (promotion: AdminPromotion) => {
    openDetail(promotion, true);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (promotion: AdminPromotion) => {
    setEditing(promotion);
    setFormOpen(true);
    setDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Create campaigns, upload banners, and attach listings for discounts or homepage placement."
        actions={
          can('promotions:create') ? (
            <Button onClick={openCreate}>Create promotion</Button>
          ) : null
        }
      />

      {isError ? (
        <AdminErrorState
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load promotions.'
          }
        />
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <AdminTableSkeletonRows columns={6} rows={4} /> : null}
            {data?.length === 0 && !isLoading ? (
              <AdminTableEmpty
                colSpan={6}
                title="No promotions yet"
                description="Create a campaign to attach listings or homepage banners."
              />
            ) : null}
            {data?.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell className="font-medium">{promotion.name}</TableCell>
                <TableCell>{promotion.type.replaceAll('_', ' ')}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(promotion.startDate)} –{' '}
                  {formatDate(promotion.endDate)}
                </TableCell>
                <TableCell>{promotion._count?.listings ?? 0}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={
                      promotion.isActive
                        ? 'ACTIVE'
                        : new Date(promotion.endDate) < new Date()
                          ? 'EXPIRED'
                          : 'CANCELLED'
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetail(promotion)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PromotionDetailSheet
        promotionId={selectedId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setFocusAttach(false);
          }
        }}
        onEdit={openEdit}
        focusAttach={focusAttach}
      />

      <PromotionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        promotion={editing}
        onCreated={openDetailAfterCreate}
      />
    </div>
  );
}
