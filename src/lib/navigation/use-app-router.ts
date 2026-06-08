'use client';

import { useMemo } from 'react';
import { useRouter as useNextRouter } from 'next/navigation';
import {
  notifyNavigationProgressStart,
  willChangeRoute,
} from '@/lib/navigation/navigation-progress-controller';

type AppRouter = ReturnType<typeof useNextRouter>;
type AppHref = Parameters<AppRouter['push']>[0];

function shouldStartProgress(href: AppHref): boolean {
  if (typeof href !== 'string') {
    // Next typed routes use string `href` in this app; show progress otherwise.
    return true;
  }
  return willChangeRoute(href);
}

/**
 * Drop-in replacement for `useRouter` that starts the global navigation
 * progress bar before programmatic navigations (`push`, `replace`, `back`, …).
 */
export function useAppRouter(): AppRouter {
  const router = useNextRouter();

  return useMemo(() => {
    const push: AppRouter['push'] = (href, options) => {
      if (shouldStartProgress(href)) notifyNavigationProgressStart();
      return router.push(href, options);
    };

    const replace: AppRouter['replace'] = (href, options) => {
      if (shouldStartProgress(href)) notifyNavigationProgressStart();
      return router.replace(href, options);
    };

    const back: AppRouter['back'] = (...args) => {
      notifyNavigationProgressStart();
      return router.back(...args);
    };

    const forward: AppRouter['forward'] = (...args) => {
      notifyNavigationProgressStart();
      return router.forward(...args);
    };

    const refresh: AppRouter['refresh'] = (...args) => {
      notifyNavigationProgressStart();
      return router.refresh(...args);
    };

    return {
      ...router,
      push,
      replace,
      back,
      forward,
      refresh,
    };
  }, [router]);
}
