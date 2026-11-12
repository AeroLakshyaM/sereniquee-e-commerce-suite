import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#eadfd1] bg-[#fdfaf5] dark:border-border dark:bg-card">
      <div className="aspect-[4/4.6] w-full sm:aspect-[4/4.5]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="flex flex-1 flex-col justify-between p-4 pt-3 sm:p-5 sm:pt-3.5">
        <div>
          <div className="flex justify-center gap-1.5">
            <Skeleton className="h-1.5 w-4 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-1.5 w-1.5 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-2/3 rounded" />
            <Skeleton className="h-3.5 w-1/3 rounded" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Skeleton className="h-6 w-16 rounded" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-7">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
