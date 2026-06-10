'use client';

import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminInquiries, useUpdateInquiryStatus } from '@/queries/inquiries';
import type { AdminInquiry, InquiryStatus } from '@/types/admin/inquiries';

const STATUS_OPTIONS: InquiryStatus[] = [
  'RECEIVED',
  'CONTACTED',
  'QUOTED',
  'CONVERTED',
  'CLOSED',
];

export function AdminInquiriesPanel() {
  const { data, isLoading, isError, error } = useAdminInquiries();
  const updateStatus = useUpdateInquiryStatus();

  const setStatus = (inquiry: AdminInquiry, status: InquiryStatus) => {
    updateStatus.mutate({ id: inquiry.id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle inquiries"
        description="Quote requests from the marketplace. Follow up and update status as you contact buyers."
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load inquiries.'}
        </p>
      ) : null}

      <div className="space-y-3">
        {data?.items.map((inquiry) => (
          <div
            key={inquiry.id}
            className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium">
                {inquiry.listing?.listingTitle ?? inquiry.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {inquiry.name} · {inquiry.email} · {inquiry.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                {inquiry.quoteNumber} · {inquiry.country} ·{' '}
                {inquiry.buyerType.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inquiry.status} />
              <Select
                value={inquiry.status}
                onValueChange={(value) =>
                  setStatus(inquiry, value as InquiryStatus)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" size="sm" variant="outline" asChild>
                <a href={`mailto:${inquiry.email}`}>Email buyer</a>
              </Button>
            </div>
          </div>
        ))}

        {!isLoading && (data?.items.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No inquiries yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
