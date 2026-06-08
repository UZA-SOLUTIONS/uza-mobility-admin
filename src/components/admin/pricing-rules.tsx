'use client';

import { useState } from 'react';
import { PricingRuleFormDialog } from '@/components/admin/pricing-rule-form-dialog';
import { SuperAdminGate } from '@/components/admin/super-admin-gate';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useAdminPricingRules,
  useDeactivatePricingRule,
  useUpdatePricingRule,
} from '@/queries/platform';
import type { PricingRule } from '@/types/admin/platform';

export function AdminPricingRulesPanel() {
  const { data, isLoading, isError, error } = useAdminPricingRules();
  const deactivate = useDeactivatePricingRule();
  const update = useUpdatePricingRule();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PricingRule | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PricingRule | null>(
    null,
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (rule: PricingRule) => {
    setEditing(rule);
    setFormOpen(true);
  };

  const reactivate = (rule: PricingRule) => {
    update.mutate({ id: rule.id, body: { isActive: true } });
  };

  return (
    <SuperAdminGate>
      <div className="space-y-6">
        <PageHeader
          title="Pricing rules"
          description="Configure how listing prices are calculated per seller channel and route."
        />

        <Button onClick={openCreate}>Add pricing rule</Button>

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error
              ? error.message
              : 'Failed to load pricing rules.'}
          </p>
        ) : null}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Margin / rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {data?.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No pricing rules yet.
                  </TableCell>
                </TableRow>
              ) : null}
              {data?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.sellerType.replaceAll('_', ' ')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[rule.originCountry, rule.destinationCountry]
                      .filter(Boolean)
                      .join(' → ') || 'Any route'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {rule.platformMarginPercent != null
                      ? `${rule.platformMarginPercent}% margin`
                      : rule.commissionRate != null
                        ? `${(rule.commissionRate * 100).toFixed(1)}% commission`
                        : '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={rule.isActive ? 'ACTIVE' : 'CANCELLED'}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(rule)}
                      >
                        Edit
                      </Button>
                      {rule.isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeactivateTarget(rule)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={update.isPending}
                          onClick={() => reactivate(rule)}
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <PricingRuleFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          rule={editing}
        />

        <ConfirmDialog
          open={Boolean(deactivateTarget)}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
          title="Deactivate pricing rule?"
          description="Listings will fall back to other matching rules or defaults."
          confirmLabel="Deactivate"
          variant="destructive"
          loading={deactivate.isPending}
          onConfirm={() => {
            if (!deactivateTarget) return;
            deactivate.mutate(deactivateTarget.id, {
              onSuccess: () => setDeactivateTarget(null),
            });
          }}
        />
      </div>
    </SuperAdminGate>
  );
}
