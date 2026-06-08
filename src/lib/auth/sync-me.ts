import { getMe } from '@/lib/api/auth';
import { normalizeMeUser } from '@/lib/auth/seller-profiles';
import type { MeUser } from '@/types/auth/me-user';

export async function fetchMeUser(accessToken: string): Promise<MeUser> {
  return normalizeMeUser(await getMe(accessToken));
}
