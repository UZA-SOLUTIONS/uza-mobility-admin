'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { adminDetailSheetClassName } from '@/lib/admin/detail-sheet';
import { cn } from '@/lib/utils';

type AdminDetailSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AdminDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: AdminDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          adminDetailSheetClassName,
          'gap-0 overflow-hidden p-0',
          className,
        )}
      >
        <SheetHeader className="shrink-0 space-y-1 border-b px-6 py-5 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t px-6 py-4">{footer}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
