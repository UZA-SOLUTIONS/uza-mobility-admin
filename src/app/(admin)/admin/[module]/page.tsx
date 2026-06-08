import { notFound } from 'next/navigation';
import { ModulePlaceholder } from '@/components/admin/module-placeholder';
import { adminModulePages } from '@/config/admin-modules';

type AdminModulePageProps = {
  params: Promise<{ module: string }>;
};

export default async function AdminModulePage({
  params,
}: AdminModulePageProps) {
  const { module } = await params;
  const config = adminModulePages[module];

  if (!config) {
    notFound();
  }

  return (
    <ModulePlaceholder title={config.title} description={config.description} />
  );
}
