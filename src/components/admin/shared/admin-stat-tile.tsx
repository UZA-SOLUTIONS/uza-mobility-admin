import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AdminStatTileProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
  className?: string;
};

export function AdminStatTile({
  label,
  value,
  hint,
  icon,
  href,
  className,
}: AdminStatTileProps) {
  const content = (
    <Card
      className={cn(
        'border-l-2 border-l-primary transition-colors',
        href ? 'hover:bg-muted/40' : null,
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        {icon ? <div className="text-primary/80">{icon}</div> : null}
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus-visible:outline-none">
      {content}
    </Link>
  );
}
