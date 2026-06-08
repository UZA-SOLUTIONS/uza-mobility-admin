import { siteConfig } from '@/config/site';
import type { ApiResponse } from '@/types/api/envelope';
import type { PaginatedResult, PaginationMeta } from '@/types/api/pagination';
import { ApiClientError } from './error';
import type { ApiRequestOptions } from './types';

export { ApiClientError } from './error';
export type { ApiRequestOptions } from './types';

function buildUrl(path: string, searchParams?: URLSearchParams): string {
  const base = `${siteConfig.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
  if (!searchParams || [...searchParams].length === 0) {
    return base;
  }
  return `${base}?${searchParams.toString()}`;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, searchParams, ...init } = options;
  const url = buildUrl(path, searchParams);

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const raw = await response.text();
  let body: ApiResponse<T>;
  try {
    body = JSON.parse(raw) as ApiResponse<T>;
  } catch {
    if (raw.trimStart().startsWith('<')) {
      throw new ApiClientError(
        'API returned HTML instead of JSON. Check that NEXT_PUBLIC_API_URL points at the backend API.',
        response.status,
      );
    }
    throw new ApiClientError(
      response.statusText || 'Invalid API response',
      response.status,
    );
  }

  if (!response.ok || !body.success) {
    const message =
      !body.success && 'error' in body
        ? body.error.message
        : response.statusText;
    const code = !body.success && 'error' in body ? body.error.code : undefined;
    throw new ApiClientError(message, response.status, code);
  }

  return body.data;
}

export async function apiFetchPaginated<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<PaginatedResult<T>> {
  const { token, headers, searchParams, ...init } = options;
  const url = buildUrl(path, searchParams);

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const raw = await response.text();
  let body: ApiResponse<T[]> & { meta?: PaginationMeta };
  try {
    body = JSON.parse(raw) as ApiResponse<T[]> & { meta?: PaginationMeta };
  } catch {
    if (raw.trimStart().startsWith('<')) {
      throw new ApiClientError(
        'API returned HTML instead of JSON. Check that NEXT_PUBLIC_API_URL points at the backend API.',
        response.status,
      );
    }
    throw new ApiClientError(
      response.statusText || 'Invalid API response',
      response.status,
    );
  }

  if (!response.ok || !body.success) {
    const message =
      !body.success && 'error' in body
        ? body.error.message
        : response.statusText;
    const code = !body.success && 'error' in body ? body.error.code : undefined;
    throw new ApiClientError(message, response.status, code);
  }

  return {
    items: body.data,
    meta: body.meta ?? {
      total: body.data.length,
      page: 1,
      limit: body.data.length,
      totalPages: 1,
    },
  };
}
