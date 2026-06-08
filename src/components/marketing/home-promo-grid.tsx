import Image from 'next/image';
import Link from 'next/link';
import { brand } from '@/lib/marketing/colors';
import { marketingContainer } from '@/lib/marketing/layout-classes';

function PromoCard({
  title,
  description,
  cta,
  href,
  imageSrc,
  imageAlt,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <div
      className="flex min-h-[283px] flex-1 overflow-hidden rounded-lg"
      style={{ backgroundColor: brand.tealCard }}
    >
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-8">
        <div className="space-y-4">
          <h3 className="text-2xl leading-tight font-semibold text-white md:text-4xl">
            {title}
          </h3>
          <p className="text-base leading-relaxed text-white/95">
            {description}
          </p>
        </div>
        <Link
          href={href}
          className="mt-6 inline-flex h-10 w-fit items-center justify-center rounded-full px-8 text-sm font-semibold"
          style={{ backgroundColor: brand.lime, color: brand.forest }}
        >
          {cta}
        </Link>
      </div>
      <div className="relative hidden w-[210px] shrink-0 sm:block">
        <Image src={imageSrc} alt={imageAlt} fill className="object-fill" />
      </div>
    </div>
  );
}

export function HomePromoGrid() {
  return (
    <section
      className="py-12 sm:py-20"
      style={{ backgroundColor: brand.forest }}
    >
      <div
        className={`${marketingContainer} flex flex-col gap-6 md:flex-row md:gap-10`}
      >
        <PromoCard
          title="Buy for Your Business"
          description="Electrify your delivery service, taxi association, or corporate fleet with bulk pricing and dedicated support."
          cta="Discover more"
          href="/about"
          imageSrc="/images/discover-more-img.png"
          imageAlt="Business vehicles"
        />
        <PromoCard
          title="Keep It Moving"
          description="Drive with confidence. We supply verified replacement parts, batteries, and charging stations for every vehicle we sell."
          cta="Find Accessories"
          href="/vehicles"
          imageSrc="/images/accessories-image.png"
          imageAlt="Accessories and spare parts"
        />
      </div>
    </section>
  );
}
