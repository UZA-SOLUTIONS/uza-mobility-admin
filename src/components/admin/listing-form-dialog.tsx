'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExistingPhotosGrid } from '@/components/shared/existing-photos-grid';
import { PendingPhotoPicker } from '@/components/shared/pending-photo-picker';
import {
  pendingPhotoFiles,
  revokePendingPhotos,
  type PendingPhoto,
} from '@/lib/pending-photos';
import { adminListingToFormValues } from '@/lib/admin/listing-form';
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
import {
  useAdminCategories,
  useCreateAdminListing,
  useUpdateAdminListing,
} from '@/queries/admin';
import {
  adminCreateListingSchema,
  adminListingFormSchema,
  adminListingInitialStatuses,
  adminListingStatusEditOptions,
  adminUpdateListingSchema,
  formatListingChargingType,
  formatListingEnumLabel,
  listingBodyTypes,
  listingChargingTypes,
  listingConditions,
  listingDrivetrains,
  listingPowertrainTypes,
  listingSteeringPositions,
  listingUseCases,
  MAX_LISTING_PHOTOS,
  type AdminListingFormInput,
} from '@/schemas/admin';
import type { AdminListing } from '@/types/admin/marketplace';

type ListingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing?: AdminListing | null;
};

export function ListingFormDialog({
  open,
  onOpenChange,
  listing = null,
}: ListingFormDialogProps) {
  const isEdit = Boolean(listing);
  const create = useCreateAdminListing();
  const update = useUpdateAdminListing();
  const { data: categories } = useAdminCategories({ isActive: true }, open);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const existingPhotos = listing?.photos ?? [];
  const keptExistingPhotos = useMemo(
    () => existingPhotos.filter((photo) => !removedPhotoIds.includes(photo.id)),
    [existingPhotos, removedPhotoIds],
  );
  const remainingPhotoSlots = Math.max(
    0,
    MAX_LISTING_PHOTOS - keptExistingPhotos.length - photos.length,
  );
  const busy = create.isPending || update.isPending;

  const form = useForm<AdminListingFormInput>({
    resolver: zodResolver(adminListingFormSchema),
    defaultValues: {
      sellerType: 'UZA_RWANDA_STOCK',
      initialStatus: 'PENDING_REVIEW',
      listingTitle: '',
      categoryId: '',
      subcategoryId: '',
      brand: '',
      model: '',
      trim: '',
      manufacturingYear: new Date().getFullYear(),
      condition: 'NEW',
      vehicleLocation: '',
      city: 'Kigali',
      country: 'RW',
      description: '',
    },
  });

  const sellerType = form.watch('sellerType');
  const categoryId = form.watch('categoryId');
  const statusOptions = listing
    ? adminListingStatusEditOptions(listing.status)
    : [];
  const canEditStatus = isEdit && statusOptions.length > 1;
  const selectedCategory = categories?.find(
    (category) => category.id === categoryId,
  );
  const subcategories = selectedCategory?.subcategories ?? [];

  useEffect(() => {
    if (!open) return;
    setPhotos((current) => {
      revokePendingPhotos(current);
      return [];
    });
    setRemovedPhotoIds([]);
    setVideoFile(null);
    setRemoveVideo(false);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    if (listing) {
      form.reset(adminListingToFormValues(listing));
    } else {
      form.reset({
        sellerType: 'UZA_RWANDA_STOCK',
        initialStatus: 'PENDING_REVIEW',
        listingTitle: '',
        categoryId: '',
        subcategoryId: '',
        brand: '',
        model: '',
        trim: '',
        manufacturingYear: new Date().getFullYear(),
        condition: 'NEW',
        vehicleLocation: '',
        city: 'Kigali',
        country: 'RW',
        description: '',
      });
    }
  }, [open, listing, form]);

  const onSubmit = form.handleSubmit((values) => {
    const newPhotos = pendingPhotoFiles(photos);

    if (isEdit && listing) {
      const totalPhotosAfterSave = keptExistingPhotos.length + newPhotos.length;
      if (totalPhotosAfterSave < 1) {
        toast.error('Keep at least one photo, or upload a replacement.');
        return;
      }

      const body = adminUpdateListingSchema.parse({
        ...values,
        removePhotoIds:
          removedPhotoIds.length > 0 ? removedPhotoIds : undefined,
        removeVideo: removeVideo || undefined,
      });

      update.mutate(
        {
          id: listing.id,
          body,
          photos: newPhotos,
          video: videoFile,
        },
        {
          onSuccess: () => {
            revokePendingPhotos(photos);
            setPhotos([]);
            onOpenChange(false);
          },
        },
      );
      return;
    }

    create.mutate(
      {
        body: adminCreateListingSchema.parse(values),
        photos: newPhotos,
        video: videoFile,
      },
      {
        onSuccess: () => {
          revokePendingPhotos(photos);
          setPhotos([]);
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit platform listing' : 'New platform listing'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? 'Update your UZA stock or sourcing listing. New photos are added to existing ones.'
            : 'Each inventory channel uses its own seller profile on your account (e.g. Rwanda stock vs China sourcing).'}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Inventory channel</Label>
              <Select
                value={sellerType}
                disabled={isEdit}
                onValueChange={(value) => {
                  form.setValue(
                    'sellerType',
                    value as AdminListingFormInput['sellerType'],
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZA_RWANDA_STOCK">
                    UZA Rwanda stock
                  </SelectItem>
                  <SelectItem value="UZA_CHINA_SOURCING">
                    UZA China sourcing
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!isEdit ? (
              <div className="space-y-1.5">
                <Label>Initial status</Label>
                <Select
                  value={form.watch('initialStatus')}
                  onValueChange={(value) =>
                    form.setValue(
                      'initialStatus',
                      value as AdminListingFormInput['initialStatus'],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {adminListingInitialStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : canEditStatus ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.watch('status') ?? listing?.status}
                  onValueChange={(value) =>
                    form.setValue(
                      'status',
                      value as AdminListingFormInput['status'],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : isEdit && listing ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <p className="text-sm">{listing.status.replaceAll('_', ' ')}</p>
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="listing-title">Title</Label>
            <Input id="listing-title" {...form.register('listingTitle')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryId}
                onValueChange={(value) => {
                  form.setValue('categoryId', value);
                  form.setValue('subcategoryId', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select
                value={form.watch('subcategoryId') ?? ''}
                onValueChange={(value) =>
                  form.setValue('subcategoryId', value === 'none' ? '' : value)
                }
                disabled={subcategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...form.register('brand')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...form.register('model')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trim">Trim</Label>
              <Input id="trim" {...form.register('trim')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <NumberInput
                id="year"
                {...form.register('manufacturingYear', numberRegisterOptions())}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Condition</Label>
              <Select
                value={form.watch('condition')}
                onValueChange={(value) =>
                  form.setValue(
                    'condition',
                    value as AdminListingFormInput['condition'],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listingConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition.replaceAll('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <NumberInput
                id="mileage"
                min={0}
                {...form.register('mileageKm', numberRegisterOptions())}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">Vehicle details (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Body type</Label>
                <Select
                  value={form.watch('bodyType') ?? ''}
                  onValueChange={(value) =>
                    form.setValue(
                      'bodyType',
                      value === 'none'
                        ? undefined
                        : (value as AdminListingFormInput['bodyType']),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {listingBodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatListingEnumLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Powertrain</Label>
                <Select
                  value={form.watch('powertrainType') ?? ''}
                  onValueChange={(value) =>
                    form.setValue(
                      'powertrainType',
                      value === 'none'
                        ? undefined
                        : (value as AdminListingFormInput['powertrainType']),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {listingPowertrainTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Color</Label>
                <Input id="color" {...form.register('color')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seats">Seats</Label>
                <NumberInput
                  id="seats"
                  min={1}
                  {...form.register('seats', numberRegisterOptions())}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Steering</Label>
                <Select
                  value={form.watch('steeringPosition') ?? ''}
                  onValueChange={(value) =>
                    form.setValue(
                      'steeringPosition',
                      value === 'none'
                        ? undefined
                        : (value as AdminListingFormInput['steeringPosition']),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {listingSteeringPositions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatListingEnumLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Drivetrain</Label>
                <Select
                  value={form.watch('drivetrain') ?? ''}
                  onValueChange={(value) =>
                    form.setValue(
                      'drivetrain',
                      value === 'none'
                        ? undefined
                        : (value as AdminListingFormInput['drivetrain']),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {listingDrivetrains.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownership-count">Ownership count</Label>
                <NumberInput
                  id="ownership-count"
                  min={0}
                  {...form.register('ownershipCount', numberRegisterOptions())}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="registration-status">Registration status</Label>
                <Input
                  id="registration-status"
                  {...form.register('registrationStatus')}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="has-warranty"
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={form.watch('hasWarranty') ?? false}
                  onChange={(event) =>
                    form.setValue('hasWarranty', event.target.checked)
                  }
                />
                <Label htmlFor="has-warranty">Has warranty</Label>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="has-accident"
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={form.watch('hasAccidentHistory') ?? false}
                  onChange={(event) =>
                    form.setValue('hasAccidentHistory', event.target.checked)
                  }
                />
                <Label htmlFor="has-accident">Accident history</Label>
              </div>
            </div>
            {form.watch('hasWarranty') ? (
              <div className="space-y-1.5">
                <Label htmlFor="warranty-details">Warranty details</Label>
                <Textarea
                  id="warranty-details"
                  rows={2}
                  {...form.register('warrantyDetails')}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label>Use cases (optional)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listingUseCases.map((useCase) => {
                  const selected = form.watch('useCases') ?? [];
                  const checked = selected.includes(useCase);
                  return (
                    <label
                      key={useCase}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border"
                        checked={checked}
                        onChange={(event) => {
                          const next = event.target.checked
                            ? [...selected, useCase]
                            : selected.filter((value) => value !== useCase);
                          form.setValue(
                            'useCases',
                            next.length ? next : undefined,
                          );
                        }}
                      />
                      {formatListingEnumLabel(useCase)}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">EV specifications</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="range">Electric range (km)</Label>
                <NumberInput
                  id="range"
                  min={1}
                  {...form.register('rangeKm', numberRegisterOptions())}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Charging type</Label>
                <Select
                  value={form.watch('chargingType') ?? ''}
                  onValueChange={(value) =>
                    form.setValue(
                      'chargingType',
                      value as AdminListingFormInput['chargingType'],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select charging type" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingChargingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatListingChargingType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.chargingType ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.chargingType.message}
                  </p>
                ) : null}
              </div>
              {form.watch('condition') !== 'NEW' ? (
                <div className="space-y-1.5">
                  <Label htmlFor="battery-health">Battery health (%)</Label>
                  <NumberInput
                    id="battery-health"
                    min={0}
                    max={100}
                    {...form.register(
                      'batteryHealthPercent',
                      numberRegisterOptions(),
                    )}
                  />
                </div>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="battery-capacity">Battery capacity (kWh)</Label>
                <NumberInput
                  id="battery-capacity"
                  min={0}
                  step="0.1"
                  {...form.register(
                    'batteryCapacityKwh',
                    numberRegisterOptions(),
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="charging-time">Charging time (hours)</Label>
                <NumberInput
                  id="charging-time"
                  min={0}
                  step="0.1"
                  {...form.register(
                    'chargingTimeHours',
                    numberRegisterOptions(),
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="motor-power">Motor power (kW)</Label>
                <NumberInput
                  id="motor-power"
                  min={0}
                  {...form.register('motorPowerKw', numberRegisterOptions())}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="top-speed">Top speed (km/h)</Label>
                <NumberInput
                  id="top-speed"
                  min={0}
                  {...form.register('topSpeedKmh', numberRegisterOptions())}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payload">Payload (kg)</Label>
                <NumberInput
                  id="payload"
                  min={0}
                  {...form.register(
                    'payloadCapacityKg',
                    numberRegisterOptions(),
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gvwr">Gross vehicle weight (kg)</Label>
                <NumberInput
                  id="gvwr"
                  min={0}
                  {...form.register(
                    'grossVehicleWeightKg',
                    numberRegisterOptions(),
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seating-capacity">Seating capacity</Label>
                <NumberInput
                  id="seating-capacity"
                  min={1}
                  {...form.register('seatingCapacity', numberRegisterOptions())}
                />
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="battery-health-report"
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={form.watch('batteryHealthReport') ?? false}
                  onChange={(event) =>
                    form.setValue('batteryHealthReport', event.target.checked)
                  }
                />
                <Label htmlFor="battery-health-report">
                  Battery health report
                </Label>
              </div>
              <div className="flex items-end gap-2 pb-2">
                <input
                  id="fast-charging"
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={form.watch('fastChargingSupported') ?? false}
                  onChange={(event) =>
                    form.setValue('fastChargingSupported', event.target.checked)
                  }
                />
                <Label htmlFor="fast-charging">Fast charging supported</Label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Vehicle location</Label>
              <Input id="location" {...form.register('vehicleLocation')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...form.register('city')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="delivery-days">Delivery estimate (days)</Label>
              <NumberInput
                id="delivery-days"
                min={0}
                {...form.register(
                  'deliveryEstimateDays',
                  numberRegisterOptions(),
                )}
              />
            </div>
          </div>

          {sellerType === 'UZA_RWANDA_STOCK' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="base-price">Base price (USD)</Label>
                <NumberInput
                  id="base-price"
                  min={0}
                  step="0.01"
                  {...form.register('basePriceUsd', numberRegisterOptions())}
                />
                {form.formState.errors.basePriceUsd ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.basePriceUsd.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount">Discount (USD, optional)</Label>
                <NumberInput
                  id="discount"
                  min={0}
                  step="0.01"
                  {...form.register('discountUsd', numberRegisterOptions())}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fob-price">FOB price (USD)</Label>
                <NumberInput
                  id="fob-price"
                  min={0}
                  step="0.01"
                  {...form.register('fobPriceUsd', numberRegisterOptions())}
                />
                {form.formState.errors.fobPriceUsd ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.fobPriceUsd.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount-china">Discount (USD, optional)</Label>
                <NumberInput
                  id="discount-china"
                  min={0}
                  step="0.01"
                  {...form.register('discountUsd', numberRegisterOptions())}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="listing-desc">Description</Label>
            <Textarea
              id="listing-desc"
              rows={3}
              {...form.register('description')}
            />
          </div>

          {isEdit ? (
            <ExistingPhotosGrid
              photos={keptExistingPhotos}
              hint="Remove photos with ×, or add more below. At least one photo is required."
              onRemovePhoto={(photoId) =>
                setRemovedPhotoIds((current) =>
                  current.includes(photoId) ? current : [...current, photoId],
                )
              }
            />
          ) : null}

          {isEdit &&
          existingPhotos.length > 0 &&
          keptExistingPhotos.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              All current photos marked for removal. Upload at least one new
              photo before saving.
            </p>
          ) : null}

          <PendingPhotoPicker
            photos={photos}
            onChange={setPhotos}
            maxPhotos={isEdit ? remainingPhotoSlots : MAX_LISTING_PHOTOS}
            label={isEdit ? 'Add photos' : 'Listing photos'}
          />

          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor="listing-video">Hero video (optional)</Label>
            <p className="text-xs text-muted-foreground">
              MP4, WebM, or MOV. Shown on the vehicle page after the primary
              photo loads, like the homepage hero.
            </p>
            {isEdit && listing?.videoUrl && !removeVideo ? (
              <p className="text-sm text-muted-foreground">
                Current video is attached to this listing.
              </p>
            ) : null}
            {isEdit && listing?.videoUrl ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border"
                  checked={removeVideo}
                  onChange={(event) => {
                    setRemoveVideo(event.target.checked);
                    if (event.target.checked) {
                      setVideoFile(null);
                      if (videoInputRef.current) {
                        videoInputRef.current.value = '';
                      }
                    }
                  }}
                />
                Remove existing video
              </label>
            ) : null}
            <Input
              id="listing-video"
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              disabled={removeVideo}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setVideoFile(file);
                if (file) setRemoveVideo(false);
              }}
            />
            {videoFile ? (
              <p className="text-xs text-muted-foreground">
                Selected: {videoFile.name}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Create listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
