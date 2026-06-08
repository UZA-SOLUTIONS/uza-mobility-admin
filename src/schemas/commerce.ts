import { z } from 'zod';

export const rejectPaymentSchema = z.object({
  reason: z.string().min(3).max(500),
});

export type RejectPaymentInput = z.infer<typeof rejectPaymentSchema>;

export const partialPaymentSchema = z.object({
  amountReceived: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type PartialPaymentInput = z.infer<typeof partialPaymentSchema>;

export const advanceOrderSchema = z.object({
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
});

export type AdvanceOrderInput = z.infer<typeof advanceOrderSchema>;

export const assignBankSchema = z.object({
  bankId: z.string().min(1),
  reviewNotes: z.string().max(1000).optional(),
});

export type AssignBankInput = z.infer<typeof assignBankSchema>;

export const financingOutcomeSchema = z.object({
  status: z.enum(['BANK_APPROVED', 'BANK_REJECTED']),
  reviewNotes: z.string().max(1000).optional(),
});

export type FinancingOutcomeInput = z.infer<typeof financingOutcomeSchema>;

export const createBankSchema = z.object({
  name: z.string().min(1).max(150),
  country: z.string().min(2).max(2),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(30).optional(),
});

export type CreateBankInput = z.infer<typeof createBankSchema>;

export const createFleetInvoiceSchema = z.object({
  userId: z.string().min(1, 'Select a buyer'),
  listingId: z.string().optional(),
  totalAmountUsd: z.number().min(0.01, 'Amount must be greater than zero'),
  totalAmountRwf: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateFleetInvoiceInput = z.infer<typeof createFleetInvoiceSchema>;
