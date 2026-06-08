import { ListingCardSkeleton } from '@/components/marketing/listing-card-skeleton';

type ListingGridSkeletonProps = {
  count?: number;
  className?: string;
};

export function ListingGridSkeleton({
  count = 4,
  className = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4',
}: ListingGridSkeletonProps) {
  return (
    <div className={className} aria-busy aria-label="Loading vehicles">
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
