'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { useForgotPassword } from '@/queries/auth';
import { ApiClientError } from '@/lib/api';
import { authRoutes } from '@/config/routes';

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    forgot.mutate(values, {
      onSuccess: (response) => {
        form.setError('root', {
          type: 'success',
          message: response.message,
        });
      },
      onError: (error) => {
        const message =
          error instanceof ApiClientError
            ? error.message
            : 'Unable to send reset instructions. Please try again.';
        form.setError('root', { message });
      },
    });
  });

  const rootMessage = form.formState.errors.root?.message;
  const isSuccess = form.formState.errors.root?.type === 'success';

  return (
    <AuthFormCard>
      <PageHeader
        title="Forgot password"
        description="Enter your staff email and we will send you a link to reset your password."
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
        {rootMessage ? (
          <p
            className={
              isSuccess ? 'text-sm text-primary' : 'text-sm text-destructive'
            }
          >
            {rootMessage}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={forgot.isPending}>
          {forgot.isPending ? 'Sending…' : 'Send reset link'}
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
