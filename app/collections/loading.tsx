import { ProductSkeleton } from '@/components/ProductSkeleton';

export default function CollectionsLoading() {
  return (
    <div className="py-16 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
