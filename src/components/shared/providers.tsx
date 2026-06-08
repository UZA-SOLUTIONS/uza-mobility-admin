'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { SessionRefresh } from '@/components/auth/session';
import { NotificationSocketListener } from '@/components/notifications/notification-socket-listener';
import { NavigationProgress } from '@/components/shared/navigation-progress';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/lib/query/query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <QueryProvider>
        <SessionRefresh />
        <NotificationSocketListener />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NavigationProgress />
          {children}
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
