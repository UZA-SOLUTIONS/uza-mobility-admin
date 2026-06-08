'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/permissions';
import { formatDate, formatUsd } from '@/lib/admin/format';
import {
  useAdminBanks,
  useAdminFinancingRequest,
  useAssignFinancingBank,
  useRecordFinancingOutcome,
} from '@/queries/commerce';
import {
  assignBankSchema,
  financingOutcomeSchema,
  type AssignBankInput,
  type FinancingOutcomeInput,
} from '@/schemas/commerce';

type FinancingDetailSheetProps = {
  requestId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FinancingDetailSheet({
  requestId,
  open,
  onOpenChange,
}: FinancingDetailSheetProps) {
  const { can } = usePermissions();
  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useAdminFinancingRequest(open ? requestId : null);
  const { data: banks } = useAdminBanks(open);
  const assign = useAssignFinancingBank();
  const outcome = useRecordFinancingOutcome();
  const [assignOpen, setAssignOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);

  const assignForm = useForm<AssignBankInput>({
    resolver: zodResolver(assignBankSchema),
    defaultValues: { bankId: '', reviewNotes: '' },
  });

  const outcomeForm = useForm<FinancingOutcomeInput>({
    resolver: zodResolver(financingOutcomeSchema),
    defaultValues: { status: 'BANK_APPROVED', reviewNotes: '' },
  });

  useEffect(() => {
    if (!open) return;
    assignForm.reset({ bankId: '', reviewNotes: '' });
    outcomeForm.reset({ status: 'BANK_APPROVED', reviewNotes: '' });
  }, [open, requestId, assignForm, outcomeForm]);

  const busy = assign.isPending || outcome.isPending;
  const canAssign =
    request &&
    (request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW') &&
    can('financing:send-to-bank');
  const canRecordOutcome =
    request?.status === 'SENT_TO_BANK' && can('financing:send-to-bank');

  return (
    <>
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
                : 'Failed to load request.'}
            </p>
          ) : null}

          {request && !isLoading ? (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">{request.buyerName}</SheetTitle>
                <SheetDescription>
                  {request.user.email} · {request.phone}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <StatusBadge status={request.status} />

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Organization</dt>
                    <dd>{request.organizationName ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Preferred deposit</dt>
                    <dd>{formatUsd(request.preferredDepositUsd)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Preferred bank</dt>
                    <dd>{request.preferredBankName ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Assigned bank</dt>
                    <dd>{request.assignedBank?.name ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Linked invoice</dt>
                    <dd>{request.invoice?.invoiceNumber ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Invoice amount</dt>
                    <dd>
                      {request.invoice
                        ? formatUsd(request.invoice.totalAmountUsd)
                        : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd>{formatDate(request.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Updated</dt>
                    <dd>{formatDate(request.updatedAt)}</dd>
                  </div>
                </dl>

                {request.notes ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Buyer notes</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {request.notes}
                    </p>
                  </div>
                ) : null}

                {request.reviewNotes ? (
                  <div className="rounded-md border bg-muted/30 p-4 text-sm">
                    <p className="font-medium">Internal review notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {request.reviewNotes}
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
                  {canAssign ? (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => setAssignOpen(true)}
                    >
                      Assign bank
                    </Button>
                  ) : null}
                  {canRecordOutcome ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setOutcomeOpen(true)}
                    >
                      Record outcome
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign bank partner</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={assignForm.handleSubmit((values) => {
              if (!request) return;
              assign.mutate(
                { id: request.id, body: values },
                {
                  onSuccess: () => {
                    setAssignOpen(false);
                    assignForm.reset();
                  },
                },
              );
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Bank</Label>
              <Select
                value={assignForm.watch('bankId')}
                onValueChange={(value) => assignForm.setValue('bankId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks?.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name} ({bank.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assign-notes">Internal notes (optional)</Label>
              <Textarea
                id="assign-notes"
                rows={3}
                {...assignForm.register('reviewNotes')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Send to bank
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={outcomeOpen} onOpenChange={setOutcomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record bank outcome</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={outcomeForm.handleSubmit((values) => {
              if (!request) return;
              outcome.mutate(
                { id: request.id, body: values },
                {
                  onSuccess: () => {
                    setOutcomeOpen(false);
                    outcomeForm.reset();
                  },
                },
              );
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Outcome</Label>
              <Select
                value={outcomeForm.watch('status')}
                onValueChange={(value) =>
                  outcomeForm.setValue(
                    'status',
                    value as FinancingOutcomeInput['status'],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_APPROVED">Bank approved</SelectItem>
                  <SelectItem value="BANK_REJECTED">Bank rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outcome-notes">Internal notes (optional)</Label>
              <Textarea
                id="outcome-notes"
                rows={3}
                {...outcomeForm.register('reviewNotes')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOutcomeOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Save outcome
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
