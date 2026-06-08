import { Battery, Car, Gauge, Settings2 } from 'lucide-react';
import type { VehicleSpecRow } from '@/lib/marketing/listing-detail';

const SPEC_ICONS: Record<string, typeof Car> = {
  Body: Car,
  Mileage: Gauge,
  Battery: Battery,
  Year: Settings2,
  Transmission: Settings2,
  Charging: Battery,
  'Drive type': Car,
  Condition: Car,
  Seats: Car,
  Color: Car,
};

type VehicleDetailSidebarSpecsProps = {
  rows: VehicleSpecRow[];
};

export function VehicleDetailSidebarSpecs({
  rows,
}: VehicleDetailSidebarSpecsProps) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#E9E9E9] p-8">
      <ul className="divide-y divide-[#E9E9E9]">
        {rows.map((row) => {
          const Icon = SPEC_ICONS[row.label] ?? Car;
          return (
            <li key={row.label} className="grid grid-cols-2 gap-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-[#151515]">
                <Icon className="size-[18px] shrink-0" />
                {row.label}
              </span>
              <span className="text-[#151515]">{row.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
