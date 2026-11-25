'use client';

import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { adminRoutes } from '@/config/routes';
import { useAdminNav } from '@/hooks/admin-nav';
import { usePermissions } from '@/hooks/permissions';

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { groups, isLoading: navLoading } = useAdminNav();
  const { user } = usePermissions();

  return (
    <WorkspaceShell
      navGroups={groups}
      rootHref={adminRoutes.root}
      navLoading={navLoading}
      accountUser={user}
    >
      {children}
    </WorkspaceShell>
  );
}
