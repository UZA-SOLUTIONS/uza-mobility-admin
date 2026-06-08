'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { brand } from '@/lib/marketing/colors';
import {
  notifyNavigationProgressComplete,
  registerNavigationProgressComplete,
  registerNavigationProgressStart,
  willChangeRoute,
} from '@/lib/navigation/navigation-progress-controller';

const TICK_MS = 100;
/** Brief fade-out after the route has committed (not extra loading time). */
const COMPLETE_FADE_MS = 150;

function NavigationProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const tickingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);

  const clearTimers = () => {
    if (tickingRef.current) clearInterval(tickingRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    tickingRef.current = null;
    hideRef.current = null;
  };

  const start = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    clearTimers();
    setVisible(true);
    setProgress(18);
    tickingRef.current = setInterval(() => {
      setProgress((value) => {
        if (value >= 90) return value;
        return Math.min(90, value + Math.max(2, (90 - value) * 0.12));
      });
    }, TICK_MS);
  }, []);

  /** Called when Next.js has committed the new page (pathname / search params updated). */
  const finish = useCallback(() => {
    if (!loadingRef.current) return;

    clearTimers();
    setProgress(100);
    hideRef.current = setTimeout(() => {
      loadingRef.current = false;
      setVisible(false);
      setProgress(0);
    }, COMPLETE_FADE_MS);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => clearTimers();
  }, []);

  useEffect(() => registerNavigationProgressStart(start), [start]);
  useEffect(() => registerNavigationProgressComplete(finish), [finish]);

  useEffect(() => {
    const onNavigateIntent = (event: MouseEvent | PopStateEvent) => {
      if (event instanceof MouseEvent) {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }

        const anchor = (event.target as Element | null)?.closest('a');
        if (!anchor) return;
        if (anchor.target === '_blank' || anchor.hasAttribute('download'))
          return;

        const href = anchor.getAttribute('href');
        if (
          !href ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:')
        ) {
          return;
        }

        let url: URL;
        try {
          url = new URL(href, window.location.href);
        } catch {
          return;
        }
        if (url.origin !== window.location.origin) return;
        if (!willChangeRoute(`${url.pathname}${url.search}`)) return;
      }

      start();
    };

    document.addEventListener('click', onNavigateIntent, true);
    window.addEventListener('popstate', onNavigateIntent);
    return () => {
      document.removeEventListener('click', onNavigateIntent, true);
      window.removeEventListener('popstate', onNavigateIntent);
    };
  }, [start]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Page loading"
      aria-busy="true"
    >
      <div
        className="h-1 w-full transition-opacity duration-150"
        style={{ opacity: progress >= 100 ? 0 : 1 }}
      >
        <div
          className="h-full transition-[width] duration-200 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: brand.forest,
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

/**
 * Finishes the bar when the App Router reports a new page (path or query).
 * Kept separate so `useSearchParams` suspense cannot unmount the visible bar.
 */
function NavigationProgressRouteWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }
    notifyNavigationProgressComplete();
  }, [routeKey]);

  return null;
}

export function NavigationProgress() {
  return (
    <>
      <NavigationProgressBar />
      <Suspense fallback={null}>
        <NavigationProgressRouteWatcher />
      </Suspense>
    </>
  );
}
