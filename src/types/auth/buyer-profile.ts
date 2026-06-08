export type BuyerType = 'INDIVIDUAL' | 'ORGANIZATION' | string;

export type MeBuyerProfile = {
  id: string;
  buyerType: BuyerType;
  organizationName: string | null;
  taxId?: string | null;
  address?: string | null;
  city: string | null;
  country: string;
  nationalId?: string | null;
  passportNumber?: string | null;
  isVerified: boolean;
};
