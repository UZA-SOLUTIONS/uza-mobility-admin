'use client';

import { getSession } from 'next-auth/react';
import { refreshSession } from '@/lib/auth/session-update';
import type { AppSession } from '@/types/auth/session';
import { apiFetch, apiFetchPaginated } from './api';
import { ApiClientError } from './error';
import type { ApiRequestOptions } from './types';
import type { PaginatedResult } from '@/types/api/pagination';

type AuthenticatedOptions = ApiRequestOptions & {
  /** Internal: prevent infinite retry loops. */
  _retried?: boolean;
};

let refreshInFlight: Promise<AppSession | null | undefined> | null = null;

async function refreshSessionOnce() {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function resolveSession(
  explicitToken?: string | null,
): Promise<AppSession | null> {
  if (explicitToken) {
    return null;
  }
  return (await getSession()) as AppSession | null;
}

/**
 * API call using the current session access token.
 * Pass `token` from `useSession().data.accessToken` in React Query hooks to avoid
 * hammering `/api/auth/session` (which can race and return HTML errors in dev).
 * On 401, refreshes the session via NextAuth and retries once.
 */
export async function authenticatedFetch<T>(
  path: string,
  options: AuthenticatedOptions = {},
): Promise<T> {
  const { _retried, token: explicitToken, ...rest } = options;
  let session = await resolveSession(explicitToken);
  const token = explicitToken ?? session?.accessToken ?? null;

  if (!token) {
    throw new ApiClientError('Not authenticated', 401);
  }

  if (session?.error === 'RefreshAccessTokenError') {
    throw new ApiClientError('Session expired. Please sign in again.', 401);
  }

  try {
    return await apiFetch<T>(path, { ...rest, token });
  } catch (error) {
    if (!session) {
      session = (await getSession()) as AppSession | null;
    }

    const canRetry =
      !_retried &&
      error instanceof ApiClientError &&
      error.statusCode === 401 &&
      session?.refreshToken;

    if (!canRetry) {
      throw error;
    }

    const refreshed = await refreshSessionOnce();
    const nextToken =
      refreshed?.accessToken ?? (await getSession())?.accessToken;

    if (!nextToken || refreshed?.error === 'RefreshAccessTokenError') {
      throw new ApiClientError('Session expired. Please sign in again.', 401);
    }

    if (nextToken === token) {
      throw error;
    }

    return authenticatedFetch<T>(path, {
      ...rest,
      token: nextToken,
      _retried: true,
    });
  }
}

export async function authenticatedPaginatedFetch<T>(
  path: string,
  options: AuthenticatedOptions = {},
): Promise<PaginatedResult<T>> {
  const { _retried, token: explicitToken, ...rest } = options;
  let session = await resolveSession(explicitToken);
  const token = explicitToken ?? session?.accessToken ?? null;

  if (!token) {
    throw new ApiClientError('Not authenticated', 401);
  }

  if (session?.error === 'RefreshAccessTokenError') {
    throw new ApiClientError('Session expired. Please sign in again.', 401);
  }

  try {
    return await apiFetchPaginated<T>(path, { ...rest, token });
  } catch (error) {
    if (!session) {
      session = (await getSession()) as AppSession | null;
    }

    const canRetry =
      !_retried &&
      error instanceof ApiClientError &&
      error.statusCode === 401 &&
      session?.refreshToken;

    if (!canRetry) {
      throw error;
    }

    const refreshed = await refreshSessionOnce();
    const nextToken =
      refreshed?.accessToken ?? (await getSession())?.accessToken;

    if (!nextToken || refreshed?.error === 'RefreshAccessTokenError') {
      throw new ApiClientError('Session expired. Please sign in again.', 401);
    }

    if (nextToken === token) {
      throw error;
    }

    return authenticatedPaginatedFetch<T>(path, {
      ...rest,
      token: nextToken,
      _retried: true,
    });
  }
}
