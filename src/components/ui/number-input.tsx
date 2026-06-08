'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function parseNumberInput(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Safe numeric parsing for React Hook Form `register` (use instead of `valueAsNumber`). */
export type NumberRegisterOptions = {
  setValueAs: (value: unknown) => number | undefined;
};

/**
 * React Hook Form: prefer over `valueAsNumber: true`, which sets NaN on empty
 * input and can make the field feel frozen until reload.
 *
 * Returns only `setValueAs` so it stays assignable per field name; a full
 * `RegisterOptions` helper widens to all form paths and breaks strict typing.
 */
export function numberRegisterOptions(): NumberRegisterOptions {
  return { setValueAs: parseNumberInput };
}

const NumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<'input'>, 'type'>
>(({ className, ...props }, ref) => {
  return <Input ref={ref} type="number" className={cn(className)} {...props} />;
});
NumberInput.displayName = 'NumberInput';

export { NumberInput };
