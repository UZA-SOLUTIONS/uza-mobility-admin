'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchablePicker } from '@/components/admin/shared/searchable-picker';
import type { SearchablePickerOption } from '@/components/admin/shared/searchable-picker';
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
import { formatUsd } from '@/lib/admin/format';
import { useAdminListings } from '@/queries/admin';
import { useAdminBuyers, useCreateFleetInvoice } from '@/queries/commerce';
import {
  createFleetInvoiceSchema,
  type CreateFleetInvoiceInput,
} from '@/schemas/commerce';
import type { AdminBuyer } from '@/types/admin/commerce';
import type { AdminListing } from '@/types/admin/marketplace';

type FleetInvoiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (invoiceId: string) => void;
};

function buyerToOption(buyer: AdminBuyer): SearchablePickerOption {
  return {
    value: buyer.id,
    label: buyer.displayName,
    hint: buyer.email,
  };
}

function listingToOption(listing: AdminListing): SearchablePickerOption {
  const price = listing.listingPricing?.finalPriceUsd;
  return {
    value: listing.id,
    label: listing.listingTitle,
    hint: [
      `${listing.brand} ${listing.model}`,
      listing.manufacturingYear,
      price != null ? formatUsd(price) : null,
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

export function FleetInvoiceFormDialog({
  open,
  onOpenChange,
  onCreated,
}: FleetInvoiceFormDialogProps) {
  const create = useCreateFleetInvoice();
  const [buyerSearch, setBuyerSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');
  const debouncedBuyerSearch = useDebounce(buyerSearch, 300);
  const debouncedListingSearch = useDebounce(listingSearch, 300);
  const [selectedBuyer, setSelectedBuyer] = useState<AdminBuyer | null>(null);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(
    null,
  );

  const { data: buyers, isLoading: buyersLoading } = useAdminBuyers(
    { q: debouncedBuyerSearch || undefined },
    open,
  );

  const { data: listingsData, isLoading: listingsLoading } = useAdminListings(
    {
      q: debouncedListingSearch || undefined,
      limit: 50,
      page: 1,
    },
    open,
  );

  const buyerOptions = useMemo(
    () => buyers?.map(buyerToOption) ?? [],
    [buyers],
  );

  const listingOptions = useMemo(
    () => listingsData?.items.map(listingToOption) ?? [],
    [listingsData?.items],
  );

  const form = useForm<CreateFleetInvoiceInput>({
    resolver: zodResolver(createFleetInvoiceSchema),
    defaultValues: {
      userId: '',
      listingId: '',
      totalAmountUsd: 0,
      totalAmountRwf: undefined,
      notes: '',
    },
  });

  const userId = form.watch('userId');
  const listingId = form.watch('listingId');

  useEffect(() => {
    if (!open) return;
    setBuyerSearch('');
    setListingSearch('');
    setSelectedBuyer(null);
    setSelectedListing(null);
    form.reset({
      userId: '',
      listingId: '',
      totalAmountUsd: 0,
      totalAmountRwf: undefined,
      notes: '',
    });
  }, [open, form]);

  useEffect(() => {
    if (!userId) {
      setSelectedBuyer(null);
      return;
    }
    const match = buyers?.find((buyer) => buyer.id === userId);
    if (match) setSelectedBuyer(match);
  }, [userId, buyers]);

  useEffect(() => {
    if (!listingId) {
      setSelectedListing(null);
      return;
    }
    const match = listingsData?.items.find(
      (listing) => listing.id === listingId,
    );
    if (match) {
      setSelectedListing(match);
      const price = match.listingPricing?.finalPriceUsd;
      if (price != null && price > 0) {
        form.setValue('totalAmountUsd', price);
      }
    }
  }, [listingId, listingsData?.items, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (!selectedBuyer) return;
    create.mutate(
      {
        buyer: selectedBuyer,
        body: values,
        listing: selectedListing,
      },
      {
        onSuccess: (invoice) => {
          onCreated?.(invoice.id);
          onOpenChange(false);
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create fleet invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Search and pick a buyer and optionally a listing. Details are taken
            from the platform so the invoice stays consistent.
          </p>

          <SearchablePicker
            label="Buyer"
            value={userId}
            onValueChange={(value, option) => {
              form.setValue('userId', value, { shouldValidate: true });
              const buyer = buyers?.find((row) => row.id === value);
              setSelectedBuyer(buyer ?? null);
              if (!value) setBuyerSearch('');
            }}
            options={buyerOptions}
            selectedOption={selectedBuyer ? buyerToOption(selectedBuyer) : null}
            search={buyerSearch}
            onSearchChange={setBuyerSearch}
            isLoading={buyersLoading}
            placeholder="Select buyer"
            searchPlaceholder="Search by name, email, or organization"
            emptyMessage="No buyers match that search."
            error={form.formState.errors.userId?.message}
          />

          {selectedBuyer ? (
            <div className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Invoice will be addressed to</p>
              <p>{selectedBuyer.displayName}</p>
              <p className="text-muted-foreground">{selectedBuyer.email}</p>
              <p className="text-muted-foreground">
                {selectedBuyer.phone ?? 'No phone'}
                {selectedBuyer.buyerProfile?.city
                  ? ` · ${selectedBuyer.buyerProfile.city}, ${selectedBuyer.buyerProfile.country}`
                  : selectedBuyer.buyerProfile?.country
                    ? ` · ${selectedBuyer.buyerProfile.country}`
                    : ''}
              </p>
            </div>
          ) : null}

          <SearchablePicker
            label="Listing (optional)"
            value={listingId ?? ''}
            onValueChange={(value, option) => {
              form.setValue('listingId', value);
              if (!value) {
                setSelectedListing(null);
                setListingSearch('');
                return;
              }
              const listing = listingsData?.items.find(
                (row) => row.id === value,
              );
              if (listing) setSelectedListing(listing);
              else if (option) {
                setSelectedListing(null);
              }
            }}
            options={listingOptions}
            selectedOption={
              selectedListing ? listingToOption(selectedListing) : null
            }
            search={listingSearch}
            onSearchChange={setListingSearch}
            isLoading={listingsLoading}
            placeholder="No listing linked"
            searchPlaceholder="Search by title, brand, or model"
            emptyMessage="No listings match that search."
            allowClear
            helperText="Vehicle and USD amount are filled from the listing when selected."
          />

          {selectedListing ? (
            <div className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">Linked vehicle</p>
              <p>
                {selectedListing.brand} {selectedListing.model} ·{' '}
                {selectedListing.manufacturingYear}
              </p>
              <p className="text-muted-foreground">
                {selectedListing.listingTitle}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fleet-usd">Total (USD)</Label>
              <NumberInput
                id="fleet-usd"
                min={0}
                step="0.01"
                {...form.register('totalAmountUsd', numberRegisterOptions())}
              />
              {form.formState.errors.totalAmountUsd ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.totalAmountUsd.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fleet-rwf">Total (RWF, optional)</Label>
              <NumberInput
                id="fleet-rwf"
                min={0}
                step="1"
                {...form.register('totalAmountRwf', numberRegisterOptions())}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to auto-convert from the listing or default rate.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fleet-notes">Notes (optional)</Label>
            <Textarea id="fleet-notes" rows={2} {...form.register('notes')} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !selectedBuyer}>
              {create.isPending ? 'Creating…' : 'Create invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
