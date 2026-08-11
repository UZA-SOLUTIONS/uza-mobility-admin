'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { setUsdToRwfEffective } from '@/lib/admin/format';
import { useExchangeRate } from '@/queries/platform-settings';

/**
 * Syncs the public FX rate into formatUsd() and remounts children once when the
 * rate first arrives so existing money call sites re-render with dual currency.
 */
export function ExchangeRateSync({ children }: { children: ReactNode }) {
  const { data, isFetched } = useExchangeRate();
  const [readyKey, setReadyKey] = useState(0);

  useEffect(() => {
    setUsdToRwfEffective(data?.usdToRwfEffective ?? null);
    if (isFetched && data?.usdToRwfEffective != null && readyKey === 0) {
      setReadyKey(1);
    }
  }, [data?.usdToRwfEffective, isFetched, readyKey]);

  return (
    <div key={readyKey} className="contents">
      {children}
    </div>
  );
}
