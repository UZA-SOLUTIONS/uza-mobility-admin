'use client';

import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { resendVerificationByEmail } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api';
import { authRoutes } from '@/config/routes';

type CheckEmailFormProps = {
  email: string;
};

export function CheckEmailForm({ email }: CheckEmailFormProps) {
  const resend = useMutation({
    mutationFn: () => resendVerificationByEmail(email),
  });

  return (
    <AuthFormCard>
      <PageHeader
        title="Check your email"
        description={
          email
            ? `We sent a verification link to ${email}. Open it to activate your account, then sign in.`
            : 'We sent a verification link to your email. Open it to activate your account, then sign in.'
        }
      />
      {email ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={resend.isPending}
          onClick={() => resend.mutate()}
        >
          {resend.isPending ? 'Sending…' : 'Resend verification email'}
        </Button>
      ) : null}
      {resend.isSuccess ? (
        <p className="text-sm text-primary">{resend.data.message}</p>
      ) : null}
      {resend.isError ? (
        <p className="text-sm text-destructive">
          {resend.error instanceof ApiClientError
            ? resend.error.message
            : 'Unable to resend verification email.'}
        </p>
      ) : null}
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
