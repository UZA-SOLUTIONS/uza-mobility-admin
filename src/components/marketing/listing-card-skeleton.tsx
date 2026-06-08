import { Skeleton } from '@/components/ui/skeleton';

export function ListingCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#E9E9E9] bg-white">
      <Skeleton className="aspect-[318/212] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 border-t border-[#E9E9E9] p-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 border-y border-[#E9E9E9] py-4">
          <Skeleton className="mx-auto h-10 w-14" />
          <Skeleton className="mx-auto h-10 w-14" />
          <Skeleton className="mx-auto h-10 w-14" />
        </div>
        <div className="flex items-end justify-between gap-2 pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  );
}
