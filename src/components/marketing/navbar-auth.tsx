'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { authRoutes } from '@/config/routes';
import { authRedirect } from '@/lib/auth/redirect';
import { notificationsHrefForWorkspaceRoot } from '@/lib/notifications/paths';
import { brand } from '@/lib/marketing/colors';
import { isMeUser } from '@/types/auth/me-user';

type NavbarAuthProps = {
  overlay?: boolean;
};

export function NavbarAuth({ overlay = false }: NavbarAuthProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="mx-5 h-4 w-28" />;
  }

  if (isMeUser(session?.user)) {
    const workspaceHref = authRedirect(session.user);
    const notificationsHref = notificationsHrefForWorkspaceRoot(workspaceHref);
    return (
      <div className="flex items-center gap-2 px-3">
        <NotificationBell
          viewAllHref={notificationsHref}
          triggerClassName={
            overlay
              ? 'text-white hover:text-white hover:bg-white/10'
              : 'text-primary hover:text-primary'
          }
          badgeClassName="bg-[#AAFF47] text-[#174438]"
        />
        <Button
          size="sm"
          asChild
          className="border-0 hover:opacity-90"
          style={{ backgroundColor: brand.lime, color: brand.forest }}
        >
          <Link href={workspaceHref}>Workspace</Link>
        </Button>
      </div>
    );
  }

  return (
    <Link
      href={authRoutes.login}
      className="px-5 py-3 text-sm font-medium"
      style={{ color: overlay ? brand.lime : brand.forest }}
    >
      Sign in / Register
    </Link>
  );
}
