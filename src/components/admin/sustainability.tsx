'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useSustainabilityByBuyerType,
  useSustainabilityByCountry,
  useSustainabilityByVehicleType,
  useSustainabilityFleetReport,
  useSustainabilityOverview,
} from '@/queries/operations';
import {
  EMISSIONS_FACTORS_REFERENCE,
  type SustainabilityBreakdownRow,
  type SustainabilityFilters,
} from '@/types/admin/operations';

function formatKg(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    value,
  );
}

function formatLitres(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    value,
  );
}

function SummaryCards({
  summary,
}: {
  summary: {
    records: number;
    co2AvoidedKg: number;
    fuelSavedLitres: number;
    greenKmEnabled: number;
    treesEquivalent: number;
  };
}) {
  const items = [
    { label: 'EV deliveries tracked', value: summary.records },
    { label: 'CO₂ avoided (kg)', value: formatKg(summary.co2AvoidedKg) },
    { label: 'Fuel saved (L)', value: formatLitres(summary.fuelSavedLitres) },
    { label: 'Green km enabled', value: formatKg(summary.greenKmEnabled) },
    { label: 'Trees equivalent', value: summary.treesEquivalent },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function BreakdownTable({
  rows,
  dimensionLabel,
  getKey,
}: {
  rows: SustainabilityBreakdownRow[] | undefined;
  dimensionLabel: string;
  getKey: (row: SustainabilityBreakdownRow) => string;
}) {
  if (!rows?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No data for this breakdown.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{dimensionLabel}</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>CO₂ (kg)</TableHead>
          <TableHead>Fuel (L)</TableHead>
          <TableHead>Green km</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {getKey(row).replaceAll('_', ' ') || 'Unknown'}
            </TableCell>
            <TableCell>{row.records}</TableCell>
            <TableCell>{formatKg(row.co2AvoidedKg)}</TableCell>
            <TableCell>{formatLitres(row.fuelSavedLitres)}</TableCell>
            <TableCell>{formatKg(row.greenKmEnabled)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function AdminSustainabilityPanel() {
  const [filters, setFilters] = useState<SustainabilityFilters>({});
  const [fleetClient, setFleetClient] = useState('');
  const [fleetQuery, setFleetQuery] = useState('');

  const overview = useSustainabilityOverview(filters);
  const byBuyer = useSustainabilityByBuyerType(filters);
  const byCountry = useSustainabilityByCountry(filters);
  const byVehicle = useSustainabilityByVehicleType(filters);
  const fleetReport = useSustainabilityFleetReport(fleetQuery, filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sustainability"
        description="Impact metrics from delivered EV orders. Emission factors are configured in the backend and shown for reference."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <DatePickerField
          id="sus-from"
          label="From"
          value={filters.from?.slice(0, 10) ?? ''}
          disableFuture
          maxDate={filters.to ? new Date(filters.to.slice(0, 10)) : undefined}
          onChange={(from) =>
            setFilters((current) => ({
              ...current,
              from: from || undefined,
              to:
                current.to && from && current.to < from
                  ? undefined
                  : current.to,
            }))
          }
        />
        <DatePickerField
          id="sus-to"
          label="To"
          value={filters.to?.slice(0, 10) ?? ''}
          disableFuture
          minDate={
            filters.from ? new Date(filters.from.slice(0, 10)) : undefined
          }
          onChange={(to) =>
            setFilters((current) => ({
              ...current,
              to: to || undefined,
            }))
          }
        />
        <div className="space-y-1.5">
          <Label htmlFor="sus-country">Country</Label>
          <Input
            id="sus-country"
            placeholder="RW"
            value={filters.country ?? ''}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                country: e.target.value.trim() || undefined,
              }))
            }
          />
        </div>
      </div>

      {overview.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : overview.data ? (
        <SummaryCards summary={overview.data.summary} />
      ) : null}

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="buyer">By buyer</TabsTrigger>
          <TabsTrigger value="country">By country</TabsTrigger>
          <TabsTrigger value="vehicle">By vehicle</TabsTrigger>
          <TabsTrigger value="fleet">Fleet client</TabsTrigger>
          <TabsTrigger value="factors">Emission factors</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>CO₂ (kg)</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.data?.recent.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No sustainability records yet.
                    </TableCell>
                  </TableRow>
                ) : null}
                {overview.data?.recent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.listing?.listingTitle ?? '—'}</TableCell>
                    <TableCell>
                      {row.vehicleType.replaceAll('_', ' ')}
                    </TableCell>
                    <TableCell>{formatKg(row.estimatedCo2AvoidedKg)}</TableCell>
                    <TableCell>
                      {new Date(row.recordedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="buyer" className="mt-4 rounded-lg border p-4">
          <BreakdownTable
            rows={byBuyer.data}
            dimensionLabel="Buyer type"
            getKey={(row) => row.buyerType ?? 'Unknown'}
          />
        </TabsContent>

        <TabsContent value="country" className="mt-4 rounded-lg border p-4">
          <BreakdownTable
            rows={byCountry.data}
            dimensionLabel="Country"
            getKey={(row) => row.country ?? 'Unknown'}
          />
        </TabsContent>

        <TabsContent value="vehicle" className="mt-4 rounded-lg border p-4">
          <BreakdownTable
            rows={byVehicle.data}
            dimensionLabel="Vehicle type"
            getKey={(row) => row.vehicleType ?? 'Unknown'}
          />
        </TabsContent>

        <TabsContent value="fleet" className="mt-4 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="fleet-client">Fleet client name</Label>
              <Input
                id="fleet-client"
                placeholder="Organization name"
                value={fleetClient}
                onChange={(e) => setFleetClient(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={() => setFleetQuery(fleetClient.trim())}
            >
              Load report
            </Button>
          </div>
          {fleetQuery && fleetReport.data ? (
            <>
              <SummaryCards summary={fleetReport.data.summary} />
              <p className="text-sm text-muted-foreground">
                Report for &quot;{fleetQuery}&quot;
              </p>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="factors" className="mt-4">
          <p className="mb-4 text-sm text-muted-foreground">
            Reference factors used when recording delivery impact (read-only;
            change requires a backend deploy).
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>CO₂ / km (kg)</TableHead>
                  <TableHead>Fuel / km (L)</TableHead>
                  <TableHead>Annual km est.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EMISSIONS_FACTORS_REFERENCE.map((row) => (
                  <TableRow key={row.vehicleType}>
                    <TableCell>
                      {row.vehicleType.replaceAll('_', ' ')}
                    </TableCell>
                    <TableCell>{row.co2PerKmKg}</TableCell>
                    <TableCell>{row.fuelSavedPerKmL}</TableCell>
                    <TableCell>
                      {row.annualKmEstimate.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
