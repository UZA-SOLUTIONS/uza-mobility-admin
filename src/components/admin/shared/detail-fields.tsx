import type { ReactNode } from 'react';

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">{children}</dl>
    </div>
  );
}

export function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex justify-between gap-4 sm:flex-col sm:gap-1 ${className ?? ''}`}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{value ?? '—'}</dd>
    </div>
  );
}

export function formatEnumLabel(value: string | null | undefined) {
  if (!value) return '—';
  return value.replaceAll('_', ' ');
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export { formatUsd } from '@/lib/admin/format';

const registrationStatusLabels: Record<string, string> = {
  REGISTERED: 'Registered',
  READY_FOR_REGISTRATION: 'Ready for registration',
  IMPORT_PENDING: 'Import pending',
  NOT_APPLICABLE: 'Not applicable',
};

export function formatRegistrationStatus(
  value: string | null | undefined,
): string {
  if (!value) return '—';
  return registrationStatusLabels[value] ?? formatEnumLabel(value);
}
