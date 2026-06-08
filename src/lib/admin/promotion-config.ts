import type { CreatePromotionInput } from '@/schemas/operations';
import type { PromotionType } from '@/types/admin/operations';

/** Payload sent to `POST/PATCH /admin/promotions` after UI normalization. */
export type PromotionApiPayload = Omit<
  CreatePromotionInput,
  'partnerWebsiteUrl'
> & {
  bannerPlacement?: string;
  clickUrl?: string;
};

export type PromotionTypeGroup = {
  label: string;
  description: string;
  types: PromotionType[];
};

/** How admins think about promotions — aligns with attach-listings vs banner flows. */
export const PROMOTION_TYPE_GROUPS: PromotionTypeGroup[] = [
  {
    label: 'Listing discounts',
    description: 'Reduced price on vehicles you attach after saving.',
    types: [
      'DISCOUNT_CAMPAIGN',
      'FLEET_DISCOUNT',
      'DEAL_OF_WEEK',
      'NEW_ARRIVAL_HIGHLIGHT',
      'FEATURED_LISTING',
      'SEASONAL_PROMOTION',
      'TAXI_ASSOCIATION_CAMPAIGN',
      'REFERRAL_PROMOTION',
    ],
  },
  {
    label: 'Homepage & partner banners',
    description:
      'Hero/partner slots; upload a banner — placement is automatic.',
    types: [
      'HOMEPAGE_BANNER',
      'BANK_PARTNER_BANNER',
      'CHARGING_PARTNER_BANNER',
      'CATEGORY_SPONSORSHIP',
      'SPONSORED_SUPPLIER',
    ],
  },
];

const BANNER_TYPES = new Set<PromotionType>([
  'HOMEPAGE_BANNER',
  'BANK_PARTNER_BANNER',
  'CHARGING_PARTNER_BANNER',
  'CATEGORY_SPONSORSHIP',
  'SPONSORED_SUPPLIER',
]);

const PARTNER_LINK_TYPES = new Set<PromotionType>([
  'BANK_PARTNER_BANNER',
  'CHARGING_PARTNER_BANNER',
  'SPONSORED_SUPPLIER',
]);

/** Storefront slot — kept in sync with marketing layout expectations. */
const BANNER_PLACEMENT_BY_TYPE: Partial<Record<PromotionType, string>> = {
  HOMEPAGE_BANNER: 'HOMEPAGE_TOP',
  BANK_PARTNER_BANNER: 'HOMEPAGE_PARTNERS',
  CHARGING_PARTNER_BANNER: 'ENERGY_SECTION',
  CATEGORY_SPONSORSHIP: 'CATEGORY_PAGE',
  SPONSORED_SUPPLIER: 'MARKETPLACE_SIDEBAR',
};

export function isBannerPromotionType(type: PromotionType): boolean {
  return BANNER_TYPES.has(type);
}

export function isListingDiscountType(type: PromotionType): boolean {
  return !BANNER_TYPES.has(type);
}

export function showDiscountFields(type: PromotionType): boolean {
  return isListingDiscountType(type);
}

export function showPartnerWebsiteField(type: PromotionType): boolean {
  return PARTNER_LINK_TYPES.has(type);
}

export function promotionTypeHint(type: PromotionType): string {
  if (isBannerPromotionType(type)) {
    return 'Upload a banner image. After saving, attach listings if the banner should deep-link to specific vehicles.';
  }
  return 'Set a discount, then open the promotion and attach marketplace listings — that is how the offer is applied.';
}

export function buildPromotionApiPayload(
  values: CreatePromotionInput,
): PromotionApiPayload {
  const type = values.type;
  const placement = isBannerPromotionType(type)
    ? BANNER_PLACEMENT_BY_TYPE[type]
    : undefined;

  const partnerUrl = values.partnerWebsiteUrl?.trim();
  const clickUrl =
    showPartnerWebsiteField(type) && partnerUrl ? partnerUrl : undefined;

  return {
    name: values.name,
    type: values.type,
    sponsorName: values.sponsorName,
    discountAmountUsd: showDiscountFields(type)
      ? values.discountAmountUsd
      : undefined,
    discountPercent: showDiscountFields(type)
      ? values.discountPercent
      : undefined,
    bannerPlacement: placement,
    startDate: values.startDate,
    endDate: values.endDate,
    clickUrl,
    notes: values.notes,
  };
}
