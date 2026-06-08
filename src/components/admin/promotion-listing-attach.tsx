'use client';

import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminListings } from '@/queries/admin';
import { useAttachPromotionListings } from '@/queries/operations';
import { isListingDiscountType } from '@/lib/admin/promotion-config';
import type { PromotionType } from '@/types/admin/operations';

type PromotionListingAttachProps = {
  promotionId: string;
  promotionType: PromotionType;
  attachedListingIds: Set<string>;
};

export function PromotionListingAttach({
  promotionId,
  promotionType,
  attachedListingIds,
}: PromotionListingAttachProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const listingsQuery = useAdminListings({
    page: 1,
    limit: 50,
    q: debouncedSearch || undefined,
  });

  const attach = useAttachPromotionListings();

  const candidates = useMemo(
    () =>
      (listingsQuery.data?.items ?? []).filter(
        (listing) => !attachedListingIds.has(listing.id),
      ),
    [listingsQuery.data?.items, attachedListingIds],
  );

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAttach = () => {
    if (selected.size === 0) return;
    attach.mutate(
      { id: promotionId, body: { listingIds: [...selected] } },
      {
        onSuccess: () => setSelected(new Set()),
      },
    );
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Attach listings</p>
        <p className="text-xs text-muted-foreground">
          {isListingDiscountType(promotionType)
            ? 'Select one or more vehicles to apply this discount.'
            : 'Optionally link vehicles for deep links or featured placement.'}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="promo-listing-search">Search listings</Label>
        <Input
          id="promo-listing-search"
          placeholder="Title, brand, model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-md border">
        {listingsQuery.isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}
        {!listingsQuery.isLoading && candidates.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {debouncedSearch
              ? 'No matching listings, or they are already attached.'
              : 'No listings available to attach.'}
          </p>
        ) : null}
        {candidates.map((listing) => (
          <label
            key={listing.id}
            className="flex cursor-pointer items-start gap-3 border-b px-3 py-2.5 last:border-b-0 hover:bg-muted/40"
          >
            <Checkbox
              checked={selected.has(listing.id)}
              onCheckedChange={() => toggle(listing.id)}
              className="mt-0.5"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                {listing.listingTitle}
              </span>
              <span className="block text-xs text-muted-foreground">
                {[listing.brand, listing.model].filter(Boolean).join(' ')}
                {listing.status ? ` · ${listing.status}` : ''}
              </span>
            </span>
          </label>
        ))}
      </div>

      <Button
        type="button"
        disabled={selected.size === 0 || attach.isPending}
        onClick={handleAttach}
      >
        {attach.isPending
          ? 'Attaching…'
          : selected.size > 0
            ? `Attach ${selected.size} listing${selected.size === 1 ? '' : 's'}`
            : 'Attach selected listings'}
      </Button>
    </div>
  );
}
