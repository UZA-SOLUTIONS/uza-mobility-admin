import { Suspense } from 'react';
import { Login } from '@/components/auth/login';
import { Spinner } from '@/components/ui/spinner';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      }
    >
      <Login />
    </Suspense>
  );
}
