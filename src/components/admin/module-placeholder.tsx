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
      description={
        description ??
        'This module will be implemented in the next phase. Use the sidebar to navigate.'
      }
    />
  );
}
