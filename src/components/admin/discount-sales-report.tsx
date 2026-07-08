'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/shared/page-header';
import { PaginationBar } from '@/components/admin/shared/pagination-bar';
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
import { formatDate, formatUsd } from '@/lib/admin/format';
import { downloadDiscountSalesPdf } from '@/lib/api/platform';
import { useDiscountSalesReport } from '@/queries/platform';
import type {
  DiscountSalesFilters,
  DiscountSalesSummary,
} from '@/types/admin/discount-sales';

function SummaryCards({ summary }: { summary: DiscountSalesSummary | null }) {
  if (!summary) return null;

  const cards = [
    { label: 'Discounted sales', value: String(summary.saleCount) },
    {
      label: 'Discount from pricing rules',
      value: formatUsd(summary.totalRuleDiscountUsd),
    },
    {
      label: 'Total discount given',
      value: formatUsd(summary.totalDiscountUsd),
    },
    {
      label: 'Revenue after discount',
      value: formatUsd(summary.totalRevenueUsd),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDiscountSalesPanel() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<DiscountSalesFilters>({
    page: 1,
    limit: 25,
  });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, error } = useDiscountSalesReport(filters);
  const summary = data?.meta.summary ?? null;

  const applyFilters = () => {
    setFilters((current) => ({
      ...current,
      page: 1,
      from: from || undefined,
      to: to || undefined,
    }));
  };

  const exportPdf = async () => {
    const token = session?.accessToken;
    if (!token) return;
    setExporting(true);
    try {
      const blob = await downloadDiscountSalesPdf(token, {
        from: filters.from,
        to: filters.to,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `uza-discount-sales-${new Date().toISOString().slice(0, 10)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount sales"
        description="Confirmed vehicle sales (payment verified) where a pricing-rule discount was applied."
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="discount-from">From</Label>
          <Input
            id="discount-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discount-to">To</Label>
          <Input
            id="discount-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
        <Button type="button" variant="outline" onClick={applyFilters}>
          Apply
        </Button>
        <Button
          type="button"
          disabled={exporting || !session?.accessToken}
          onClick={() => void exportPdf()}
        >
          {exporting ? 'Exporting…' : 'Export PDF'}
        </Button>
      </div>

      <SummaryCards summary={summary} />

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : 'Failed to load discount sales.'}
        </p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead className="text-right">List price</TableHead>
              <TableHead className="text-right">Discount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {!isLoading && data?.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No discounted sales found for this period.
                </TableCell>
              </TableRow>
            ) : null}
            {data?.items.map((row) => (
              <TableRow key={row.invoiceId}>
                <TableCell className="font-medium">
                  {row.invoiceNumber}
                </TableCell>
                <TableCell>{formatDate(row.soldAt)}</TableCell>
                <TableCell>
                  {[row.vehicleBrand, row.vehicleModel, row.vehicleYear]
                    .filter(Boolean)
                    .join(' ')}
                </TableCell>
                <TableCell>{row.buyerName}</TableCell>
                <TableCell className="text-right">
                  {formatUsd(row.listPriceUsd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatUsd(row.totalDiscountUsd)}
                </TableCell>
                <TableCell className="text-right">
                  {formatUsd(row.amountPaidUsd)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data?.meta ? (
        <PaginationBar
          meta={data.meta}
          onPageChange={(page) =>
            setFilters((current) => ({ ...current, page }))
          }
        />
      ) : null}
    </div>
  );
}
