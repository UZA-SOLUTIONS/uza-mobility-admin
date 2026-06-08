'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SearchablePickerOption = {
  value: string;
  label: string;
  hint?: string;
};

type SearchablePickerProps = {
  label: string;
  value: string;
  onValueChange: (value: string, option: SearchablePickerOption | null) => void;
  options: SearchablePickerOption[];
  /** Keeps the trigger label correct when the selection is not in the current result set. */
  selectedOption?: SearchablePickerOption | null;
  search: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  helperText?: string;
  error?: string;
  allowClear?: boolean;
};

export function SearchablePicker({
  label,
  value,
  onValueChange,
  options,
  selectedOption,
  search,
  onSearchChange,
  isLoading = false,
  placeholder = 'Select…',
  searchPlaceholder = 'Type to search…',
  emptyMessage = 'No matches. Try a different search.',
  helperText,
  error,
  allowClear = false,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);

  const display =
    selectedOption ?? options.find((option) => option.value === value) ?? null;

  const resultHint =
    search.trim().length > 0
      ? isLoading
        ? 'Searching…'
        : `${options.length} result${options.length === 1 ? '' : 's'} — pick one below`
      : options.length > 0
        ? `${options.length} available — type to narrow results`
        : 'Type to search';

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {isLoading && !open ? <Skeleton className="h-10 w-full" /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-10 w-full justify-between font-normal',
              !display && 'text-muted-foreground',
              isLoading && !open && 'hidden',
            )}
          >
            <span className="truncate">
              {display ? display.label : placeholder}
            </span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={onSearchChange}
            />
            <p className="border-b px-3 py-2 text-xs text-muted-foreground">
              {resultHint}
            </p>
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading…' : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {allowClear && value ? (
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange('', null);
                      onSearchChange('');
                      setOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground">
                      Clear selection
                    </span>
                  </CommandItem>
                ) : null}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value, option);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 size-4',
                        value === option.value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{option.label}</div>
                      {option.hint ? (
                        <div className="truncate text-xs text-muted-foreground">
                          {option.hint}
                        </div>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
