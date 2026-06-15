'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { authInputClassName } from '@/components/auth/auth-styles';

type AuthPasswordInputProps = React.ComponentProps<typeof Input>;

export function AuthPasswordInput({
  className,
  ...props
}: AuthPasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn(authInputClassName, 'pr-10', className)}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#356769]/75 transition-colors hover:text-[#356769]"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}
