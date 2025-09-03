import Link from "next/link";
import Image from "next/image";

import { useCategories } from "@/hooks/useCategories";
import { useTopSellers } from "@/hooks/useTopSellers";
import { Skeleton } from "./LoadingSkeleton";

const CollectionGrid = () => {
  const { categories, loading, error } = useCategories();
  const {
    topSellers,
    loading: topSellersLoading,
    error: topSellersError,
  } = useTopSellers();

  // helper function to convert category name to URL-friendly slug
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  if (loading) {
    return (
      <section
        id="collections"
        className="px-4 py-16 mx-auto max-w-7xl bg-white sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 px-4">
          Our Collections
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="collections"
        className="px-4 py-16 mx-auto max-w-7xl bg-white sm:px-6 lg:px-8"
      >
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 px-4">
          Our Collections
        </h2>
        <div className="text-center text-red-600">
          Failed to load collections. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section
      id="collections"
      className="px-4 py-16 mx-auto max-w-7xl bg-white sm:px-6 lg:px-8"
    >
      {/* Best Sellers Section */}
      <div className="mb-16">
        <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 px-4">
          Best Sellers
        </h2>

        {topSellersLoading && (
          <div className="text-center text-gray-600">
            Loading best sellers...
          </div>
        )}

        {topSellersError && (
          <div className="text-center text-red-600">
            Error loading best sellers: {topSellersError}
          </div>
        )}

        {!topSellersLoading && !topSellersError && topSellers.length === 0 && (
          <div className="text-center text-gray-600">
            No best sellers data available yet.
          </div>
        )}

        {!topSellersLoading && !topSellersError && topSellers.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3">
            {topSellers
              .filter(
                (topSeller) =>
                  topSeller &&
                  topSeller._id &&
                  topSeller.product &&
                  topSeller.product.name
              )
              .map((topSeller, index) => (
                <Link
                  key={topSeller._id}
                  href={`/product/${topSeller.product._id}`}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl 
                         transition-shadow duration-300 aspect-[3/4] bg-white block"
                >
                  {/* Badge for ranking */}
                  <div className="absolute top-2 left-2 z-20">
                    <div className="px-2 py-1 text-xs font-bold text-white bg-pink-600 rounded-full">
                      #{index + 1}
                    </div>
                  </div>

                  <Image
                    src={
                      topSeller.product.images?.[0] ||
                      topSeller.product.image ||
                      "/placeholder-product.jpg"
                    }
                    alt={topSeller.product.name || "Product"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/70" />
                  <div className="absolute right-0 bottom-0 left-0 p-3">
                    <h3 className="mb-1 text-sm font-semibold text-white">
                      {topSeller.product.name || "Product"}
                    </h3>
                    <div className="flex justify-between items-center text-white/80">
                      <p className="text-xs">
                        {topSeller.totalQuantity || 0} sold
                      </p>
                      <p className="text-xs font-semibold">
                        LE {(topSeller.product.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Collections Section */}
      <h2 className="mb-12 text-3xl font-bold text-center text-gray-900">
        Our Collections
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories
          .filter(
            (category) =>
              category && category._id && category.name && category.image
          )
          .map((category) => (
            <Link
              key={category._id}
              href={`/collections/${createSlug(category.name)}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl 
                     transition-shadow duration-300 aspect-[3/4] bg-white"
            >
              <Image
                src={category.image || "/placeholder-category.jpg"}
                alt={category.name || "Category"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t to-transparent from-black/70" />
              <div className="absolute right-0 bottom-0 left-0 p-6">
                <h3 className="text-2xl font-semibold text-white">
                  {category.name}
                </h3>
                <p className="mt-2 text-white/80">View Collection →</p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default CollectionGrid;
