'use client';

import Image from 'next/image';
import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  NumberInput,
  numberRegisterOptions,
} from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
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
import { formatDate, formatDateTime, formatUsd } from '@/lib/admin/format';
import {
  useConfirmPayment,
  useMarkPartialPayment,
  useRejectPayment,
} from '@/queries/commerce';
import {
  partialPaymentSchema,
  rejectPaymentSchema,
  type PartialPaymentInput,
  type RejectPaymentInput,
} from '@/schemas/commerce';
import type { AdminPayment } from '@/types/admin/commerce';

function isImageProof(fileType: string) {
  return ['JPG', 'PNG', 'WEBP', 'GIF'].includes(fileType.toUpperCase());
}

type PaymentDetailSheetProps = {
  payment: AdminPayment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PaymentDetailSheet({
  payment,
  open,
  onOpenChange,
}: PaymentDetailSheetProps) {
  const { can } = usePermissions();
  const confirm = useConfirmPayment();
  const reject = useRejectPayment();
  const partial = useMarkPartialPayment();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);

  const rejectForm = useForm<RejectPaymentInput>({
    resolver: zodResolver(rejectPaymentSchema),
    defaultValues: { reason: '' },
  });

  const partialForm = useForm<PartialPaymentInput>({
    resolver: zodResolver(partialPaymentSchema),
    defaultValues: { amountReceived: undefined, notes: '' },
  });

  const busy = confirm.isPending || reject.isPending || partial.isPending;
  const canVerify = payment?.status === 'UNDER_VERIFICATION';

  if (!payment && !open) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl">
          {!payment ? (
            <div className="space-y-4 px-6 py-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">
                  Payment · {payment.invoice.invoiceNumber}
                </SheetTitle>
                <SheetDescription>
                  Ref {payment.invoice.paymentReference}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <StatusBadge status={payment.status} />

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Amount paid</dt>
                    <dd className="font-medium">
                      {formatUsd(payment.amountPaid)} {payment.currency}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Invoice total</dt>
                    <dd>{formatUsd(payment.invoice.totalAmountUsd)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Sender</dt>
                    <dd>{payment.senderName ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Bank</dt>
                    <dd>{payment.bankName ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Transfer ref</dt>
                    <dd>{payment.transferReference ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Payment date</dt>
                    <dd>{formatDate(payment.paymentDate)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd>{formatDateTime(payment.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Invoice status</dt>
                    <dd>
                      <StatusBadge status={payment.invoice.status} />
                    </dd>
                  </div>
                </dl>

                {payment.notes ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Buyer notes</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {payment.notes}
                    </p>
                  </div>
                ) : null}

                {payment.rejectionReason ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <p className="font-medium text-destructive">
                      Rejection reason
                    </p>
                    <p className="mt-1">{payment.rejectionReason}</p>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <p className="text-sm font-medium">Payment proofs</p>
                  {payment.proofs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No proof files attached.
                    </p>
                  ) : (
                    <ul className="grid grid-cols-2 gap-3">
                      {payment.proofs.map((proof) => (
                        <li
                          key={proof.id}
                          className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted"
                        >
                          {isImageProof(proof.fileType) ? (
                            <Image
                              src={proof.fileUrl}
                              alt={proof.fileName}
                              fill
                              className="object-cover"
                              sizes="200px"
                              unoptimized
                            />
                          ) : (
                            <a
                              href={proof.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex size-full flex-col items-center justify-center gap-1 p-3 text-center text-xs text-primary underline"
                            >
                              <span className="font-medium">
                                {proof.fileType}
                              </span>
                              <span className="line-clamp-2">
                                {proof.fileName}
                              </span>
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {canVerify && can('payments:verify') ? (
                  <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => confirm.mutate(payment.id)}
                    >
                      Confirm payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => setPartialOpen(true)}
                    >
                      Mark partial
                    </Button>
                    {can('payments:reject') ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        onClick={() => setRejectOpen(true)}
                      >
                        Reject
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={rejectForm.handleSubmit((values) => {
              if (!payment) return;
              reject.mutate(
                { id: payment.id, body: values },
                {
                  onSuccess: () => {
                    setRejectOpen(false);
                    rejectForm.reset();
                    onOpenChange(false);
                  },
                },
              );
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason">Reason</Label>
              <Textarea
                id="reject-reason"
                rows={3}
                {...rejectForm.register('reason')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={busy}>
                Reject payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark partial payment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={partialForm.handleSubmit((values) => {
              if (!payment) return;
              partial.mutate(
                { id: payment.id, body: values },
                {
                  onSuccess: () => {
                    setPartialOpen(false);
                    partialForm.reset();
                    onOpenChange(false);
                  },
                },
              );
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="partial-amount">Amount received (optional)</Label>
              <NumberInput
                id="partial-amount"
                min={0}
                step="0.01"
                {...partialForm.register(
                  'amountReceived',
                  numberRegisterOptions(),
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partial-notes">Notes (optional)</Label>
              <Textarea
                id="partial-notes"
                rows={2}
                {...partialForm.register('notes')}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPartialOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
