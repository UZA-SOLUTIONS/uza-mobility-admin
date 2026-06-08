import { PublicPartCard } from '@/components/marketing/public-part-card';
import { browsePublicParts } from '@/lib/api/parts';
import { marketingContainer } from '@/lib/marketing/layout-classes';
import type { PublicPart } from '@/types/marketplace/public-part';

type SparePartsSectionAsyncProps = {
  q?: string;
  category?: string;
};

export async function SparePartsSectionAsync({
  q,
  category,
}: SparePartsSectionAsyncProps) {
  let parts: PublicPart[] = [];
  try {
    const result = await browsePublicParts({
      q,
      category,
      page: 1,
      limit: 48,
    });
    parts = result.items;
  } catch {
    parts = [];
  }

  return (
    <section className="bg-white py-16">
      <div className={marketingContainer}>
        {parts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {parts.map((part) => (
              <PublicPartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-[#E9E9E9] px-6 py-16 text-center text-[#356769]">
            No public spare parts are published yet.
          </p>
        )}
      </div>
    </section>
  );
}
