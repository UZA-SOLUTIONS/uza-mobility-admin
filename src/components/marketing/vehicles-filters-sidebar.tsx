'use client';

import Link from 'next/link';
import { useAppRouter } from '@/lib/navigation/use-app-router';
import { useCallback, useTransition } from 'react';
import { useMarketingCategories } from '@/components/marketing/marketing-catalog-context';
import { VehiclesFilterSelect } from '@/components/marketing/vehicles-filter-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { brand } from '@/lib/marketing/colors';
import { sortPublicCategories } from '@/lib/marketing/marketing-catalog-nav';
import {
  applyVehiclesSearchPatch,
  formatConditionLabel,
  vehiclesBodyTypeOptions,
  type BrowseFilterOptions,
  type VehiclesSearchParams,
} from '@/lib/marketing/vehicles-browse';
import { vehiclesHref } from '@/lib/marketing/vehicles-url';
import type { CategoryType } from '@/types/admin/marketplace';

const VEHICLE_CATEGORY_TYPES: CategoryType[] = [
  'PASSENGER_EV',
  'TWO_THREE_WHEEL',
  'COMMERCIAL_EV',
  'EV_PARTS_ACCESSORIES',
];

type VehiclesFiltersSidebarProps = {
  filters: VehiclesSearchParams;
  filterOptions: BrowseFilterOptions;
  disabled?: boolean;
};

function activeBodyTypes(filters: VehiclesSearchParams): string[] {
  if (filters.subcategories?.length) return filters.subcategories;
  if (filters.subcategory) return [filters.subcategory];
  return [];
}

export function VehiclesFiltersSidebar({
  filters,
  filterOptions,
  disabled,
}: VehiclesFiltersSidebarProps) {
  const router = useAppRouter();
  const [, startTransition] = useTransition();
  const categories = useMarketingCategories();
  const categoryTabs = sortPublicCategories(categories).filter((c) =>
    VEHICLE_CATEGORY_TYPES.includes(c.type),
  );
  const bodyTypes = vehiclesBodyTypeOptions(categories).filter(
    (bt) => !filters.category || bt.categorySlug === filters.category,
  );
  const selectedBody = activeBodyTypes(filters);

  const navigate = useCallback(
    (next: VehiclesSearchParams) => {
      startTransition(() => {
        router.push(vehiclesHref(next));
      });
    },
    [router],
  );

  const patch = (p: Partial<VehiclesSearchParams>) =>
    navigate(applyVehiclesSearchPatch(filters, p));

  const toggleBodyType = (slug: string) => {
    const set = new Set(selectedBody);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    const arr = [...set];
    if (arr.length === 0) {
      patch({ subcategory: undefined, subcategories: undefined });
    } else if (arr.length === 1) {
      patch({ subcategory: arr[0], subcategories: undefined });
    } else {
      patch({ subcategories: arr, subcategory: undefined });
    }
  };

  const hasActiveFilters =
    filters.category ||
    filters.subcategory ||
    filters.subcategories?.length ||
    filters.brand ||
    filters.model ||
    filters.condition ||
    filters.priceMin != null ||
    filters.priceMax != null;

  return (
    <aside
      className="w-full shrink-0 rounded-lg border border-[#E9E9E9] bg-white lg:w-72"
      aria-label="Vehicle filters"
    >
      <div className="flex flex-col gap-5 p-4">
        {categoryTabs.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#151515]">Category</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={vehiclesHref(
                  applyVehiclesSearchPatch(filters, {
                    category: undefined,
                    subcategory: undefined,
                    subcategories: undefined,
                  }),
                )}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  !filters.category
                    ? 'border-transparent font-medium text-white'
                    : 'border-[#E9E9E9] text-[#356769] hover:border-[#174438]/30'
                }`}
                style={
                  !filters.category
                    ? { backgroundColor: brand.forest }
                    : undefined
                }
              >
                All
              </Link>
              {categoryTabs.map((cat) => {
                const active = filters.category === cat.slug;
                return (
                  <Link
                    key={cat.slug}
                    href={vehiclesHref(
                      applyVehiclesSearchPatch(filters, {
                        category: cat.slug,
                        subcategory: undefined,
                        subcategories: undefined,
                      }),
                    )}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active
                        ? 'border-transparent font-medium text-white'
                        : 'border-[#E9E9E9] text-[#356769] hover:border-[#174438]/30'
                    }`}
                    style={
                      active ? { backgroundColor: brand.forest } : undefined
                    }
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {bodyTypes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#151515]">Body type</p>
            <ul className="space-y-2">
              {bodyTypes.map((bt) => (
                <li key={bt.slug}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#356769]">
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={selectedBody.includes(bt.slug)}
                      onChange={() => toggleBodyType(bt.slug)}
                      className="size-4 shrink-0 rounded border border-[#E9E9E9] accent-[#174438]"
                    />
                    {bt.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <VehiclesFilterSelect
          label="Make"
          placeholder="Any make"
          value={filters.brand}
          disabled={disabled}
          options={filterOptions.brands.map((b) => ({ value: b, label: b }))}
          onChange={(brandValue) => patch({ brand: brandValue })}
        />

        <VehiclesFilterSelect
          label="Model"
          placeholder="Any model"
          value={filters.model}
          disabled={disabled || !filters.brand}
          options={filterOptions.models.map((m) => ({ value: m, label: m }))}
          onChange={(model) => patch({ model })}
        />

        <VehiclesFilterSelect
          label="Condition"
          placeholder="Any condition"
          value={filters.condition}
          disabled={disabled}
          options={filterOptions.conditions.map((c) => ({
            value: c,
            label: formatConditionLabel(c),
          }))}
          onChange={(condition) => patch({ condition })}
        />

        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#151515]">
            Price (USD)
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="numeric"
              disabled={disabled}
              placeholder={
                filterOptions.priceRange
                  ? String(filterOptions.priceRange.min)
                  : 'Min'
              }
              value={filters.priceMin ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                patch({
                  priceMin:
                    v === ''
                      ? undefined
                      : Number.isFinite(Number(v))
                        ? Number(v)
                        : undefined,
                });
              }}
              className="h-11"
            />
            <Input
              type="number"
              inputMode="numeric"
              disabled={disabled}
              placeholder={
                filterOptions.priceRange
                  ? String(filterOptions.priceRange.max)
                  : 'Max'
              }
              value={filters.priceMax ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                patch({
                  priceMax:
                    v === ''
                      ? undefined
                      : Number.isFinite(Number(v))
                        ? Number(v)
                        : undefined,
                });
              }}
              className="h-11"
            />
          </div>
        </div>

        {hasActiveFilters ? (
          <Link
            href={vehiclesHref({
              q: filters.q,
              sort: filters.sort,
              stock: filters.stock,
            })}
            className="text-center text-sm font-medium hover:underline"
            style={{ color: brand.forest }}
          >
            Clear filters
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
