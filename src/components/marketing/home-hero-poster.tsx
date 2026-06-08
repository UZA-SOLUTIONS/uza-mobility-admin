import Image from 'next/image';
import { HERO_SECTION_POSTER_SRC } from '@/lib/marketing/hero-assets';
import { cn } from '@/lib/utils';

type HomeHeroPosterProps = {
  className?: string;
  priority?: boolean;
};

export function HomeHeroPoster({
  className,
  priority = false,
}: HomeHeroPosterProps) {
  return (
    <Image
      src={HERO_SECTION_POSTER_SRC}
      alt=""
      fill
      priority={priority}
      className={cn('object-cover object-center', className)}
      sizes="100vw"
    />
  );
}
