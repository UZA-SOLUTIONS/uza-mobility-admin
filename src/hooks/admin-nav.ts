'use client';

import {
  adminNavGroups,
  type NavGroup,
  type NavItem,
} from '@/config/navigation';
import { usePermissions } from '@/hooks/permissions';

function isNavItemVisible(
  item: NavItem,
  can: (action: string) => boolean,
  canAny: (actions: string[]) => boolean,
  isSuperAdmin: boolean,
): boolean {
  if (item.superAdminOnly && !isSuperAdmin) {
    return false;
  }

  if (item.permission && !can(item.permission)) {
    return false;
  }

  if (item.permissions?.length && !canAny(item.permissions)) {
    return false;
  }

  return true;
}

export function useAdminNav() {
  const { can, canAny, isSuperAdmin, isLoading } = usePermissions();

  const groups: NavGroup[] = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        isNavItemVisible(item, can, canAny, isSuperAdmin),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const flatItems = groups.flatMap((group) => group.items);

  return {
    groups,
    flatItems,
    isLoading,
    hasOverview: isSuperAdmin,
  };
}
