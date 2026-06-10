import { getMe } from '@/lib/api/auth';
import { normalizeMeUser } from '@/lib/auth/seller-profiles';
import { hasAdminAccess } from '@/lib/permissions';
import { sessionCredentialsSchema } from '@/schemas/auth';
import type { AuthTokens } from '@/types/auth/auth-tokens';
import type { MeUser } from '@/types/auth/me-user';
import type { AuthUser } from '@/types/auth/session';

function toAuthUser(me: MeUser, tokens: AuthTokens): AuthUser {
  return { ...normalizeMeUser(me), ...tokens };
}

/**
 * NextAuth Credentials `authorize` — runs after API login/register already succeeded.
 * Validates `SessionCredentialsInput` and loads the user profile with the access token.
 */
export async function authorizeCredentials(
  credentials: Record<string, unknown> | undefined,
): Promise<AuthUser | null> {
  const parsed = sessionCredentialsSchema.safeParse(credentials);
  if (!parsed.success) {
    return null;
  }

  const { accessToken, refreshToken } = parsed.data;

  try {
    const me = await getMe(accessToken);
    const user = normalizeMeUser(me);

    if (!hasAdminAccess(user.permissions, user.roles)) {
      return null;
    }

    if (!user.isEmailVerified) {
      return null;
    }

    return toAuthUser(user, { accessToken, refreshToken });
  } catch {
    return null;
  }
}
