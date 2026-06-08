'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/marketing/listing-display';
import { brand } from '@/lib/marketing/colors';
import type { PublicListingPhoto } from '@/types/marketplace/public-listing';

type VehicleDetailGalleryProps = {
  photos: PublicListingPhoto[];
  title: string;
  videoUrl?: string | null;
};

export function VehicleDetailGallery({
  photos,
  title,
  videoUrl,
}: VehicleDetailGalleryProps) {
  const resolved = photos
    .map((p) => ({ ...p, resolvedUrl: resolveMediaUrl(p.url) }))
    .filter((p): p is PublicListingPhoto & { resolvedUrl: string } =>
      Boolean(p.resolvedUrl),
    );

  const [index, setIndex] = useState(0);
  const current = resolved[index];
  const hasMultiple = resolved.length > 1;

  const prev = () => {
    if (resolved.length === 0) return;
    setIndex((i) => (i <= 0 ? resolved.length - 1 : i - 1));
  };

  const next = () => {
    if (resolved.length === 0) return;
    setIndex((i) => (i >= resolved.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E9E9E9] bg-[#f4f4f4]">
      <div className="relative aspect-[859/528] w-full">
        {current?.resolvedUrl ? (
          <Image
            src={current.resolvedUrl}
            alt={current.altText ?? title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 859px"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#356769]">
            No photos yet
          </div>
        )}

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
              style={{ color: brand.forest }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow"
              style={{ color: brand.forest }}
              aria-label="Next photo"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}

        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-3 inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium"
            style={{ backgroundColor: brand.lime, color: brand.forest }}
          >
            <Play className="size-4 fill-current" />
            Video
          </a>
        ) : null}
      </div>
    </div>
  );
}
