import { authenticatedFetch } from '@/lib/api/authenticated';
import {
  authenticatedMultipartFetch,
  buildMultipartFormData,
} from '@/lib/api/multipart';
import type { MeUser } from '@/types/auth/me-user';
import type {
  UpdateBuyerProfileInput,
  UpdateProfileInput,
  UpdateSellerProfileInput,
} from '@/schemas/profile';

export function updateProfile(body: UpdateProfileInput, photo?: File) {
  const form = buildMultipartFormData(
    body,
    photo ? [{ field: 'photo', files: [photo] }] : [],
  );
  return authenticatedMultipartFetch<MeUser>('/auth/me', form, {
    method: 'PATCH',
  });
}

export function updateBuyerProfile(body: UpdateBuyerProfileInput) {
  return authenticatedFetch<unknown>('/users/buyer-profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function updateSellerProfile(body: UpdateSellerProfileInput) {
  const query =
    body.sellerType != null
      ? `?sellerType=${encodeURIComponent(body.sellerType)}`
      : '';
  return authenticatedFetch<unknown>(`/users/seller-profile${query}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
