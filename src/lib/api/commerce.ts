import { getSession } from 'next-auth/react';
import { siteConfig } from '@/config/site';
import {
  authenticatedFetch,
  authenticatedPaginatedFetch,
} from '@/lib/api/authenticated';
import {
  downloadInvoiceDocumentHtml,
  fetchAuthenticatedInvoiceDocument,
  invoiceDocumentFilename,
  openInvoiceDocumentInNewTab,
} from '@/lib/api/invoice-document';
import { toSearchParams } from '@/lib/api/query-params';
import type { AdminListing } from '@/types/admin/marketplace';
import type {
  AdminBuyer,
  AdminBuyersFilters,
  AdminFinancingFilters,
  AdminFinancingRequest,
  AdminInvoice,
  AdminInvoicesFilters,
  AdminOrder,
  AdminOrdersFilters,
  AdminPayment,
  AdminPaymentsFilters,
  Bank,
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

export function getAdminPayments(filters: AdminPaymentsFilters = {}) {
  return authenticatedPaginatedFetch<AdminPayment>('/admin/payments', {
    searchParams: toSearchParams(filters),
  });
}

export function confirmPayment(id: string) {
  return authenticatedFetch<AdminPayment>(`/admin/payments/${id}/confirm`, {
    method: 'PATCH',
  });
}

export function rejectPayment(id: string, body: RejectPaymentInput) {
  return authenticatedFetch<AdminPayment>(`/admin/payments/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function markPartialPayment(id: string, body: PartialPaymentInput = {}) {
  return authenticatedFetch<AdminPayment>(`/admin/payments/${id}/partial`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function getAdminInvoices(filters: AdminInvoicesFilters = {}) {
  return authenticatedPaginatedFetch<AdminInvoice>('/admin/invoices', {
    searchParams: toSearchParams(filters),
  });
}

export function getAdminInvoice(id: string) {
  return authenticatedFetch<AdminInvoice>(`/admin/invoices/${id}`);
}

async function fetchAdminInvoiceDocumentHtml(id: string) {
  const session = await getSession();
  const token = session?.accessToken;
  if (!token) {
    throw new Error('Not authenticated');
  }

  return fetchAuthenticatedInvoiceDocument(
    `${siteConfig.apiUrl}/admin/invoices/${id}/document`,
    token,
  );
}

export async function openAdminInvoiceDocument(id: string) {
  const html = await fetchAdminInvoiceDocumentHtml(id);
  openInvoiceDocumentInNewTab(html);
}

export async function downloadAdminInvoiceDocument(
  id: string,
  invoiceNumber: string,
) {
  const html = await fetchAdminInvoiceDocumentHtml(id);
  downloadInvoiceDocumentHtml(html, invoiceDocumentFilename(invoiceNumber));
}

export function cancelInvoice(id: string) {
  return authenticatedFetch<AdminInvoice>(`/admin/invoices/${id}/cancel`, {
    method: 'PATCH',
  });
}

export function getAdminBuyers(filters: AdminBuyersFilters = {}) {
  return authenticatedFetch<AdminBuyer[]>('/admin/buyers', {
    searchParams: toSearchParams(filters),
  });
}

export function buildFleetInvoicePayload(
  buyer: AdminBuyer,
  body: CreateFleetInvoiceInput,
  listing?: AdminListing | null,
) {
  const buyerName =
    buyer.buyerProfile?.organizationName?.trim() ||
    [buyer.firstName, buyer.lastName].filter(Boolean).join(' ').trim() ||
    buyer.email;

  return {
    userId: buyer.id,
    buyerName,
    totalAmountUsd: body.totalAmountUsd,
    buyerEmail: buyer.email,
    buyerPhone: buyer.phone ?? undefined,
    buyerAddress: buyer.buyerProfile?.address ?? undefined,
    listingId: body.listingId?.trim() || undefined,
    vehicleBrand: listing?.brand,
    vehicleModel: listing?.model,
    totalAmountRwf: body.totalAmountRwf,
    notes: body.notes?.trim() || undefined,
    invoiceType: 'FLEET' as const,
  };
}

export function createFleetInvoice(
  buyer: AdminBuyer,
  body: CreateFleetInvoiceInput,
  listing?: AdminListing | null,
) {
  return authenticatedFetch<AdminInvoice>('/admin/invoices/fleet', {
    method: 'POST',
    body: JSON.stringify(buildFleetInvoicePayload(buyer, body, listing)),
  });
}

export function getAdminOrders(filters: AdminOrdersFilters = {}) {
  return authenticatedPaginatedFetch<AdminOrder>('/admin/orders', {
    searchParams: toSearchParams(filters),
  });
}

export function getAdminOrder(id: string) {
  return authenticatedFetch<AdminOrder>(`/admin/orders/${id}`);
}

export function advanceOrder(id: string, body: AdvanceOrderInput = {}) {
  return authenticatedFetch<AdminOrder>(`/admin/orders/${id}/advance`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function cancelOrder(id: string) {
  return authenticatedFetch<AdminOrder>(`/admin/orders/${id}/cancel`, {
    method: 'PATCH',
  });
}

export function getAdminFinancing(filters: AdminFinancingFilters = {}) {
  return authenticatedPaginatedFetch<AdminFinancingRequest>(
    '/admin/financing',
    { searchParams: toSearchParams(filters) },
  );
}

export function getAdminFinancingRequest(id: string) {
  return authenticatedFetch<AdminFinancingRequest>(`/admin/financing/${id}`);
}

export function assignFinancingBank(id: string, body: AssignBankInput) {
  return authenticatedFetch<AdminFinancingRequest>(
    `/admin/financing/${id}/assign-bank`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function recordFinancingOutcome(
  id: string,
  body: FinancingOutcomeInput,
) {
  return authenticatedFetch<AdminFinancingRequest>(
    `/admin/financing/${id}/outcome`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
}

export function getAdminBanks() {
  return authenticatedFetch<Bank[]>('/admin/banks');
}

export function createBank(body: CreateBankInput) {
  const payload = {
    name: body.name.trim(),
    country: body.country.trim().toUpperCase(),
    contactEmail: body.contactEmail?.trim() || undefined,
    contactPhone: body.contactPhone?.trim() || undefined,
  };
  return authenticatedFetch<Bank>('/admin/banks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
