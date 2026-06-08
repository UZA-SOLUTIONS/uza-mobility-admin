'use client';

import { format, parseISO, startOfDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DatePickerFieldProps = {
  label: string;
  /** ISO date string `yyyy-MM-dd` */
  value: string;
  onChange: (value: string) => void;
  id?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Cannot select after this date (defaults to today when `disableFuture` is true). */
  maxDate?: Date;
  /** Cannot select before this date (defaults to today when `disablePast` is true). */
  minDate?: Date;
  disableFuture?: boolean;
  disablePast?: boolean;
};

function parseDateValue(value: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function toIsoDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function DatePickerField({
  label,
  value,
  onChange,
  id,
  error,
  disabled = false,
  placeholder = 'Pick a date',
  maxDate,
  minDate,
  disableFuture = false,
  disablePast = false,
}: DatePickerFieldProps) {
  const today = startOfDay(new Date());
  const effectiveMax = disableFuture ? (maxDate ?? today) : maxDate;
  const effectiveMin = disablePast ? (minDate ?? today) : minDate;
  const selected = parseDateValue(value);

  const isDisabledDay = (date: Date) => {
    const day = startOfDay(date);
    if (effectiveMax && day > startOfDay(effectiveMax)) return true;
    if (effectiveMin && day < startOfDay(effectiveMin)) return true;
    return false;
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start gap-2 font-normal',
              !selected && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="size-4 shrink-0 opacity-60" />
            {selected ? format(selected, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? effectiveMax ?? effectiveMin ?? today}
            onSelect={(date) => onChange(date ? toIsoDateString(date) : '')}
            disabled={isDisabledDay}
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
