'use client';

import { getSession } from 'next-auth/react';
import { siteConfig } from '@/config/site';
import type { ApiResponse } from '@/types/api/envelope';
import { ApiClientError } from './error';
import { refreshSession } from '@/lib/auth/session-update';

type MultipartOptions = {
  method?: string;
  token?: string | null;
  _retried?: boolean;
};

function buildUrl(path: string): string {
  return `${siteConfig.apiUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function buildMultipartFormData(
  payload: Record<string, unknown>,
  files?: { field: string; files: File[] }[],
): FormData {
  const form = new FormData();
  form.append('payload', JSON.stringify(payload));

  for (const entry of files ?? []) {
    for (const file of entry.files) {
      form.append(entry.field, file);
    }
  }

  return form;
}

export function buildVerificationFormData(
  payload: Record<string, unknown>,
  files?: { report?: File; batteryReport?: File },
): FormData {
  const form = new FormData();
  form.append('payload', JSON.stringify(payload));
  if (files?.report) {
    form.append('report', files.report);
  }
  if (files?.batteryReport) {
    form.append('batteryReport', files.batteryReport);
  }
  return form;
}

export async function authenticatedMultipartFetch<T>(
  path: string,
  formData: FormData,
  options: MultipartOptions = {},
): Promise<T> {
  const { method = 'POST', token: explicitToken, _retried } = options;
  const session = await getSession();
  const token = explicitToken ?? session?.accessToken ?? null;

  if (!token) {
    throw new ApiClientError('Not authenticated', 401);
  }

  if (session?.error === 'RefreshAccessTokenError') {
    throw new ApiClientError('Session expired. Please sign in again.', 401);
  }

  const response = await fetch(buildUrl(path), {
    method,
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    const message =
      !body.success && 'error' in body
        ? body.error.message
        : response.statusText;
    const code = !body.success && 'error' in body ? body.error.code : undefined;

    const canRetry =
      !_retried && response.status === 401 && session?.refreshToken;

    if (canRetry) {
      const refreshed = await refreshSession();
      const nextToken =
        refreshed?.accessToken ?? (await getSession())?.accessToken;
      if (nextToken && refreshed?.error !== 'RefreshAccessTokenError') {
        return authenticatedMultipartFetch<T>(path, formData, {
          method,
          token: nextToken,
          _retried: true,
        });
      }
    }

    throw new ApiClientError(message, response.status, code);
  }

  return body.data;
}
