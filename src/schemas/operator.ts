import { z } from 'zod';

export const operatorApplySchema = z.object({
  businessName: z.string().min(1).max(180),
  businessRegNumber: z.string().max(120).optional(),
  contactPerson: z.string().min(1).max(150),
  phone: z.string().min(3).max(32),
  email: z.string().email(),
  country: z.string().length(2),
  city: z.string().min(1).max(100),
  address: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
});

export type OperatorApplyInput = z.infer<typeof operatorApplySchema>;

export const operatorUpdateProfileSchema = operatorApplySchema.partial();
export type OperatorUpdateProfileInput = z.infer<
  typeof operatorUpdateProfileSchema
>;

export const stationStatusEnum = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'REJECTED',
  'CLOSED',
]);

export const createStationSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  country: z.string().length(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationType: z.enum(['PUBLIC', 'PRIVATE', 'SEMI_PUBLIC', 'FLEET_ONLY']),
  isOpen24h: z.boolean().default(false),
  openingHours: z.record(z.string(), z.any()).optional(),
  hasParking: z.boolean().default(false),
  hasWifi: z.boolean().default(false),
  hasRestroom: z.boolean().default(false),
  hasCCTV: z.boolean().default(false),
  hasRoofCover: z.boolean().default(false),
  operationalStatus: z.enum([
    'OPERATIONAL',
    'PARTIALLY_OPERATIONAL',
    'OFFLINE',
    'MAINTENANCE',
  ]),
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
export const updateStationSchema = createStationSchema.partial();
export type UpdateStationInput = z.infer<typeof updateStationSchema>;

export const createPortSchema = z.object({
  stationId: z.string().min(1),
  portNumber: z.string().max(60).optional(),
  chargerType: z.enum([
    'AC_TYPE2',
    'DC_CCS',
    'DC_CHADEMO',
    'DC_GBDC',
    'AC_TYPE1',
    'TESLA_WALL',
  ]),
  speedCategory: z.enum(['SLOW', 'FAST', 'RAPID', 'ULTRA_RAPID']),
  powerKw: z.number().min(1),
  voltage: z.number().min(1).optional(),
  amperage: z.number().min(1).optional(),
  currentType: z.enum(['AC', 'DC']),
  status: z
    .enum(['AVAILABLE', 'IN_USE', 'FAULTED', 'OUT_OF_SERVICE'])
    .default('AVAILABLE'),
  isActive: z.boolean().default(true),
});
export type CreatePortInput = z.infer<typeof createPortSchema>;

export const setPricingSchema = z.object({
  stationId: z.string().min(1),
  pricingModel: z.enum(['PER_KWH', 'PER_MINUTE', 'PER_SESSION', 'FREE']),
  rateAmount: z.number().min(0).optional(),
  currency: z.string().min(3).max(8).default('USD'),
  notes: z.string().max(400).optional(),
  isActive: z.boolean().default(true),
  validFrom: z.string().min(1),
  validUntil: z.string().optional(),
});
export type SetPricingInput = z.infer<typeof setPricingSchema>;

export const addCompatibilitySchema = z.object({
  stationId: z.string().min(1),
  vehicleCategory: z.enum(['PASSENGER_EV', 'TWO_THREE_WHEEL', 'COMMERCIAL_EV']),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  isVerified: z.boolean().default(false),
});
export type AddCompatibilityInput = z.infer<typeof addCompatibilitySchema>;
