'use client';

import type { QueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { authRoutes } from '@/config/routes';
import { clearUserSessionQueries } from '@/lib/query/clear-user-session';

type SignOutClientOptions = {
  queryClient: QueryClient;
  callbackUrl?: string;
  redirect?: boolean;
};

/** Clear cached user data, then end the NextAuth session. */
export async function signOutClient({
  queryClient,
  callbackUrl = authRoutes.login,
  redirect = true,
}: SignOutClientOptions) {
  clearUserSessionQueries(queryClient);
  if (redirect) {
    await signOut({ callbackUrl, redirect: true });
  } else {
    await signOut({ redirect: false });
  }
}
