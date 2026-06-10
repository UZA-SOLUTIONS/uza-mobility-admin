'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  getAdminInquiries,
  updateAdminInquiryStatus,
} from '@/lib/api/inquiries';
import type { InquiryStatus } from '@/types/admin/inquiries';

export const adminInquiryKeys = {
  all: ['admin-inquiries'] as const,
  list: (status?: string) =>
    [...adminInquiryKeys.all, 'list', status ?? 'all'] as const,
};

export function useAdminInquiries(status?: string) {
  return useQuery({
    queryKey: adminInquiryKeys.list(status),
    queryFn: () => getAdminInquiries({ limit: 50, status }),
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      internalNotes,
    }: {
      id: string;
      status: InquiryStatus;
      internalNotes?: string;
    }) => updateAdminInquiryStatus(id, { status, internalNotes }),
    onSuccess: () => {
      toast.success('Inquiry updated');
      void queryClient.invalidateQueries({ queryKey: adminInquiryKeys.all });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : 'Failed to update inquiry',
      );
    },
  });
}
