'use client';

import type { AppSession } from '@/types/auth/session';

type SessionUpdateFn = () => Promise<AppSession | null | undefined>;

let sessionUpdate: SessionUpdateFn | null = null;

export function setSessionUpdate(fn: SessionUpdateFn) {
  sessionUpdate = fn;
}

export function clearSessionUpdate() {
  sessionUpdate = null;
}

export async function refreshSession() {
  if (!sessionUpdate) {
    throw new Error('Session update is not available');
  }

  return sessionUpdate();
}
