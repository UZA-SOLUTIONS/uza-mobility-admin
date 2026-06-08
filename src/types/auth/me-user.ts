import type { MeBuyerProfile } from './buyer-profile';
import type { MeOperatorSummary } from './operator-profile';
import type { MeSellerProfile } from './seller-profile';
import type { PlatformRole } from './role';

export type MeUser = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferredLanguage: string;
  profilePhoto: string | null;
  roles: PlatformRole[];
  permissions: string[];
  buyerProfile: MeBuyerProfile | null;
  /** Primary profile (marketplace seller if any, else first channel). */
  seller: MeSellerProfile | null;
  /** One row per inventory channel (e.g. Rwanda stock + China sourcing). */
  sellers?: MeSellerProfile[];
  /** Charging operator application or approved profile. */
  operator?: MeOperatorSummary | null;
  createdAt: string;
  updatedAt: string;
};

export function isMeUser(value: unknown): value is MeUser {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;
  return typeof user.id === 'string' && Array.isArray(user.permissions);
}
