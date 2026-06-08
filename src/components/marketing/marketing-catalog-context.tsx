'use client';

import { createContext, useContext } from 'react';
import type { Category } from '@/types/admin/marketplace';

const MarketingCatalogContext = createContext<Category[]>([]);

export function MarketingCatalogProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <MarketingCatalogContext.Provider value={categories}>
      {children}
    </MarketingCatalogContext.Provider>
  );
}

export function useMarketingCategories(): Category[] {
  return useContext(MarketingCatalogContext);
}
