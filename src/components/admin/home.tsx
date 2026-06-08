'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminNav } from '@/hooks/admin-nav';

export function AdminHome() {
  const { flatItems, hasOverview } = useAdminNav();

  const modules = flatItems.filter(
    (item) => item.href !== '/admin' || !hasOverview,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Choose a module from the sidebar or the shortcuts below."
      />

      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No modules are available for your role. Contact an administrator if
          you need access.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((item) => (
            <Card key={item.href}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <Link href={item.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
