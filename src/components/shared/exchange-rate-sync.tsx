'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { setUsdToRwfEffective } from '@/lib/admin/format';
import { useExchangeRate } from '@/queries/platform-settings';

/**
 * Loads the frozen leftover-USD display rate so listing/invoice helpers can
 * convert untouched USD rows to Rwf.
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
