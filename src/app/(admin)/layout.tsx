import { AdminAccess } from '@/components/auth/admin-access';
import { AdminShell } from '@/components/admin/shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAccess>
      <AdminShell>{children}</AdminShell>
    </AdminAccess>
  );
}
