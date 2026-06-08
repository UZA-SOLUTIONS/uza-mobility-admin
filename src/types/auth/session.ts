import type { AuthTokens } from './auth-tokens';
import type { MeUser } from './me-user';

export type AuthSessionError = 'RefreshAccessTokenError';

/** User object returned from Credentials `authorize` (profile + tokens). */
export type AuthUser = MeUser & AuthTokens;

/** Client/server session shape for this app. */
export type AppSession = AuthTokens & {
  user: MeUser;
  error?: AuthSessionError;
};

/** JWT payload persisted by NextAuth for this app. */
export type AppJwt = AuthTokens & {
  user: MeUser;
  accessTokenExpires?: number;
  error?: AuthSessionError;
};

export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const user = value as Record<string, unknown>;
  return (
    typeof user.id === 'string' &&
    Array.isArray(user.permissions) &&
    typeof user.accessToken === 'string' &&
    typeof user.refreshToken === 'string'
  );
}
