'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import type { NavItem } from '@/config/navigation';
import { MarketingNavLink } from '@/components/marketing/marketing-nav-link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type NavbarMobileMenuProps = {
  navItems: NavItem[];
  overlay?: boolean;
};

export function NavbarMobileMenu({
  navItems,
  overlay = false,
}: NavbarMobileMenuProps) {
  const triggerClass = overlay
    ? 'text-white hover:bg-white/10'
    : 'text-[#174438] hover:bg-[#AAFF47]/15';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`lg:hidden ${triggerClass}`}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" strokeWidth={2.25} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-[min(100vw-1.5rem,300px)] flex-col gap-0 border-l border-white/10 bg-[#174438] p-0 text-white [&_[data-slot=sheet-close]]:text-white [&_[data-slot=sheet-close]]:hover:bg-white/10"
      >
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 pr-12">
          <Link href="/" className="relative block h-10 w-24 shrink-0">
            <Image
              src="/images/FInal-logo.png"
              alt="UZA Mobility"
              fill
              className="object-contain object-left brightness-0 invert"
            />
          </Link>
          <SheetTitle className="sr-only">Site navigation</SheetTitle>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-6"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <SheetClose asChild key={item.label}>
              <MarketingNavLink item={item} variant="mobile" />
            </SheetClose>
          ))}
        </nav>

        <p className="border-t border-white/15 px-5 py-4 text-xs text-[#AAFF47]/80">
          Electric mobility for Rwanda
        </p>
      </SheetContent>
    </Sheet>
  );
}
