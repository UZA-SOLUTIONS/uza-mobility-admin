'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { authRoutes } from '@/config/routes';
import { signOutClient } from '@/lib/auth/sign-out-client';
import {
  clearSessionUpdate,
  setSessionUpdate,
} from '@/lib/auth/session-update';

/**
 * Keeps the NextAuth JWT fresh (backend access token ~15m).
 * `SessionProvider` has refetchOnWindowFocus disabled — this component is the
 * only place that should call `session.update()` on a schedule / window focus.
 */
const REFRESH_INTERVAL_MS = 4 * 60 * 1000;

export function SessionRefresh() {
  const queryClient = useQueryClient();
  const { data: session, status, update } = useSession();

  useEffect(() => {
    setSessionUpdate(update);
    return () => clearSessionUpdate();
  }, [update]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    if (session?.error === 'RefreshAccessTokenError') {
      void signOutClient({ queryClient, callbackUrl: authRoutes.login });
      return;
    }

    const interval = window.setInterval(() => {
      void update();
    }, REFRESH_INTERVAL_MS);

    let focusTimer: number | undefined;

    const onFocus = () => {
      if (session?.error) return;
      window.clearTimeout(focusTimer);
      // OS file pickers close with a window focus event — debounce so we do not
      // refresh the session mid-upload and remount account pages.
      focusTimer = window.setTimeout(() => {
        void update();
      }, 600);
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(focusTimer);
      window.removeEventListener('focus', onFocus);
    };
  }, [queryClient, session?.error, status, update]);

  return null;
}
