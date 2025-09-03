export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-200 animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-md bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="mt-2 h-6 w-1/4 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Size Selection Skeleton */}
          <div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="grid grid-cols-6 gap-2">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-10 bg-gray-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Features Skeleton */}
          <div className="border-t border-b py-4">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="space-y-2">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 w-full bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Shipping Info Skeleton */}
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />

          {/* Description Skeleton */}
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="space-y-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 w-full bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="space-y-3">
            <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
} 