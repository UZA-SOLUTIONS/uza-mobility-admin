'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useLogin } from '@/queries/auth';
import { ApiClientError } from '@/lib/api';
import { authRoutes } from '@/config/routes';
import { signOutClient } from '@/lib/auth/sign-out-client';
import { useAppRouter } from '@/lib/navigation/use-app-router';

export function Login() {
  const login = useLogin();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useAppRouter();
  const signOutStarted = useRef(false);
  const shouldClearSession = searchParams.get('signout') === '1';

  useEffect(() => {
    if (
      !shouldClearSession ||
      status !== 'authenticated' ||
      signOutStarted.current
    ) {
      return;
    }

    signOutStarted.current = true;
    void (async () => {
      await signOutClient({ queryClient, redirect: false });
      router.replace(authRoutes.login);
      router.refresh();
    })();
  }, [queryClient, router, shouldClearSession, status]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onError: (error) => {
        const message =
          error instanceof ApiClientError
            ? error.message
            : 'Unable to sign in. Please try again.';
        form.setError('root', { message });
      },
    });
  });

  return (
    <AuthFormCard>
      <PageHeader
        title="Log in"
        description="Enter your credentials to access the dashboard."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        {form.formState.errors.root ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={authRoutes.forgotPassword}
          className="underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </AuthFormCard>
  );
}
