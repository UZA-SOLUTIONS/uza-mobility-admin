'use client';

import { usePermissions } from '@/hooks/permissions';
import { Skeleton } from '@/components/ui/skeleton';

type AdminPageGateProps = {
  superAdmin: React.ReactNode;
  default: React.ReactNode;
};

export function AdminPageGate({
  superAdmin,
  default: fallback,
}: AdminPageGateProps) {
  const { isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return isSuperAdmin ? superAdmin : fallback;
}
