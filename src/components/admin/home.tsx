'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminNav } from '@/hooks/admin-nav';
import { adminRoutes } from '@/config/routes';
import { cn } from '@/lib/utils';

export function AdminHome() {
  const { groups, hasOverview } = useAdminNav();

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.href !== adminRoutes.root || !hasOverview,
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin"
        description="Jump into a module you have access to."
      />

      {visibleGroups.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No modules are available for your role. Contact an administrator if
          you need access.
        </p>
      ) : (
        visibleGroups.map((group) => (
          <section key={group.label ?? 'modules'} className="space-y-3">
            {group.label ? (
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {group.label}
              </h2>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block focus-visible:outline-none"
                  >
                    <Card className="h-full transition-colors group-hover:border-primary/30 group-hover:bg-muted/30">
                      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                        {Icon ? (
                          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" aria-hidden />
                          </span>
                        ) : null}
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={cn(
                            'text-sm text-muted-foreground',
                            'group-hover:text-foreground/80',
                          )}
                        >
                          Open {item.label.toLowerCase()}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
