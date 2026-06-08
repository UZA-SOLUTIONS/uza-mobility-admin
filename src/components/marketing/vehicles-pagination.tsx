'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { brand } from '@/lib/marketing/colors';
import type { VehiclesSearchParams } from '@/lib/marketing/vehicles-browse';
import { vehiclesHref } from '@/lib/marketing/vehicles-url';

type VehiclesPaginationProps = {
  filters: VehiclesSearchParams;
  currentPage: number;
  totalPages: number;
};

export function VehiclesPagination({
  filters,
  currentPage,
  totalPages,
}: VehiclesPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1),
  );

  const items: (number | 'gap')[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i]! - pages[i - 1]! > 1) items.push('gap');
    items.push(pages[i]!);
  }

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-0"
      aria-label="Pagination"
    >
      {items.map((item, idx) =>
        item === 'gap' ? (
          <span key={`gap-${idx}`} className="px-2 text-[#356769]">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={vehiclesHref({ ...filters, page: item })}
            className="flex size-10 items-center justify-center rounded-full text-sm font-medium transition-opacity hover:opacity-90"
            style={
              item === currentPage
                ? { backgroundColor: brand.forest, color: '#fff' }
                : { backgroundColor: '#fff', color: '#356769' }
            }
            aria-current={item === currentPage ? 'page' : undefined}
          >
            {item}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link
          href={vehiclesHref({ ...filters, page: currentPage + 1 })}
          className="ml-1 flex size-10 items-center justify-center rounded-full bg-white text-[#356769]"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
