import { z } from 'zod';
import {
  chargingProductTypes,
  energyRequestStatuses,
  fleetRequestStatuses,
  promotionTypes,
} from '@/types/admin/operations';

export const updateFleetStatusSchema = z.object({
  status: z.enum(fleetRequestStatuses),
  adminNotes: z.string().optional(),
});

export type UpdateFleetStatusInput = z.infer<typeof updateFleetStatusSchema>;

export const updateEnergyRequestStatusSchema = z.object({
  status: z.enum(energyRequestStatuses),
});

export type UpdateEnergyRequestStatusInput = z.infer<
  typeof updateEnergyRequestStatusSchema
>;

export const createChargingProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  productType: z.enum(chargingProductTypes),
  brand: z.string().optional(),
  powerKw: z.number().min(0).optional(),
  voltage: z.string().optional(),
  connectorTypes: z.array(z.string()).optional(),
  solarIncluded: z.boolean().optional(),
  priceUsd: z.number().min(0).optional(),
  description: z.string().optional(),
});

export type CreateChargingProductInput = z.infer<
  typeof createChargingProductSchema
>;

export const updateChargingProductSchema =
  createChargingProductSchema.partial();

export type UpdateChargingProductInput = z.infer<
  typeof updateChargingProductSchema
>;

const promotionBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(promotionTypes),
  sponsorName: z.string().optional(),
  discountAmountUsd: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  /** Optional external link for bank/charging/sponsor banners only. */
  partnerWebsiteUrl: z
    .string()
    .url('Enter a valid URL')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

function promotionEndAfterStart(data: {
  startDate?: string;
  endDate?: string;
}) {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) > new Date(data.startDate);
}

export const createPromotionSchema = promotionBaseSchema.refine(
  promotionEndAfterStart,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  },
);

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

export const updatePromotionSchema = promotionBaseSchema
  .partial()
  .refine(promotionEndAfterStart, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;

export const attachPromotionSchema = z.object({
  listingIds: z.array(z.string().min(1)).min(1, 'Select at least one listing'),
});

export type AttachPromotionInput = z.infer<typeof attachPromotionSchema>;

export const MAX_ENERGY_PRODUCT_PHOTOS = 10;
