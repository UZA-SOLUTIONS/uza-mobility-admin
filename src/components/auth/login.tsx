'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useForm, useFormState } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { AuthFieldError } from '@/components/auth/auth-field-error';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { AuthFormMessage } from '@/components/auth/auth-form-message';
import { AuthPageHeader } from '@/components/auth/auth-page-header';
import { AuthPasswordInput } from '@/components/auth/auth-password-input';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import {
  authFieldClassName,
  authFooterLinkClassName,
  authInputClassName,
  authLabelClassName,
} from '@/components/auth/auth-styles';
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
  const errorRef = useRef<HTMLDivElement>(null);
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
  const { errors } = useFormState({ control: form.control });

  const rootMessage =
    errors.root?.message ??
    (login.isError
      ? login.error instanceof ApiClientError
        ? login.error.message
        : 'Unable to sign in. Please try again.'
      : null);

  useEffect(() => {
    if (rootMessage) {
      errorRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [rootMessage]);

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors('root');
    login.reset();
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
      <div className="space-y-4">
        <AuthPageHeader
          title="Welcome back"
          description="Log in to access the admin dashboard"
        />

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-2.5">
            <div className={authFieldClassName}>
              <Label htmlFor="email" className={authLabelClassName}>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                className={authInputClassName}
                aria-invalid={Boolean(errors.email)}
                {...form.register('email')}
              />
              <AuthFieldError message={errors.email?.message} />
            </div>

            <div className={authFieldClassName}>
              <Label htmlFor="password" className={authLabelClassName}>
                Password
              </Label>
              <AuthPasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Enter password"
                aria-invalid={Boolean(errors.password)}
                {...form.register('password')}
              />
              <AuthFieldError message={errors.password?.message} />
            </div>

            <div className="flex justify-end">
              <Link
                href={authRoutes.forgotPassword}
                className="text-xs text-[#356769] hover:text-[#174438] sm:text-sm"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {rootMessage ? (
            <div ref={errorRef}>
              <AuthFormMessage variant="error" message={rootMessage} />
            </div>
          ) : null}

          <AuthPrimaryButton type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </AuthPrimaryButton>
        </form>

        <p className={authFooterLinkClassName}>
          Staff access only. Contact your administrator if you need an account.
        </p>
      </div>
    </AuthFormCard>
  );
}
