/**
 * NextAuth (Auth.js) session adapter only.
 *
 * - Schemas: `schemas/auth.ts`
 * - API calls: `lib/api/auth.ts`
 * - UI + hooks: `components/auth/*`, `queries/auth.ts`
 *
 * NextAuth is used because the app needs a signed HTTP session cookie, `useSession`,
 * route protection in `proxy.ts`, and JWT refresh — not because login logic lives here.
 */
import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authRoutes } from '@/config/routes';
import { isMeUser, type MeUser } from '@/types/auth/me-user';
import { isAuthUser, type AppJwt, type AuthUser } from '@/types/auth/session';
import { authorizeCredentials } from './authorize';
import { refreshAccessToken, shouldRefreshAccessToken } from './refresh-token';
import { getAccessTokenExpiryMs } from './token-expiry';

function userToJwt(user: AuthUser): AppJwt {
  const { accessToken, refreshToken, ...me } = user;

  return {
    accessToken,
    refreshToken,
    user: me,
    accessTokenExpires: getAccessTokenExpiryMs(accessToken),
    error: undefined,
  };
}

function isAppJwt(token: unknown): token is AppJwt {
  return (
    typeof token === 'object' &&
    token !== null &&
    'accessToken' in token &&
    'user' in token
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'Access token', type: 'hidden' },
        refreshToken: { label: 'Refresh token', type: 'hidden' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  pages: {
    signIn: authRoutes.login,
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user && isAuthUser(user)) {
        return { ...token, ...userToJwt(user) };
      }

      if (
        trigger === 'update' &&
        session &&
        typeof session === 'object' &&
        'user' in session &&
        isMeUser((session as { user: unknown }).user) &&
        isAppJwt(token)
      ) {
        return {
          ...token,
          user: (session as { user: MeUser }).user,
        };
      }

      if (!isAppJwt(token)) {
        return token;
      }

      if (token.error === 'RefreshAccessTokenError') {
        return token;
      }

      if (shouldRefreshAccessToken(token)) {
        return refreshAccessToken(token);
      }

      return token;
    },
    session({ session, token }): Session {
      if (!isAppJwt(token)) {
        return session;
      }

      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        user: token.user,
        error: token.error,
      } as Session;
    },
  },
  trustHost: true,
});
