import { Button } from '@/components/ui/button';
import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';

type AuthPrimaryButtonProps = React.ComponentProps<typeof Button>;

export function AuthPrimaryButton({
  className,
  ...props
}: AuthPrimaryButtonProps) {
  return (
    <Button
      className={cn(
        'h-10 w-full rounded-full border-0 text-sm font-semibold text-white hover:opacity-90',
        className,
      )}
      style={{ backgroundColor: brand.forest }}
      {...props}
    />
  );
}
