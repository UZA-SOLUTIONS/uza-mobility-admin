import { apiFetch } from './api';
import type { AuthTokens } from '@/types/auth/auth-tokens';
import type { MeUser } from '@/types/auth/me-user';
import type { LoginInput } from '@/schemas/auth';
import type { RegisterInput } from '@/schemas/auth';

export function login(input: LoginInput) {
  return apiFetch<AuthTokens>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function register(input: RegisterInput) {
  const payload = {
    ...input,
    phone: input.phone?.trim() ? input.phone.trim() : undefined,
  };

  return apiFetch<AuthTokens>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout(refreshToken: string) {
  await apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
    token: refreshToken,
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    token: refreshToken,
  });
}

/** Profile for a given access token (server / authorize). */
export function getMe(accessToken: string) {
  return apiFetch<MeUser>('/auth/me', { token: accessToken });
}
