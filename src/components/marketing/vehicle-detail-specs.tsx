import type {
  VehicleSpecGroup,
  VehicleSpecRow,
} from '@/lib/marketing/listing-detail';

type VehicleDetailSpecsProps = {
  groups: VehicleSpecGroup[];
};

function SpecGrid({ rows }: { rows: VehicleSpecRow[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <dt className="text-xs font-medium text-[#356769]">{row.label}</dt>
          <dd className="mt-0.5 text-sm text-[#151515]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function VehicleDetailSpecs({ groups }: VehicleDetailSpecsProps) {
  const rows = groups.flatMap((group) => group.rows);
  if (rows.length === 0) return null;

  const title = groups.length === 1 ? groups[0].title : 'Additional details';

  return (
    <div className="rounded-2xl border border-[#E9E9E9] p-8">
      <h2 className="mb-4 text-lg font-semibold text-[#151515]">{title}</h2>
      <SpecGrid rows={rows} />
    </div>
  );
}
