import { brand } from '@/lib/marketing/colors';
import { marketingContainer } from '@/lib/marketing/layout-classes';

type MarketingPageHeroProps = {
  title: string;
  description?: string;
};

export function MarketingPageHero({
  title,
  description,
}: MarketingPageHeroProps) {
  return (
    <section
      className="flex min-h-[280px] w-full items-end md:min-h-[320px]"
      style={{ backgroundColor: brand.forest }}
    >
      <div className={`${marketingContainer} pt-24 pb-10 sm:pt-28 sm:pb-12`}>
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-[42px]">
            {title}
          </h1>
          {description ? (
            <p className="text-base text-white/90 md:text-lg">{description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
