'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { isMarketingNavItemActive } from '@/lib/marketing/nav-active';
import { cn } from '@/lib/utils';

type MarketingNavLinkProps = {
  item: NavItem;
  overlay?: boolean;
  variant: 'desktop' | 'mobile';
  className?: string;
  onClick?: () => void;
};

export function MarketingNavLink({
  item,
  overlay = false,
  variant,
  className,
  onClick,
}: MarketingNavLinkProps) {
  const pathname = usePathname();
  const active = isMarketingNavItemActive(pathname, item.href);

  if (variant === 'desktop') {
    return (
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'rounded-lg px-4 py-2 text-sm font-medium tracking-wide transition-colors',
          overlay
            ? active
              ? 'font-semibold text-[#AAFF47]'
              : 'text-white/90 hover:text-white'
            : active
              ? 'font-semibold text-[#AAFF47]'
              : 'text-[#356769] hover:text-[#174438]',
          className,
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'block rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
        active
          ? 'font-semibold text-[#AAFF47]'
          : 'text-white/85 hover:text-white',
        className,
      )}
    >
      {item.label}
    </Link>
  );
}
