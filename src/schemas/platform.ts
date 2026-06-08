import { z } from 'zod';
import {
  assignableRoleNames,
  pricingSellerTypes,
} from '@/types/admin/platform';

export const assignUserRolesSchema = z.object({
  roles: z
    .array(z.enum(assignableRoleNames))
    .min(1, 'Select at least one role'),
});

export type AssignUserRolesInput = z.infer<typeof assignUserRolesSchema>;

const optionalNumber = z.number().min(0).optional();

export const createPricingRuleSchema = z.object({
  sellerType: z.enum(pricingSellerTypes),
  originCountry: z.string().optional(),
  destinationCountry: z.string().optional(),
  shippingCostUsd: optionalNumber,
  localChargesUsd: optionalNumber,
  taxRatePercent: optionalNumber,
  insuranceRatePercent: optionalNumber,
  storagePerDayUsd: optionalNumber,
  clearingFeeUsd: optionalNumber,
  platformMarginPercent: optionalNumber,
  commissionRate: optionalNumber,
  exchangeRateRwf: optionalNumber,
  deliveryDaysMin: z.number().int().min(0).optional(),
  deliveryDaysMax: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;

export const updatePricingRuleSchema = createPricingRuleSchema.partial();

export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
