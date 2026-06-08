import Link from 'next/link';
import { HomeHeroMedia } from '@/components/marketing/home-hero-media';
import { HomeHeroOverlay } from '@/components/marketing/home-hero-overlay';
import { brand } from '@/lib/marketing/colors';
import { marketingContainer } from '@/lib/marketing/layout-classes';

export function HomeHero() {
  return (
    <section className="relative flex h-[clamp(520px,min(55.5vw,90vh),800px)] w-full items-end overflow-hidden">
      <div className="absolute inset-0 z-0" aria-hidden>
        <HomeHeroMedia />
        <HomeHeroOverlay />
      </div>
      <div
        className={`relative z-10 ${marketingContainer} pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20`}
      >
        <div className="max-w-xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Electric Mobility, Delivered.
            </h1>
            <p className="max-w-xl text-lg text-white/95">
              Trusted sourcing, verified logistics, and complete energy
              infrastructure.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand.lime, color: brand.forest }}
          >
            Browse Vehicles
          </Link>
        </div>
      </div>
    </section>
  );
}
