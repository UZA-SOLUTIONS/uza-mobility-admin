import { refresh } from '@/lib/api/auth';
import type { AppJwt } from '@/types/auth/session';
import { getAccessTokenExpiryMs } from './token-expiry';

const REFRESH_BUFFER_MS = 60_000;

export async function refreshAccessToken(token: AppJwt): Promise<AppJwt> {
  if (!token.refreshToken) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  try {
    const tokens = await refresh(token.refreshToken);

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpires: getAccessTokenExpiryMs(tokens.accessToken),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export function shouldRefreshAccessToken(token: AppJwt): boolean {
  if (token.error === 'RefreshAccessTokenError') {
    return false;
  }

  if (!token.accessToken) {
    return false;
  }

  const expires = token.accessTokenExpires;
  if (expires === undefined) {
    return true;
  }

  return Date.now() >= expires - REFRESH_BUFFER_MS;
}
