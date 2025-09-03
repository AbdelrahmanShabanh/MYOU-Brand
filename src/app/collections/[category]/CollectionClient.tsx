"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { FiFilter, FiSortAsc, FiSortDesc, FiTag } from "react-icons/fi";

interface CollectionClientProps {
  products: Product[];
  categoryTitle: string;
}

type SortOption = "newest" | "oldest" | "price-low" | "price-high" | "discount";

export default function CollectionClient({
  products,
  categoryTitle,
}: CollectionClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showDiscountedOnly, setShowDiscountedOnly] = useState(false);

  // Get max price for price range slider
  const maxPrice = Math.max(...products.map((p) => p.price));

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply discount filter
    if (showDiscountedOnly) {
      filtered = filtered.filter(
        (product) => product.discount && product.discount > 0
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
    }

    return filtered;
  }, [products, sortBy, priceRange, showDiscountedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h1 className="text-4xl font-bold mb-4 lg:mb-0">{categoryTitle}</h1>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="newest">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range: LE {priceRange[0]} - LE {priceRange[1]}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) =>
                    setPriceRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Discount Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="discountedOnly"
                checked={showDiscountedOnly}
                onChange={(e) => setShowDiscountedOnly(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="discountedOnly" className="text-sm text-gray-700">
                Show discounted items only
              </label>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setPriceRange([0, maxPrice]);
                  setShowDiscountedOnly(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6 text-sm text-gray-600">
        Showing {filteredAndSortedProducts.length} of {products.length} products
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products match your filters.</p>
          <button
            onClick={() => {
              setPriceRange([0, maxPrice]);
              setShowDiscountedOnly(false);
            }}
            className="mt-2 text-pink-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              {...product}
              id={product._id}
              stock={product.stock}
              sizes={product.sizes}
              sizeStock={product.sizeStock}
              discount={product.discount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
