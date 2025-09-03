"use client";

import Hero from "@/components/Hero";
import CollectionGrid from "@/components/CollectionGrid";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/products?featured=true`
        );
        if (!res.ok) throw new Error("Failed to fetch featured products");
        setProducts(await res.json());
      } catch (err) {
        console.error("Fetch error:", err);
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
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            {...product}
            id={product._id}
            images={product.images}
            stock={product.stock}
            isSoldOut={product.stock === 0}
            discount={product.discount}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <FeaturedProducts />
      <CollectionGrid />
    </main>
  );
}
