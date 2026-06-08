'use client';

import { MarketingCatalogProvider } from '@/components/marketing/marketing-catalog-context';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNavbar } from '@/components/marketing/navbar';
import {
  buildMarketingFooterColumns,
  buildMarketingNav,
} from '@/lib/marketing/marketing-catalog-nav';
import type { Category } from '@/types/admin/marketplace';

type MarketingChromeProps = {
  children: React.ReactNode;
  categories: Category[];
  overlayNav?: boolean;
};

export function MarketingChrome({
  children,
  categories,
  overlayNav = true,
}: MarketingChromeProps) {
  const navItems = buildMarketingNav(categories);
  const footerColumns = buildMarketingFooterColumns(categories);

  return (
    <MarketingCatalogProvider categories={categories}>
      <div className="flex min-h-full flex-col overflow-x-hidden">
        <div className="relative">
          <MarketingNavbar overlay={overlayNav} navItems={navItems} />
          <main className="flex-1">{children}</main>
        </div>
        <MarketingFooter columns={footerColumns} />
      </div>
    </MarketingCatalogProvider>
  );
}
