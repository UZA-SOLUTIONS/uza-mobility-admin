'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PendingPhotoPicker } from '@/components/shared/pending-photo-picker';
import {
  pendingPhotoFiles,
  revokePendingPhotos,
  type PendingPhoto,
} from '@/lib/pending-photos';
import {
  useCreateChargingProduct,
  useUpdateChargingProduct,
} from '@/queries/operations';
import {
  createChargingProductSchema,
  MAX_ENERGY_PRODUCT_PHOTOS,
  type CreateChargingProductInput,
} from '@/schemas/operations';
import {
  chargingProductTypes,
  type ChargingProduct,
} from '@/types/admin/operations';

type EnergyProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ChargingProduct | null;
};

export function EnergyProductFormDialog({
  open,
  onOpenChange,
  product,
}: EnergyProductFormDialogProps) {
  const isEdit = Boolean(product);
  const create = useCreateChargingProduct();
  const update = useUpdateChargingProduct();
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

  const form = useForm<CreateChargingProductInput>({
    resolver: zodResolver(createChargingProductSchema),
    defaultValues: {
      name: '',
      productType: 'HOME_CHARGER',
      brand: '',
      solarIncluded: false,
      connectorTypes: [],
    },
  });

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({
        name: product.name,
        productType: product.productType,
        brand: product.brand ?? '',
        powerKw: product.powerKw ?? undefined,
        voltage: product.voltage ?? '',
        connectorTypes: product.connectorTypes,
        solarIncluded: product.solarIncluded,
        priceUsd: product.priceUsd ?? undefined,
        description: product.description ?? '',
      });
    } else {
      form.reset({
        name: '',
        productType: 'HOME_CHARGER',
        brand: '',
        solarIncluded: false,
        connectorTypes: [],
      });
    }
    setPendingPhotos([]);
  }, [open, product, form]);

  useEffect(() => {
    return () => revokePendingPhotos(pendingPhotos);
  }, [pendingPhotos]);

  const busy = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const photos = pendingPhotoFiles(pendingPhotos);
    const payload = {
      ...values,
      brand: values.brand?.trim() || undefined,
      voltage: values.voltage?.trim() || undefined,
      description: values.description?.trim() || undefined,
    };

    if (isEdit && product) {
      update.mutate(
        { id: product.id, body: payload, photos },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      create.mutate(
        { body: payload, photos },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit charging product' : 'Add charging product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ep-name">Name</Label>
            <Input id="ep-name" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label>Product type</Label>
            <Select
              value={form.watch('productType')}
              onValueChange={(v) =>
                form.setValue(
                  'productType',
                  v as CreateChargingProductInput['productType'],
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chargingProductTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ep-brand">Brand</Label>
              <Input id="ep-brand" {...form.register('brand')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-power">Power (kW)</Label>
              <NumberInput
                id="ep-power"
                step="0.1"
                {...form.register('powerKw', numberRegisterOptions())}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ep-voltage">Voltage</Label>
              <Input id="ep-voltage" {...form.register('voltage')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-price">Price (USD)</Label>
              <NumberInput
                id="ep-price"
                {...form.register('priceUsd', numberRegisterOptions())}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ep-desc">Description</Label>
            <Textarea id="ep-desc" rows={3} {...form.register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <PendingPhotoPicker
              photos={pendingPhotos}
              maxPhotos={MAX_ENERGY_PRODUCT_PHOTOS}
              onChange={setPendingPhotos}
            />
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
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
