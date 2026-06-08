import { Skeleton } from '@/components/ui/skeleton';
import { marketingContainer } from '@/lib/marketing/layout-classes';

export function VehicleDetailHeroSkeleton() {
  return <Skeleton className="h-[min(650px,85vh)] w-full rounded-none" />;
}

export function VehicleDetailContentSkeleton() {
  return (
    <div
      className="bg-white py-14"
      aria-busy
      aria-label="Loading vehicle details"
    >
      <div className={marketingContainer}>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_429px]">
          <div className="space-y-5">
            <Skeleton className="aspect-[859/528] w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-[504px] w-full rounded-2xl" />
            <Skeleton className="h-[259px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
