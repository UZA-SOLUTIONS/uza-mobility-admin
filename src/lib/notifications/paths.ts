import { adminRoutes } from '@/config/routes';

/** Notifications page for the workspace implied by the current path. */
export function notificationsHrefFromPathname(pathname: string): string {
  if (pathname.startsWith(adminRoutes.root)) {
    return adminRoutes.notifications;
  }
  return adminRoutes.notifications;
}

/** Notifications page under a workspace root (e.g. `/admin` → `/admin/notifications`). */
export function notificationsHrefForWorkspaceRoot(workspaceRoot: string) {
  return `${workspaceRoot}/notifications`;
}
