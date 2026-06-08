import { Skeleton } from '@/components/ui/skeleton';
import { ListingGridSkeleton } from '@/components/marketing/listing-grid-skeleton';
import { marketingContainer } from '@/lib/marketing/layout-classes';

export function HomePerfectFitSkeleton() {
  return (
    <section
      className="bg-white py-20"
      aria-busy
      aria-label="Loading categories"
    >
      <div className={marketingContainer}>
        <div className="mb-10 space-y-6">
          <Skeleton className="h-9 w-72 max-w-full" />
          <div className="flex flex-wrap gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-5 w-36" />
            ))}
          </div>
        </div>
        <ListingGridSkeleton count={4} />
        <div className="mt-6 flex gap-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    </section>
  );
}
