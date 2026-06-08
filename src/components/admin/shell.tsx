'use client';

import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { adminRoutes } from '@/config/routes';
import { useAdminNav } from '@/hooks/admin-nav';
import { usePermissions } from '@/hooks/permissions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

type AdminShellProps = {
  children: React.ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const { groups, isLoading: navLoading } = useAdminNav();
  const { user } = usePermissions();

  const sidebarFooter = user ? (
    <>
      <Avatar size="default">
        {user.profilePhoto ? (
          <AvatarImage src={user.profilePhoto} alt={user.email} />
        ) : (
          <AvatarFallback>
            {user.firstName?.charAt(0) ?? '?'}
            {user.lastName?.charAt(0) ?? ''}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {user.firstName || user.lastName
            ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
            : user.email}
        </p>
        <p className="truncate text-xs text-primary/70">{user.email}</p>
      </div>
    </>
  ) : null;

  return (
    <WorkspaceShell
      navGroups={groups}
      rootHref={adminRoutes.root}
      navLoading={navLoading}
      sidebarFooter={sidebarFooter}
    >
      {children}
    </WorkspaceShell>
  );
}
