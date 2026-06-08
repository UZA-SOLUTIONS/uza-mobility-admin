'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const VEHICLES_FILTER_ALL = '__all__';

type VehiclesFilterSelectProps = {
  label: string;
  placeholder: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
};

export function VehiclesFilterSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: VehiclesFilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[#151515]">{label}</Label>
      <Select
        value={value ?? VEHICLES_FILTER_ALL}
        onValueChange={(next) =>
          onChange(next === VEHICLES_FILTER_ALL ? undefined : next)
        }
        disabled={disabled}
      >
        <SelectTrigger className="h-11 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={VEHICLES_FILTER_ALL}>{placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
