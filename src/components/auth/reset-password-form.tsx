'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth';
import { useResetPassword } from '@/queries/auth';
import { ApiClientError } from '@/lib/api';
import { authRoutes } from '@/config/routes';

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const reset = useResetPassword();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    reset.mutate(values, {
      onSuccess: (response) => {
        form.setError('root', {
          type: 'success',
          message: `${response.message} You can now sign in.`,
        });
      },
      onError: (error) => {
        const message =
          error instanceof ApiClientError
            ? error.message
            : 'Unable to reset password. Please try again.';
        form.setError('root', { message });
      },
    });
  });

  const rootMessage = form.formState.errors.root?.message;
  const isSuccess = form.formState.errors.root?.type === 'success';

  if (!token.trim()) {
    return (
      <AuthFormCard>
        <PageHeader
          title="Reset password"
          description="This reset link is invalid. Request a new one from the forgot password page."
        />
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={authRoutes.forgotPassword}
            className="underline-offset-4 hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard>
      <PageHeader
        title="Reset password"
        description="Choose a new password for your admin account."
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" {...form.register('token')} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
        {rootMessage ? (
          <p
            className={
              isSuccess ? 'text-sm text-primary' : 'text-sm text-destructive'
            }
          >
            {rootMessage}
          </p>
        ) : null}
        <Button
          type="submit"
          className="w-full"
          disabled={reset.isPending || isSuccess}
        >
          {reset.isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href={authRoutes.login}
          className="underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </AuthFormCard>
  );
}
