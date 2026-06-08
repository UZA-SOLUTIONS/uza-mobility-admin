import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(3).max(32).optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'fr', 'rw']),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateBuyerProfileSchema = z.object({
  organizationName: z.string().max(200).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
});

export type UpdateBuyerProfileInput = z.infer<typeof updateBuyerProfileSchema>;

export const sellerProfileTypes = [
  'UZA_RWANDA_STOCK',
  'UZA_CHINA_SOURCING',
  'LOCAL_SELLER',
  'INTERNATIONAL_SELLER',
] as const;

export type SellerProfileType = (typeof sellerProfileTypes)[number];

export function parseSellerProfileType(
  value: string | undefined | null,
): SellerProfileType | undefined {
  if (!value) return undefined;
  return sellerProfileTypes.includes(value as SellerProfileType)
    ? (value as SellerProfileType)
    : undefined;
}

export const updateSellerProfileSchema = z.object({
  sellerType: z.enum(sellerProfileTypes).optional(),
  businessName: z.string().min(1).max(150).optional(),
  contactPerson: z.string().max(150).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
});

export type UpdateSellerProfileInput = z.infer<
  typeof updateSellerProfileSchema
>;
