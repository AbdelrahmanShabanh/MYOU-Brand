import { CollectionGridSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
      <CollectionGridSkeleton />
    </div>
  );
}
