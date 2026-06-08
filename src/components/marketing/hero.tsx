import Link from 'next/link';
import { Button } from '@/components/ui/button';

type HeroProps = {
  title: string;
  description: string;
};

export function Hero({ title, description }: HeroProps) {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-20 text-center md:py-28">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/register">Browse EVs</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/for-business">View pricing</Link>
        </Button>
      </div>
    </section>
  );
}
