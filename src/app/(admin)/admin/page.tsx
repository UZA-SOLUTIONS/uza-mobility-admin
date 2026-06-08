import { AdminDashboard } from '@/components/admin/dashboard';
import { AdminHome } from '@/components/admin/home';
import { AdminPageGate } from '@/components/admin/page-gate';

export default function AdminPage() {
  return (
    <AdminPageGate superAdmin={<AdminDashboard />} default={<AdminHome />} />
  );
}
