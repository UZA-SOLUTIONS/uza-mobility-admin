import type { MarketingFooterColumn, NavItem } from '@/config/navigation';
import { vehiclesHref } from '@/lib/marketing/vehicles-url';
import type { Category, CategoryType } from '@/types/admin/marketplace';

const VEHICLE_CATEGORY_TYPES: CategoryType[] = [
  'PASSENGER_EV',
  'TWO_THREE_WHEEL',
  'COMMERCIAL_EV',
];

function categoryBrowseHref(category: Category): string {
  if (category.type === 'EV_PARTS_ACCESSORIES') {
    return `/spare-parts?category=${encodeURIComponent(category.slug)}`;
  }
  return vehiclesHref({ category: category.slug });
}

function categoryNavLinks(categories: Category[]): NavItem[] {
  return categories.map((category) => ({
    label: category.name,
    href: categoryBrowseHref(category),
  }));
}

/** Top nav from live category tree (`GET /categories`). */
export function buildMarketingNav(_categories: Category[]): NavItem[] {
  return [
    { label: 'Vehicles', href: vehiclesHref() },
    { label: 'Spare Parts', href: '/spare-parts' },
    { label: 'For Business', href: '/for-business' },
    { label: 'About', href: '/about' },
  ];
}

/** Footer columns: top-level categories only (no subcategory lists). */
export function buildMarketingFooterColumns(
  categories: Category[],
): MarketingFooterColumn[] {
  const active = sortPublicCategories(categories);

  const vehicleCategories = active.filter((c) =>
    VEHICLE_CATEGORY_TYPES.includes(c.type),
  );
  const partsCategories = active.filter(
    (c) => c.type === 'EV_PARTS_ACCESSORIES',
  );

  const vehicleLinks: NavItem[] = [
    { label: 'All vehicles', href: vehiclesHref() },
    ...categoryNavLinks(vehicleCategories),
  ];

  const partsLinks: NavItem[] = [
    { label: 'All spare parts', href: '/spare-parts' },
    ...categoryNavLinks(partsCategories),
  ];

  return [
    { title: 'Vehicles', links: vehicleLinks },
    { title: 'Spare parts', links: partsLinks },
    {
      title: 'Company',
      links: [
        { label: 'For Business', href: '/for-business' },
        { label: 'About UZA Mobility', href: '/about' },
        { label: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/about' },
        { label: 'User Manuals', href: '/blog' },
        { label: 'Privacy & Policy', href: '/about' },
      ],
    },
  ];
}

/** Homepage “Find Your Perfect Fit” tabs — vehicle categories from the API. */
export type PerfectFitTab = {
  id: string;
  label: string;
  categorySlug: string;
};

/**
 * `GET /categories` already returns only active categories (and active subcategories).
 * Use the list as-is, ordered for display.
 */
export function sortPublicCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function buildPerfectFitTabs(categories: Category[]): PerfectFitTab[] {
  return sortPublicCategories(categories).map((category) => ({
    id: category.slug,
    label: category.name,
    categorySlug: category.slug,
  }));
}
