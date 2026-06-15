import type { ReactNode } from 'react';

type AuthFormCardProps = {
  children: ReactNode;
};

/**
 * Auth forms sit on a light card over a photo hero. When `next-themes` applies
 * `.dark` from system preference, inherited `text-foreground` becomes light
 * on white — invisible in production. `auth-surface` resets theme tokens locally.
 */
export function AuthFormCard({ children }: AuthFormCardProps) {
  return (
    <div className="auth-surface w-full rounded-2xl border border-[#E9E9E9] bg-white p-4 sm:p-5">
      {children}
    </div>
  );
}
