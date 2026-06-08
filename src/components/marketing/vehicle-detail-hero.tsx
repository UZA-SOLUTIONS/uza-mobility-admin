import { HomeHeroOverlay } from '@/components/marketing/home-hero-overlay';
import { VehicleDetailHeroMedia } from '@/components/marketing/vehicle-detail-hero-media';
import { listingSubtitle } from '@/lib/marketing/listing-display';
import {
  getListingPhotos,
  resolveListingVideoUrl,
} from '@/lib/marketing/listing-detail';
import { resolveMediaUrl } from '@/lib/marketing/listing-display';
import { brand } from '@/lib/marketing/colors';
import { marketingPageX } from '@/lib/marketing/layout-classes';
import type { PublicListing } from '@/types/marketplace/public-listing';

type VehicleDetailHeroProps = {
  listing: PublicListing;
};

const HERO_MEDIA_CLASS =
  'pointer-events-none absolute top-1/2 left-1/2 z-0 h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center';

export function VehicleDetailHero({ listing }: VehicleDetailHeroProps) {
  const photos = getListingPhotos(listing);
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  const imageUrl = resolveMediaUrl(primary?.url ?? null);
  const videoUrl = resolveListingVideoUrl(listing);

  return (
    <section className="relative h-[min(650px,85vh)] w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ backgroundColor: brand.forest }}
        aria-hidden
      >
        <VehicleDetailHeroMedia
          posterUrl={imageUrl}
          videoUrl={videoUrl}
          mediaClassName={HERO_MEDIA_CLASS}
        />
        <HomeHeroOverlay />
      </div>

      <div
        className={`relative z-10 flex h-full items-end justify-center ${marketingPageX} pt-24 pb-10 sm:pt-28 sm:pb-16`}
      >
        <div className="max-w-3xl space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            {listing.listingTitle}
          </h1>
          <p className="text-lg text-white/95">{listingSubtitle(listing)}</p>
        </div>
      </div>
    </section>
  );
}
