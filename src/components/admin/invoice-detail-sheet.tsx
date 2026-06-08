'use client';

import { StatusBadge } from '@/components/admin/shared/status-badge';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  downloadAdminInvoiceDocument,
  openAdminInvoiceDocument,
} from '@/lib/api/commerce';
import { useAdminInvoice, useCancelInvoice } from '@/queries/commerce';
import { useState } from 'react';

type InvoiceDetailSheetProps = {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InvoiceDetailSheet({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceDetailSheetProps) {
  const { can } = usePermissions();
  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useAdminInvoice(open ? invoiceId : null);
  const cancel = useCancelInvoice();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const canCancel =
    invoice &&
    !['CANCELLED', 'FULLY_PAID', 'PAYMENT_CONFIRMED'].includes(invoice.status);

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
                : 'Failed to load invoice.'}
            </p>
          ) : null}

          {invoice && !isLoading ? (
            <>
              <SheetHeader className="border-b px-6 py-5">
                <SheetTitle className="text-xl">
                  {invoice.invoiceNumber}
                </SheetTitle>
                <SheetDescription>
                  Pay ref {invoice.paymentReference} · {invoice.buyerName}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <StatusBadge status={invoice.status} />

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Buyer email</dt>
                    <dd>{invoice.buyerEmail ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Total (USD)</dt>
                    <dd className="font-medium">
                      {formatUsd(invoice.totalAmountUsd)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Vehicle</dt>
                    <dd>
                      {[invoice.vehicleBrand, invoice.vehicleModel]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Listing</dt>
                    <dd>{invoice.listing?.listingTitle ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Issued</dt>
                    <dd>{formatDate(invoice.issuedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Valid until</dt>
                    <dd>{formatDate(invoice.validUntil)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Payment deadline</dt>
                    <dd>{formatDate(invoice.paymentDeadline)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 sm:flex-col sm:gap-1">
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{formatDate(invoice.createdAt)}</dd>
                  </div>
                </dl>

                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Payments ({invoice.payments.length})
                    </p>
                    <ul className="space-y-2 text-sm">
                      {invoice.payments.map((payment) => (
                        <li
                          key={payment.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <span>{formatUsd(payment.amountPaid)}</span>
                          <StatusBadge status={payment.status} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/30 p-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={docLoading}
                    onClick={async () => {
                      if (!invoice) return;
                      setDocLoading(true);
                      try {
                        await openAdminInvoiceDocument(invoice.id);
                      } catch (err) {
                        window.alert(
                          err instanceof Error
                            ? err.message
                            : 'Could not open document',
                        );
                      } finally {
                        setDocLoading(false);
                      }
                    }}
                  >
                    {docLoading ? 'Opening…' : 'View'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={docLoading}
                    onClick={async () => {
                      if (!invoice) return;
                      setDocLoading(true);
                      try {
                        await downloadAdminInvoiceDocument(
                          invoice.id,
                          invoice.invoiceNumber,
                        );
                      } catch (err) {
                        window.alert(
                          err instanceof Error
                            ? err.message
                            : 'Could not download invoice',
                        );
                      } finally {
                        setDocLoading(false);
                      }
                    }}
                  >
                    {docLoading ? 'Downloading…' : 'Download'}
                  </Button>
                  {canCancel && can('invoices:cancel') ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={cancel.isPending}
                      onClick={() => setCancelOpen(true)}
                    >
                      Cancel invoice
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel invoice?"
        description={
          invoice
            ? `${invoice.invoiceNumber} will be cancelled and any listing reservation released.`
            : ''
        }
        confirmLabel="Cancel invoice"
        variant="destructive"
        loading={cancel.isPending}
        onConfirm={() => {
          if (!invoice) return;
          cancel.mutate(invoice.id, {
            onSuccess: () => {
              setCancelOpen(false);
              onOpenChange(false);
            },
          });
        }}
      />
    </>
  );
}
