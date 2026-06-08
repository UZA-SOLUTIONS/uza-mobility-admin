import { authRoutes, workspaceRoutes } from '@/config/routes';
import { hasAdminAccess } from '@/lib/permissions';
import type { MeUser } from '@/types/auth/me-user';

function pathStartsWith(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Whether this signed-in user may open a protected workspace path. */
export function canAccessWorkspacePath(me: MeUser, path: string): boolean {
  if (pathStartsWith(path, workspaceRoutes.admin)) {
    return hasAdminAccess(me.permissions, me.roles);
  }
  return true;
}

/**
 * After login, honor callbackUrl only when the user is allowed on that workspace.
 * Prevents admins being sent to /account via a stale callbackUrl query param.
 */
export function resolvePostLoginRedirect(
  me: MeUser,
  callbackUrl?: string | null,
): string {
  const fallback = authRedirect(me);
  if (!callbackUrl?.startsWith('/')) {
    return fallback;
  }
  if (canAccessWorkspacePath(me, callbackUrl)) {
    return callbackUrl;
  }
  return fallback;
}

export function authRedirect(me: MeUser): string {
  if (hasAdminAccess(me.permissions, me.roles)) {
    return workspaceRoutes.admin;
  }

  return authRoutes.login;
}
