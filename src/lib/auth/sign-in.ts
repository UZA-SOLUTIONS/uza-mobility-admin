'use client';

import { signIn } from 'next-auth/react';
import type { SessionCredentialsInput } from '@/schemas/auth';

/** Start a browser session after the API returned tokens (login or register). */
export function signInWithSession(input: SessionCredentialsInput) {
  return signIn('credentials', {
    ...input,
    redirect: false,
  });
}
