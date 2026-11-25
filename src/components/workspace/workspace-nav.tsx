'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ElementType } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavGroup } from '@/config/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type WorkspaceNavProps = {
  navGroups: NavGroup[];
  rootHref: string;
  navLoading?: boolean;
  onNavigate?: () => void;
};

function isItemActive(
  href: string,
  pathname: string,
  rootHref: string,
): boolean {
  return (
    pathname === href ||
    (href !== rootHref && pathname.startsWith(`${href}/`))
  );
}

function groupContainsActive(
  group: NavGroup,
  pathname: string,
  rootHref: string,
): boolean {
  return group.items.some((item) =>
    isItemActive(item.href, pathname, rootHref),
  );
}

function NavItemLink({
  href,
  label,
  icon: Icon,
  isActive,
  onNavigate,
  nested = false,
}: {
  href: string;
  label: string;
  icon?: ElementType;
  isActive: boolean;
  onNavigate?: () => void;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 rounded-lg text-sm transition-colors',
        nested ? 'px-2.5 py-2' : 'px-2.5 py-2.5',
        isActive
          ? 'bg-primary font-medium text-primary-foreground shadow-sm'
          : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            'size-4 shrink-0',
            isActive ? 'text-primary-foreground' : 'text-sidebar-foreground/50',
          )}
          aria-hidden
        />
      ) : null}
      {label}
    </Link>
  );
}

function CollapsibleNavGroup({
  group,
  open,
  onOpenChange,
  hasActive,
  rootHref,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasActive: boolean;
  rootHref: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const label = group.label!;
  const GroupIcon = group.icon;

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="space-y-1">
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors',
          hasActive
            ? 'bg-primary/10 text-primary hover:bg-primary/15'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        )}
      >
        {GroupIcon ? (
          <GroupIcon
            className={cn(
              'size-4 shrink-0 transition-colors',
              hasActive ? 'text-primary' : 'text-sidebar-foreground/45',
            )}
            aria-hidden
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 opacity-60 transition-transform duration-200',
            open ? 'rotate-0' : '-rotate-90',
            hasActive && 'text-primary opacity-90',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <ul
          className={cn(
            'ml-4 space-y-1 border-l py-1 pl-3',
            hasActive ? 'border-primary/40' : 'border-sidebar-border',
          )}
        >
          {group.items.map((item) => {
            const isActive = isItemActive(item.href, pathname, rootHref);

            return (
              <li key={item.href}>
                <NavItemLink
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  onNavigate={onNavigate}
                  nested
                />
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WorkspaceNav({
  navGroups,
  rootHref,
  navLoading = false,
  onNavigate,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const activeByLabel = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const group of navGroups) {
      if (!group.label) continue;
      map[group.label] = groupContainsActive(group, pathname, rootHref);
    }
    return map;
  }, [navGroups, pathname, rootHref]);

  /** Session-only: collapsed by default; stays open after expand/visit until closed. */
  const [openByLabel, setOpenByLabel] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenByLabel((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const group of navGroups) {
        if (!group.label) continue;
        if (activeByLabel[group.label] && next[group.label] !== true) {
          next[group.label] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [navGroups, activeByLabel]);

  if (navLoading) {
    return (
      <div className="space-y-2 px-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1.5 p-3">
      {navGroups.map((group) => {
        const isCollapsible =
          group.collapsible !== false && Boolean(group.label);

        if (!isCollapsible) {
          return (
            <ul key={group.label ?? 'main'} className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = isItemActive(item.href, pathname, rootHref);

                return (
                  <li key={item.href}>
                    <NavItemLink
                      href={item.href}
                      label={item.label}
                      icon={item.icon ?? group.icon}
                      isActive={isActive}
                      onNavigate={onNavigate}
                    />
                  </li>
                );
              })}
            </ul>
          );
        }

        const hasActive = activeByLabel[group.label!] ?? false;
        const open = openByLabel[group.label!] ?? false;

        return (
          <CollapsibleNavGroup
            key={group.label}
            group={group}
            open={open}
            onOpenChange={(next) =>
              setOpenByLabel((prev) => ({ ...prev, [group.label!]: next }))
            }
            hasActive={hasActive}
            rootHref={rootHref}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        );
      })}
    </nav>
  );
}
