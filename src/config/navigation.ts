import { adminRoutes } from '@/config/routes';
import type { ElementType } from 'react';
import {
  Home,
  List,
  Store,
  Tag,
  Wrench,
  ShoppingCart,
  CreditCard,
  FileText,
  DollarSign,
  Truck,
  Zap,
  MapPin,
  Megaphone,
  Leaf,
  Shield,
  Activity,
  Calculator,
  BadgePercent,
  Settings,
  Car,
  MessageCircle,
  LayoutGrid,
  Wallet,
  Building2,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  /** User must have this permission. */
  permission?: string;
  /** User must have at least one of these permissions. */
  permissions?: string[];
  /** Only visible to super admin (`*` permission). */
  superAdminOnly?: boolean;
  /** Optional icon component to display in sidebars. */
  icon?: ElementType;
};

export type NavGroup = {
  label?: string;
  /** Group header icon (collapsible sections). */
  icon?: ElementType;
  /**
   * When false, items render as top-level links (not collapsible).
   * Defaults to true when `label` is set.
   */
  collapsible?: boolean;
  items: NavItem[];
};

/** Full admin sidebar; filter with `useAdminNav()`. Profile/Notifications live in the header menu. */
export const adminNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    icon: Home,
    collapsible: false,
    items: [
      {
        label: 'Overview',
        href: adminRoutes.root,
        icon: Home,
        superAdminOnly: true,
      },
    ],
  },
  {
    label: 'Marketplace',
    icon: LayoutGrid,
    items: [
      {
        label: 'Listings',
        href: adminRoutes.listings,
        icon: List,
        permissions: [
          'listings:approve',
          'listings:reject',
          'listings:delete',
          'listings:create',
          'listings:feature',
        ],
      },
      {
        label: 'Sellers',
        href: adminRoutes.sellers,
        icon: Store,
        permissions: ['sellers:verify', 'sellers:suspend'],
      },
      {
        label: 'Categories',
        href: adminRoutes.categories,
        icon: Tag,
        permissions: ['listings:approve', 'listings:create', 'parts:manage'],
      },
      {
        label: 'Parts',
        href: adminRoutes.parts,
        icon: Wrench,
        permissions: ['parts:manage'],
      },
    ],
  },
  {
    label: 'Sales',
    icon: ShoppingCart,
    items: [
      {
        label: 'Orders',
        href: adminRoutes.orders,
        icon: ShoppingCart,
        permissions: ['orders:read', 'orders:update-status'],
      },
      {
        label: 'Payments',
        href: adminRoutes.payments,
        icon: CreditCard,
        permissions: ['payments:verify', 'payments:reject', 'payments:refund'],
      },
      {
        label: 'Bookings',
        href: adminRoutes.bookings,
        icon: Car,
        permissions: ['bookings:manage', 'bookings:verify', 'bookings:reject'],
      },
      {
        label: 'Inquiries',
        href: adminRoutes.inquiries,
        icon: MessageCircle,
        permissions: ['inquiries:read-all', 'inquiries:update-status'],
      },
    ],
  },
  {
    label: 'Billing',
    icon: Wallet,
    items: [
      {
        label: 'Invoices',
        href: adminRoutes.invoices,
        icon: FileText,
        permissions: ['invoices:read', 'invoices:send', 'invoices:cancel'],
      },
      {
        label: 'Discount sales',
        href: adminRoutes.discountSales,
        icon: BadgePercent,
        permissions: ['invoices:read'],
      },
      {
        label: 'Financing',
        href: adminRoutes.financing,
        icon: DollarSign,
        permissions: ['financing:read', 'financing:send-to-bank'],
      },
    ],
  },
  {
    label: 'Operations',
    icon: Truck,
    items: [
      {
        label: 'Fleet',
        href: adminRoutes.fleet,
        icon: Truck,
        permissions: ['fleet:read', 'fleet:update-status'],
      },
      {
        label: 'Energy',
        href: adminRoutes.energy,
        icon: Zap,
        permissions: ['parts:manage', 'fleet:read', 'fleet:update-status'],
      },
      {
        label: 'Stations',
        href: adminRoutes.stations,
        icon: MapPin,
        permissions: [
          'stations:read-all',
          'stations:approve',
          'stations:reject',
          'stations:suspend',
        ],
      },
      {
        label: 'Promotions',
        href: adminRoutes.promotions,
        icon: Megaphone,
        permissions: ['promotions:create', 'promotions:manage'],
      },
      {
        label: 'Sustainability',
        href: adminRoutes.sustainability,
        icon: Leaf,
        permissions: ['sustainability:read', 'sustainability:manage'],
      },
    ],
  },
  {
    label: 'Administration',
    icon: Building2,
    items: [
      {
        label: 'Users',
        href: adminRoutes.users,
        icon: Shield,
        superAdminOnly: true,
      },
      {
        label: 'Activity logs',
        href: adminRoutes.activityLogs,
        icon: Activity,
        superAdminOnly: true,
      },
      {
        label: 'Pricing rules',
        href: adminRoutes.pricingRules,
        icon: Calculator,
        superAdminOnly: true,
      },
      {
        label: 'Platform settings',
        href: adminRoutes.platformSettings,
        icon: Settings,
        permissions: ['platform-settings:manage'],
      },
    ],
  },
];
