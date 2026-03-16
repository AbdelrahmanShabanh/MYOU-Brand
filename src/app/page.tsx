"use client";

import Hero from "@/components/Hero";
import CollectionGrid from "@/components/CollectionGrid";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/products?featured=true`
        );
        if (!res.ok) throw new Error("Failed to fetch featured products");
        setProducts(await res.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading)
    return <div className="py-8 text-center">Loading featured products...</div>;
  if (error)
    return <div className="py-8 text-center text-red-600">{error}</div>;
  if (!products.length) return null;
  return (
    <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h2 className="mb-12 text-3xl font-bold text-center text-gray-900 dark:text-white">
        Featured Products
      </h2>
      <div className="flex overflow-x-auto gap-8 pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:snap-none hide-scrollbar">
        {products.map((product) => (
          <div key={product._id} className="min-w-[70vw] snap-center sm:min-w-0">
            <ProductCard
              {...product}
              id={product._id || product.id || ""}
              images={product.images}
              stock={product.stock}
              isSoldOut={product.stock === 0}
              discount={product.discount}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <FeaturedProducts />
      <CollectionGrid />
    </main>
  );
}
