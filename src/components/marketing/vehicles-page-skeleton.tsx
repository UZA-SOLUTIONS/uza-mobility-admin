import { Skeleton } from '@/components/ui/skeleton';
import { ListingGridSkeleton } from '@/components/marketing/listing-grid-skeleton';
import { brand } from '@/lib/marketing/colors';
import { marketingContainer } from '@/lib/marketing/layout-classes';

export function VehiclesPageSkeleton() {
  return (
    <>
      <section
        className="flex min-h-[350px] w-full items-end"
        style={{ backgroundColor: brand.forest }}
        aria-hidden
      >
        <div className={`${marketingContainer} pt-24 pb-10 sm:pt-28 sm:pb-12`}>
          <Skeleton className="h-10 w-48 bg-white/20" />
        </div>
      </section>
      <div className="bg-white" aria-busy aria-label="Loading vehicles">
        <div className={`${marketingContainer} py-10 sm:py-14 lg:py-[60px]`}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-[52px] flex-1 rounded" />
            <Skeleton className="h-12 w-full max-w-[247px] rounded" />
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <Skeleton className="hidden h-[520px] w-full shrink-0 rounded-lg lg:block lg:w-72" />
            <div className="min-w-0 flex-1">
              <ListingGridSkeleton
                count={9}
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
