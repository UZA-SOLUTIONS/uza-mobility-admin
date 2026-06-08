import Image from 'next/image';
import { brand } from '@/lib/marketing/colors';
import type { PublicPart } from '@/types/marketplace/public-part';

type PublicPartCardProps = {
  part: PublicPart;
};

function primaryPhoto(part: PublicPart) {
  return (
    part.photos.find((p) => p.isPrimary)?.url ?? part.photos[0]?.url ?? null
  );
}

export function PublicPartCard({ part }: PublicPartCardProps) {
  const imageUrl = primaryPhoto(part);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white">
      <div className="relative aspect-[318/212] w-full bg-[#f4f4f4]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={part.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 318px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#356769]">
            No photo
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 border-t border-[#E9E9E9] p-6">
        <h3 className="text-base font-semibold text-[#151515]">{part.name}</h3>
        <div className="flex items-center justify-between text-sm text-[#356769]">
          <span>{part.condition.replaceAll('_', ' ')}</span>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: brand.tealCard }}
          >
            {part.stockLabel}
          </span>
        </div>
        <p className="text-lg font-semibold text-[#151515]">
          ${part.priceUsd.toLocaleString('en-US')}
        </p>
      </div>
    </article>
  );
}
