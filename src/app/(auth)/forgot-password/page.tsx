import Link from 'next/link';
import { AuthFormCard } from '@/components/auth/auth-form-card';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  return (
    <AuthFormCard>
      <PageHeader
        title="Forgot password"
        description="We will send reset instructions when this flow is connected to the API."
      />
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" />
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthFormCard>
  );
}
