import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import type { AdminInquiry, InquiryStatus } from '@/types/admin/inquiries';

export function getAdminInquiries(params?: {
  limit?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  return authenticatedPaginatedFetch<AdminInquiry>('/admin/inquiries', {
    searchParams,
  });
}

export function updateAdminInquiryStatus(
  id: string,
  payload: { status: InquiryStatus; internalNotes?: string },
) {
  return authenticatedFetch<AdminInquiry>(`/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
