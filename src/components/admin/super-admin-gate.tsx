'use client';

import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/permissions';

type SuperAdminGateProps = {
  children: ReactNode;
};

export function SuperAdminGate({ children }: SuperAdminGateProps) {
  const { isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <p className="text-sm text-muted-foreground">
        This section is restricted to administrators.
      </p>
    );
  }

  return children;
}
