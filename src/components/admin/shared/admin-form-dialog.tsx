'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const sizeClass = {
  sm: 'sm:max-w-lg',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
  xl: 'sm:max-w-5xl',
} as const;

type AdminFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: keyof typeof sizeClass;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

export function AdminFormDialog({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
  className,
}: AdminFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0',
          sizeClass[size],
          className,
        )}
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
