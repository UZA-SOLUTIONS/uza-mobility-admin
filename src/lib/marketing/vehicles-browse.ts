import type { Category, CategoryType } from '@/types/admin/marketplace';

export const VEHICLES_PAGE_SIZE = 9;

const VEHICLE_CATEGORY_TYPES: CategoryType[] = [
  'PASSENGER_EV',
  'TWO_THREE_WHEEL',
];

export type VehiclesSearchParams = {
  stock?: string;
  category?: string;
  subcategory?: string;
  subcategories?: string[];
  useCase?: string;
  q?: string;
  page?: number;
  sort?: string;
  brand?: string;
  model?: string;
  condition?: string;
  drivetrain?: string;
  color?: string;
  city?: string;
  country?: string;
  batteryCapacityKwh?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  priceMin?: number;
  priceMax?: number;
};

export type BrowseFilterOptions = {
  brands: string[];
  models: string[];
  conditions: string[];
  drivetrains: string[];
  colors: string[];
  cities: string[];
  countries: string[];
  batteryCapacitiesKwh: number[];
  yearRange: { min: number; max: number } | null;
  mileageRange: { min: number; max: number } | null;
  priceRange: { min: number; max: number } | null;
};

export const VEHICLE_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'lowest_km', label: 'Lowest mileage' },
  { value: 'battery_high', label: 'Battery capacity' },
  { value: 'range_high', label: 'Range' },
  { value: 'fast_deliver', label: 'Fastest delivery' },
  { value: 'featured', label: 'Featured' },
];

/** Merge URL filter state; resets page unless `page` is in the patch. */
export function applyVehiclesSearchPatch(
  base: VehiclesSearchParams,
  patch: Partial<VehiclesSearchParams>,
): VehiclesSearchParams {
  const next = { ...base, ...patch };
  if (!('page' in patch)) next.page = 1;
  if ('subcategories' in patch || 'subcategory' in patch) {
    if (patch.subcategories === undefined && patch.subcategory === undefined) {
      delete next.subcategory;
      delete next.subcategories;
    } else if (next.subcategories?.length === 1) {
      next.subcategory = next.subcategories[0];
      delete next.subcategories;
    } else if (next.subcategories && next.subcategories.length > 1) {
      delete next.subcategory;
    }
  }
  if ('brand' in patch && patch.brand !== base.brand) {
    delete next.model;
  }
  if ('category' in patch && patch.category !== base.category) {
    delete next.subcategory;
    delete next.subcategories;
  }
  return next;
}

export function parseVehiclesSearchParams(
  raw: Record<string, string | string[] | undefined>,
): VehiclesSearchParams {
  const pick = (key: string) => {
    const v = raw[key];
    if (v == null) return undefined;
    return Array.isArray(v) ? v[0] : v;
  };

  const subcategoriesRaw = pick('subcategories') ?? pick('subcategory');
  const subcategories = subcategoriesRaw
    ? subcategoriesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const num = (key: string) => {
    const v = pick(key);
    if (v == null || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  return {
    stock: pick('stock'),
    category: pick('category'),
    subcategory:
      subcategories?.length === 1 ? subcategories[0] : pick('subcategory'),
    subcategories:
      subcategories && subcategories.length > 1 ? subcategories : undefined,
    useCase: pick('useCase'),
    q: pick('q'),
    page: Math.max(1, num('page') ?? 1),
    sort: pick('sort'),
    brand: pick('brand'),
    model: pick('model'),
    condition: pick('condition'),
    drivetrain: pick('drivetrain'),
    color: pick('color'),
    city: pick('city'),
    country: pick('country'),
    batteryCapacityKwh: num('batteryCapacityKwh'),
    yearMin: num('yearMin'),
    yearMax: num('yearMax'),
    mileageMin: num('mileageMin'),
    mileageMax: num('mileageMax'),
    priceMin: num('priceMin'),
    priceMax: num('priceMax'),
  };
}

export function vehiclesBodyTypeOptions(categories: Category[]) {
  return categories
    .filter((c) => VEHICLE_CATEGORY_TYPES.includes(c.type))
    .flatMap((c) =>
      (c.subcategories ?? [])
        .filter((s) => s.isActive)
        .map((s) => ({
          slug: s.slug,
          label: s.name,
          categorySlug: c.slug,
        })),
    );
}

export function formatConditionLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatDrivetrainFilterLabel(value: string): string {
  const map: Record<string, string> = {
    FWD: 'FWD',
    RWD: 'RWD',
    AWD: 'AWD',
    FOUR_WD: '4WD',
  };
  return map[value] ?? value.replace(/_/g, ' ');
}
