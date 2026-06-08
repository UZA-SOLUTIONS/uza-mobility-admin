'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/permissions';
import { formatUsd } from '@/lib/admin/format';
import {
  useAdminPlatformSettings,
  useUpdatePlatformSettings,
} from '@/queries/platform-settings';

type FormState = {
  bookingFeeUsd: string;
  companyLegalName: string;
  companyBankName: string;
  companyAccountNumber: string;
};

export function AdminPlatformSettingsPanel() {
  const { can } = usePermissions();
  const canManage = can('platform-settings:manage');
  const { data, isLoading } = useAdminPlatformSettings(canManage);
  const update = useUpdatePlatformSettings();
  const [form, setForm] = useState<FormState>({
    bookingFeeUsd: '',
    companyLegalName: '',
    companyBankName: '',
    companyAccountNumber: '',
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      bookingFeeUsd: String(data.bookingFeeUsd),
      companyLegalName: data.companyLegalName,
      companyBankName: data.companyBankName,
      companyAccountNumber: data.companyAccountNumber,
    });
  }, [data]);

  if (!canManage) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Platform settings"
          description="Payment defaults for bookings and invoices."
        />
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage platform settings.
        </p>
      </div>
    );
  }

  const parsedFee = Number(form.bookingFeeUsd);
  const isValid =
    Number.isFinite(parsedFee) &&
    parsedFee > 0 &&
    form.companyLegalName.trim().length > 0 &&
    form.companyBankName.trim().length > 0 &&
    form.companyAccountNumber.trim().length > 0;

  const isDirty =
    data &&
    (parsedFee !== data.bookingFeeUsd ||
      form.companyLegalName.trim() !== data.companyLegalName ||
      form.companyBankName.trim() !== data.companyBankName ||
      form.companyAccountNumber.trim() !== data.companyAccountNumber);

  const onSave = () => {
    if (!isValid || !isDirty) return;
    update.mutate({
      bookingFeeUsd: parsedFee,
      companyLegalName: form.companyLegalName.trim(),
      companyBankName: form.companyBankName.trim(),
      companyAccountNumber: form.companyAccountNumber.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Default booking fee and company bank details used on new bookings and invoices."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="max-w-xl space-y-6 rounded-lg border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="booking-fee">Default booking fee (USD)</Label>
            <NumberInput
              id="booking-fee"
              min={0.01}
              step="0.01"
              value={form.bookingFeeUsd}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bookingFeeUsd: event.target.value,
                }))
              }
              disabled={update.isPending}
            />
            {data ? (
              <p className="text-xs text-muted-foreground">
                Current effective fee for new bookings:{' '}
                {formatUsd(data.bookingFeeUsd)}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-legal-name">Company legal name</Label>
            <Input
              id="company-legal-name"
              value={form.companyLegalName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  companyLegalName: event.target.value,
                }))
              }
              disabled={update.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-bank-name">Bank name</Label>
            <Input
              id="company-bank-name"
              value={form.companyBankName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  companyBankName: event.target.value,
                }))
              }
              disabled={update.isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-account-number">Account number</Label>
            <Input
              id="company-account-number"
              value={form.companyAccountNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  companyAccountNumber: event.target.value,
                }))
              }
              disabled={update.isPending}
            />
          </div>

          <Button
            type="button"
            disabled={!isValid || !isDirty || update.isPending}
            onClick={onSave}
          >
            {update.isPending ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      )}
    </div>
  );
}
