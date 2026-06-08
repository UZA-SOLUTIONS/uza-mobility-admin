function decodeBase64Url(segment: string): string {
  const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');

  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(base64);
  }

  return Buffer.from(base64, 'base64').toString('utf8');
}

/** JWT `exp` as ms since epoch, or `undefined` when missing/invalid. */
export function getAccessTokenExpiryMs(
  accessToken: string,
): number | undefined {
  try {
    const segment = accessToken.split('.')[1];
    if (!segment) return undefined;

    const payload = JSON.parse(decodeBase64Url(segment)) as { exp?: number };

    if (typeof payload.exp !== 'number') return undefined;
    return payload.exp * 1000;
  } catch {
    return undefined;
  }
}
