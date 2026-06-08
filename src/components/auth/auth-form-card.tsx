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
    <div className="auth-surface space-y-6 rounded-xl border border-white/40 bg-white/95 p-6 text-foreground shadow-xl backdrop-blur-sm">
      {children}
    </div>
  );
}
