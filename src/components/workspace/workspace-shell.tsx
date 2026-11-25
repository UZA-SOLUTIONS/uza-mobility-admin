'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { AccountMenu } from '@/components/workspace/account-menu';
import { WorkspaceNav } from '@/components/workspace/workspace-nav';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { NavGroup } from '@/config/navigation';

type AccountUser = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePhoto?: string | null;
};

type WorkspaceShellProps = {
  children: React.ReactNode;
  navGroups: NavGroup[];
  /** Workspace root path used for exact active matching (e.g. `/admin`). */
  rootHref: string;
  navLoading?: boolean;
  accountUser?: AccountUser | null;
};

export function WorkspaceShell({
  children,
  navGroups,
  rootHref,
  navLoading = false,
  accountUser = null,
}: WorkspaceShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const brand = (
    <Link href={rootHref} className="relative block h-[40px] w-[118px]">
      <Image
        src="/images/FInal-logo-dashboard.png"
        alt="UZA Mobility"
        fill
        className="object-contain object-center"
        sizes="118px"
        priority
      />
    </Link>
  );

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-background">
      <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:w-64">
        <div className="shrink-0 border-b border-sidebar-border px-4 py-2">
          {brand}
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <WorkspaceNav
            navGroups={navGroups}
            rootHref={rootHref}
            navLoading={navLoading}
          />
        </ScrollArea>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs"
        >
          <SheetHeader className="border-b border-sidebar-border px-4 py-3 text-left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {brand}
          </SheetHeader>
          <ScrollArea className="h-[calc(100dvh-4.5rem)]">
            <WorkspaceNav
              navGroups={navGroups}
              rootHref={rootHref}
              navLoading={navLoading}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/60 px-4 backdrop-blur-sm lg:justify-end lg:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            <div className="text-primary">
              <NotificationBell />
            </div>
            {accountUser ? <AccountMenu user={accountUser} /> : null}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
          <div className="mx-auto w-full max-w-none px-4 py-4 lg:px-8 lg:py-6 xl:px-10 2xl:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
