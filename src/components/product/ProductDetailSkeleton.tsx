import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="container-luxury py-8 md:py-12 animate-fade-in">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-4 w-12 rounded" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-14 rounded" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-20 rounded" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-32 rounded" />
      </div>

      {/* Main Product Layout */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="relative aspect-[4/4.3] sm:aspect-square w-full rounded-3xl overflow-hidden border border-[#eadfd1]/70 bg-[#fbf9f6]">
            <Skeleton className="h-full w-full rounded-none" />
            <div className="absolute top-4 left-4">
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="absolute top-4 right-4">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          {/* Thumbnail Strip Skeleton */}
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-[#eadfd1]/60">
                <Skeleton className="h-full w-full rounded-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Info Skeleton */}
        <div className="flex flex-col space-y-6">
          {/* Category & Title */}
          <div>
            <Skeleton className="h-4 w-28 rounded-full mb-3" />
            <Skeleton className="h-10 w-4/5 rounded-lg mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <Skeleton className="h-9 w-32 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>

          {/* Short description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>

          {/* Sensory Highlight Cards Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3.5 rounded-2xl border border-[#eadfd1]/70 bg-[#fdfaf5] space-y-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>

          {/* Stock Status */}
          <Skeleton className="h-8 w-44 rounded-full" />

          {/* Quantity & CTA */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-2">
            <Skeleton className="h-13 w-32 rounded-full" />
            <Skeleton className="h-13 flex-1 rounded-full" />
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#eadfd1]/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
