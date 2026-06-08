'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import {
  advanceOrder,
  assignFinancingBank,
  cancelInvoice,
  cancelOrder,
  confirmPayment,
  createBank,
  createFleetInvoice,
  getAdminBuyers,
  getAdminBanks,
  getAdminFinancing,
  getAdminFinancingRequest,
  getAdminInvoice,
  getAdminInvoices,
  getAdminOrder,
  getAdminOrders,
  getAdminPayments,
  markPartialPayment,
  recordFinancingOutcome,
  rejectPayment,
} from '@/lib/api/commerce';
import type { AdminListing } from '@/types/admin/marketplace';
import type {
  AdminBuyer,
  AdminBuyersFilters,
  AdminFinancingFilters,
  AdminInvoicesFilters,
  AdminOrdersFilters,
  AdminPaymentsFilters,
} from '@/types/admin/commerce';
import type {
  AdvanceOrderInput,
  AssignBankInput,
  CreateBankInput,
  CreateFleetInvoiceInput,
  FinancingOutcomeInput,
  PartialPaymentInput,
  RejectPaymentInput,
} from '@/schemas/commerce';

export const commerceKeys = {
  all: ['commerce'] as const,
  payments: (filters: AdminPaymentsFilters) =>
    [...commerceKeys.all, 'payments', filters] as const,
  invoices: (filters: AdminInvoicesFilters) =>
    [...commerceKeys.all, 'invoices', filters] as const,
  invoice: (id: string) => [...commerceKeys.all, 'invoice', id] as const,
  orders: (filters: AdminOrdersFilters) =>
    [...commerceKeys.all, 'orders', filters] as const,
  order: (id: string) => [...commerceKeys.all, 'order', id] as const,
  financing: (filters: AdminFinancingFilters) =>
    [...commerceKeys.all, 'financing', filters] as const,
  financingRequest: (id: string) =>
    [...commerceKeys.all, 'financing-request', id] as const,
  banks: () => [...commerceKeys.all, 'banks'] as const,
  buyers: (filters: AdminBuyersFilters) =>
    [...commerceKeys.all, 'buyers', filters] as const,
};

function mutationError(error: unknown) {
  return error instanceof ApiClientError
    ? error.message
    : 'Something went wrong. Please try again.';
}

export function useAdminPayments(
  filters: AdminPaymentsFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: commerceKeys.payments(filters),
    queryFn: () => getAdminPayments(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPayment,
    onSuccess: () => {
      toast.success('Payment confirmed');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRejectPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: RejectPaymentInput }) =>
      rejectPayment(id, body),
    onSuccess: () => {
      toast.success('Payment rejected');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useMarkPartialPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PartialPaymentInput }) =>
      markPartialPayment(id, body),
    onSuccess: () => {
      toast.success('Invoice marked as partially paid');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminInvoices(
  filters: AdminInvoicesFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: commerceKeys.invoices(filters),
    queryFn: () => getAdminInvoices(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAdminInvoice(id: string | null) {
  return useQuery({
    queryKey: commerceKeys.invoice(id ?? ''),
    queryFn: () => getAdminInvoice(id!),
    enabled: Boolean(id),
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelInvoice,
    onSuccess: () => {
      toast.success('Invoice cancelled');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminBuyers(
  filters: AdminBuyersFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: commerceKeys.buyers(filters),
    queryFn: () => getAdminBuyers(filters),
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateFleetInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      buyer,
      body,
      listing,
    }: {
      buyer: AdminBuyer;
      body: CreateFleetInvoiceInput;
      listing?: AdminListing | null;
    }) => createFleetInvoice(buyer, body, listing),
    onSuccess: (invoice) => {
      toast.success(`Fleet invoice ${invoice.invoiceNumber} created`);
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminOrders(filters: AdminOrdersFilters, enabled = true) {
  return useQuery({
    queryKey: commerceKeys.orders(filters),
    queryFn: () => getAdminOrders(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAdminOrder(id: string | null) {
  return useQuery({
    queryKey: commerceKeys.order(id ?? ''),
    queryFn: () => getAdminOrder(id!),
    enabled: Boolean(id),
  });
}

export function useAdvanceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AdvanceOrderInput }) =>
      advanceOrder(id, body),
    onSuccess: () => {
      toast.success('Order advanced to next stage');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success('Order cancelled');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminFinancing(
  filters: AdminFinancingFilters,
  enabled = true,
) {
  return useQuery({
    queryKey: commerceKeys.financing(filters),
    queryFn: () => getAdminFinancing(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAdminFinancingRequest(id: string | null) {
  return useQuery({
    queryKey: commerceKeys.financingRequest(id ?? ''),
    queryFn: () => getAdminFinancingRequest(id!),
    enabled: Boolean(id),
  });
}

export function useAssignFinancingBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignBankInput }) =>
      assignFinancingBank(id, body),
    onSuccess: () => {
      toast.success('Request sent to bank');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useRecordFinancingOutcome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: FinancingOutcomeInput }) =>
      recordFinancingOutcome(id, body),
    onSuccess: () => {
      toast.success('Financing outcome recorded');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.all });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}

export function useAdminBanks(enabled = true) {
  return useQuery({
    queryKey: commerceKeys.banks(),
    queryFn: getAdminBanks,
    enabled,
    staleTime: 60_000,
  });
}

export function useCreateBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBank,
    onSuccess: () => {
      toast.success('Bank partner added');
      void queryClient.invalidateQueries({ queryKey: commerceKeys.banks() });
    },
    onError: (error) => toast.error(mutationError(error)),
  });
}
