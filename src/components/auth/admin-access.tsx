'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authRoutes } from '@/config/routes';
import { signOutClient } from '@/lib/auth/sign-out-client';
import { useAppRouter } from '@/lib/navigation/use-app-router';
import { usePermissions } from '@/hooks/permissions';

type AdminAccessProps = {
  children: React.ReactNode;
};

export function AdminAccess({ children }: AdminAccessProps) {
  const { hasAdminAccess, isLoading, user } = usePermissions();
  const queryClient = useQueryClient();
  const router = useAppRouter();

  useEffect(() => {
    if (isLoading || hasAdminAccess || !user) {
      return;
    }

    void (async () => {
      await signOutClient({ queryClient, redirect: false });
      router.replace(authRoutes.login);
      router.refresh();
    })();
  }, [hasAdminAccess, isLoading, queryClient, router, user]);

  if (isLoading && !user) {
    return null;
  }

  if (!hasAdminAccess) {
    return null;
  }

  return children;
}
