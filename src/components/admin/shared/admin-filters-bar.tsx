import { cn } from '@/lib/utils';

type AdminFiltersBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminFiltersBar({ children, className }: AdminFiltersBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border bg-muted/30 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-end',
        className,
      )}
    >
      {children}
    </div>
  );
}
