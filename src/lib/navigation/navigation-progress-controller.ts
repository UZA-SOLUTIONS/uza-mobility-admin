type StartHandler = () => void;
type CompleteHandler = () => void;

let startHandler: StartHandler | null = null;
let completeHandler: CompleteHandler | null = null;

export function registerNavigationProgressStart(handler: StartHandler) {
  startHandler = handler;
  return () => {
    if (startHandler === handler) startHandler = null;
  };
}

export function registerNavigationProgressComplete(handler: CompleteHandler) {
  completeHandler = handler;
  return () => {
    if (completeHandler === handler) completeHandler = null;
  };
}

export function notifyNavigationProgressStart() {
  startHandler?.();
}

export function notifyNavigationProgressComplete() {
  completeHandler?.();
}

function parseSameOriginHref(href: string): string | null {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function willChangeRoute(href: string): boolean {
  if (typeof window === 'undefined') return true;
  const next = parseSameOriginHref(href);
  if (next == null) return false;
  const current = `${window.location.pathname}${window.location.search}`;
  return next !== current;
}
