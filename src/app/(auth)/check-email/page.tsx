import { CheckEmailForm } from '@/components/auth/check-email-form';

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email = '' } = await searchParams;

  return <CheckEmailForm email={email} />;
}
