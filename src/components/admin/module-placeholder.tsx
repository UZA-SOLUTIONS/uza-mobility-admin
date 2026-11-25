import { PageHeader } from '@/components/shared/page-header';

type ModulePlaceholderProps = {
  title: string;
  description?: string;
};

export function ModulePlaceholder({
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <PageHeader
      title={title}
      description={description ?? 'This page is not available.'}
    />
  );
}
