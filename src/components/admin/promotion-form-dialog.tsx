'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePickerField } from '@/components/ui/date-picker-field';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildPromotionApiPayload,
  isBannerPromotionType,
  PROMOTION_TYPE_GROUPS,
  promotionTypeHint,
  showDiscountFields,
  showPartnerWebsiteField,
} from '@/lib/admin/promotion-config';
import { useCreatePromotion, useUpdatePromotion } from '@/queries/operations';
import {
  createPromotionSchema,
  type CreatePromotionInput,
} from '@/schemas/operations';
import type { AdminPromotion } from '@/types/admin/operations';

type PromotionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion?: AdminPromotion | null;
  /** Opens the detail sheet so admin can attach listings immediately. */
  onCreated?: (promotion: AdminPromotion) => void;
};

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function PromotionFormDialog({
  open,
  onOpenChange,
  promotion,
  onCreated,
}: PromotionFormDialogProps) {
  const isEdit = Boolean(promotion);
  const create = useCreatePromotion();
  const update = useUpdatePromotion();
  const [banner, setBanner] = useState<File | null>(null);

  const form = useForm<CreatePromotionInput>({
    resolver: zodResolver(createPromotionSchema),
    defaultValues: {
      name: '',
      type: 'DISCOUNT_CAMPAIGN',
      startDate: '',
      endDate: '',
    },
  });

  const selectedType = form.watch('type');
  const startDate = form.watch('startDate');
  const showDiscounts = showDiscountFields(selectedType);
  const showBanner = isBannerPromotionType(selectedType);
  const showPartnerLink = showPartnerWebsiteField(selectedType);

  useEffect(() => {
    if (!open) return;
    setBanner(null);
    if (promotion) {
      form.reset({
        name: promotion.name,
        type: promotion.type,
        sponsorName: promotion.sponsorName ?? '',
        discountAmountUsd: promotion.discountAmountUsd ?? undefined,
        discountPercent: promotion.discountPercent ?? undefined,
        startDate: toDateInput(promotion.startDate),
        endDate: toDateInput(promotion.endDate),
        partnerWebsiteUrl: promotion.clickUrl ?? '',
        notes: promotion.notes ?? '',
      });
    } else {
      form.reset({
        name: '',
        type: 'DISCOUNT_CAMPAIGN',
        startDate: '',
        endDate: '',
        partnerWebsiteUrl: '',
      });
    }
  }, [open, promotion, form]);

  const busy = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const body = buildPromotionApiPayload({
      ...values,
      sponsorName: values.sponsorName?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      partnerWebsiteUrl: values.partnerWebsiteUrl?.trim() || undefined,
    });

    if (isEdit && promotion) {
      update.mutate(
        { id: promotion.id, body, banner: banner ?? undefined },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(
        { body, banner: banner ?? undefined },
        {
          onSuccess: (created) => {
            onOpenChange(false);
            onCreated?.(created);
          },
        },
      );
    }
  });

  const endMinDate = startDate
    ? (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 1);
        return d;
      })()
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit promotion' : 'Create promotion'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="promo-name">Name</Label>
            <Input id="promo-name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Campaign type</Label>
            <Select
              value={selectedType}
              onValueChange={(v) =>
                form.setValue('type', v as CreatePromotionInput['type'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMOTION_TYPE_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {promotionTypeHint(selectedType)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <DatePickerField
                  id="promo-start"
                  label="Start date"
                  value={field.value}
                  onChange={field.onChange}
                  error={form.formState.errors.startDate?.message}
                />
              )}
            />
            <Controller
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <DatePickerField
                  id="promo-end"
                  label="End date"
                  value={field.value}
                  onChange={field.onChange}
                  minDate={endMinDate}
                  error={form.formState.errors.endDate?.message}
                />
              )}
            />
          </div>

          {showDiscounts ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="promo-discount-usd">Discount (USD)</Label>
                <NumberInput
                  id="promo-discount-usd"
                  {...form.register(
                    'discountAmountUsd',
                    numberRegisterOptions(),
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="promo-discount-pct">Discount (%)</Label>
                <NumberInput
                  id="promo-discount-pct"
                  {...form.register('discountPercent', numberRegisterOptions())}
                />
              </div>
            </div>
          ) : null}

          {showBanner ? (
            <div className="space-y-1.5">
              <Label htmlFor="promo-banner">Banner image</Label>
              <Input
                id="promo-banner"
                type="file"
                accept="image/*"
                onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Placement is set automatically from the campaign type.
              </p>
            </div>
          ) : null}

          {showPartnerLink ? (
            <div className="space-y-1.5">
              <Label htmlFor="promo-partner-url">
                Partner website (optional)
              </Label>
              <Input
                id="promo-partner-url"
                type="url"
                placeholder="https://partner.example.com"
                {...form.register('partnerWebsiteUrl')}
              />
              <p className="text-xs text-muted-foreground">
                External link when the banner is tapped. Listing discounts use
                attached vehicles instead.
              </p>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="promo-sponsor">Sponsor name (optional)</Label>
            <Input id="promo-sponsor" {...form.register('sponsorName')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="promo-notes">Internal notes</Label>
            <Textarea id="promo-notes" rows={2} {...form.register('notes')} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
