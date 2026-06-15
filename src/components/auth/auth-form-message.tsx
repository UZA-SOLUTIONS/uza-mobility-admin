import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthFormMessageProps = {
  variant: 'error' | 'success';
  message: string;
  children?: ReactNode;
  className?: string;
};

export function AuthFormMessage({
  variant,
  message,
  children,
  className,
}: AuthFormMessageProps) {
  const Icon = variant === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex gap-2.5 rounded-lg border px-3 py-2.5 text-sm',
        variant === 'error'
          ? 'border-red-200 bg-red-50 text-red-900'
          : 'border-emerald-200 bg-emerald-50 text-emerald-900',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <p className="leading-snug font-medium">{message}</p>
        {children}
      </div>
    </div>
  );
}
