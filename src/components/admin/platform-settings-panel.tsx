'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/hooks/permissions';
import { formatRwf, formatUsd } from '@/lib/admin/format';
import {
  useAdminPlatformSettings,
  useRefreshExchangeRate,
  useUpdatePlatformSettings,
} from '@/queries/platform-settings';

type FormState = {
  bookingFeeUsd: string;
  companyLegalName: string;
  companyBankName: string;
  companyAccountNumber: string;
  companyBankNameRwf: string;
  companyAccountNumberRwf: string;
  companyWhatsappNumber: string;
  rwfMarkupPercent: string;
};

export function AdminPlatformSettingsPanel() {
  const { can } = usePermissions();
  const canManage = can('platform-settings:manage');
  const { data, isLoading } = useAdminPlatformSettings(canManage);
  const update = useUpdatePlatformSettings();
  const refreshRate = useRefreshExchangeRate();
  const [form, setForm] = useState<FormState>({
    bookingFeeUsd: '',
    companyLegalName: '',
    companyBankName: '',
    companyAccountNumber: '',
    companyBankNameRwf: '',
    companyAccountNumberRwf: '',
    companyWhatsappNumber: '',
    rwfMarkupPercent: '2',
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      bookingFeeUsd: String(data.bookingFeeUsd),
      companyLegalName: data.companyLegalName,
      companyBankName: data.companyBankName,
      companyAccountNumber: data.companyAccountNumber,
      companyBankNameRwf: data.companyBankNameRwf ?? '',
      companyAccountNumberRwf: data.companyAccountNumberRwf ?? '',
      companyWhatsappNumber: data.companyWhatsappNumber,
      rwfMarkupPercent: String(data.rwfMarkupPercent ?? 2),
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
  const parsedMarkup = Number(form.rwfMarkupPercent);
  const isValid =
    Number.isFinite(parsedFee) &&
    parsedFee > 0 &&
    Number.isFinite(parsedMarkup) &&
    parsedMarkup >= 0 &&
    parsedMarkup <= 100 &&
    form.companyLegalName.trim().length > 0 &&
    form.companyBankName.trim().length > 0 &&
    form.companyAccountNumber.trim().length > 0 &&
    form.companyBankNameRwf.trim().length > 0 &&
    form.companyAccountNumberRwf.trim().length > 0 &&
    form.companyWhatsappNumber.replace(/\D/g, '').length >= 8;

  const isDirty =
    data &&
    (parsedFee !== data.bookingFeeUsd ||
      parsedMarkup !== data.rwfMarkupPercent ||
      form.companyLegalName.trim() !== data.companyLegalName ||
      form.companyBankName.trim() !== data.companyBankName ||
      form.companyAccountNumber.trim() !== data.companyAccountNumber ||
      form.companyBankNameRwf.trim() !== (data.companyBankNameRwf ?? '') ||
      form.companyAccountNumberRwf.trim() !==
        (data.companyAccountNumberRwf ?? '') ||
      form.companyWhatsappNumber.replace(/\D/g, '') !==
        data.companyWhatsappNumber.replace(/\D/g, ''));

  const onSave = () => {
    if (!isValid || !isDirty) return;
    update.mutate({
      bookingFeeUsd: parsedFee,
      companyLegalName: form.companyLegalName.trim(),
      companyBankName: form.companyBankName.trim(),
      companyAccountNumber: form.companyAccountNumber.trim(),
      companyBankNameRwf: form.companyBankNameRwf.trim(),
      companyAccountNumberRwf: form.companyAccountNumberRwf.trim(),
      companyWhatsappNumber: form.companyWhatsappNumber.replace(/\D/g, ''),
      rwfMarkupPercent: parsedMarkup,
    });
  };

  const rate = data?.exchangeRate;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Default booking fee, USD and Rwf bank accounts, WhatsApp, and USDT→Rwf conversion markup."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="max-w-xl space-y-6 rounded-lg border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="booking-fee">Default booking fee (USDT)</Label>
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

          <div className="space-y-3 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">USDT → Rwf exchange</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={refreshRate.isPending}
                onClick={() => refreshRate.mutate()}
              >
                {refreshRate.isPending ? 'Refreshing…' : 'Refresh rate'}
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rwf-markup">Markup percent (%)</Label>
              <NumberInput
                id="rwf-markup"
                min={0}
                max={100}
                step="0.1"
                value={form.rwfMarkupPercent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rwfMarkupPercent: event.target.value,
                  }))
                }
                disabled={update.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Applied on top of the API mid-market rate so displayed Rwf stays
                slightly above market.
              </p>
            </div>
            {rate ? (
              <dl className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  API rate:{' '}
                  <span className="font-medium text-foreground">
                    {rate.usdToRwfApi.toFixed(4)}
                  </span>
                </div>
                <div>
                  Effective rate:{' '}
                  <span className="font-medium text-foreground">
                    {rate.usdToRwfEffective.toFixed(4)}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  Example 1,000 USDT →{' '}
                  <span className="font-medium text-foreground">
                    {formatRwf(Math.round(1000 * rate.usdToRwfEffective))}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  Last fetched:{' '}
                  {rate.rateFetchedAt
                    ? new Date(rate.rateFetchedAt).toLocaleString()
                    : 'Never — click Refresh rate'}
                </div>
              </dl>
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

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">USD receiving account</p>
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
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-sm font-medium">Rwf receiving account</p>
            <div className="space-y-1.5">
              <Label htmlFor="company-bank-name-rwf">Bank name</Label>
              <Input
                id="company-bank-name-rwf"
                value={form.companyBankNameRwf}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyBankNameRwf: event.target.value,
                  }))
                }
                disabled={update.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-account-number-rwf">Account number</Label>
              <Input
                id="company-account-number-rwf"
                value={form.companyAccountNumberRwf}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    companyAccountNumberRwf: event.target.value,
                  }))
                }
                disabled={update.isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company-whatsapp-number">WhatsApp number</Label>
            <Input
              id="company-whatsapp-number"
              inputMode="tel"
              placeholder="250788000000"
              value={form.companyWhatsappNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  companyWhatsappNumber: event.target.value,
                }))
              }
              disabled={update.isPending}
            />
            <p className="text-xs text-muted-foreground">
              International format without + — used on quote PDFs and inquiry
              emails.
            </p>
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
