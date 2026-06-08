import type { MeUser } from '@/types/auth/me-user';
import type { MeSellerProfile } from '@/types/auth/seller-profile';
import type { SellerType } from '@/types/auth/seller-profile';

const MARKETPLACE_SELLER_TYPES: SellerType[] = [
  'LOCAL_SELLER',
  'INTERNATIONAL_SELLER',
];

export function isMarketplaceSellerType(
  sellerType: SellerType | string,
): boolean {
  return (MARKETPLACE_SELLER_TYPES as readonly string[]).includes(sellerType);
}

export function allMeSellers(
  user:
    | {
        sellers?: MeSellerProfile[] | null;
        seller?: MeSellerProfile | null;
      }
    | null
    | undefined,
): MeSellerProfile[] {
  if (!user) return [];
  if (user.sellers?.length) return user.sellers;
  return user.seller ? [user.seller] : [];
}

export function marketplaceMeSeller(
  user: Parameters<typeof allMeSellers>[0],
): MeSellerProfile | null {
  return (
    allMeSellers(user).find((s) => isMarketplaceSellerType(s.sellerType)) ??
    null
  );
}

export function formatSellerChannel(type: SellerType): string {
  return type.replaceAll('_', ' ');
}

export function pickPrimaryMeSeller(
  sellers: MeSellerProfile[],
): MeSellerProfile | null {
  const marketplace = sellers.find((s) =>
    MARKETPLACE_SELLER_TYPES.includes(s.sellerType),
  );
  return marketplace ?? sellers[0] ?? null;
}

/** Ensures `sellers` is always populated from API (new) or legacy `seller` only. */
export function normalizeMeUser(me: MeUser): MeUser {
  const sellers = allMeSellers(me);
  return {
    ...me,
    sellers,
    seller: me.seller ?? pickPrimaryMeSeller(sellers),
  };
}
