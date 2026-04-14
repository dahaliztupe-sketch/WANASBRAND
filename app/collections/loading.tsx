import { ProductGridSkeleton } from '@/components/Skeletons';

export default function CollectionsLoading() {
  return (
    <div className="py-32 px-6 max-w-[1400px] mx-auto w-full">
      <ProductGridSkeleton />
    </div>
  );
}
