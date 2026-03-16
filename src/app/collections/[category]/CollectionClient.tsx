"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

interface CollectionClientProps {
  category: string;
}

export default function CollectionClient({ category }: CollectionClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/products?category=${category}`
        );
        if (!res.ok) {
          throw new Error("Failed to load products");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const displayCategory = category.replace(/-/g, " ").toUpperCase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-b-2 border-pink-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{displayCategory} COLLECTION</h1>
        <p className="mt-2 text-gray-600">
          Showing {products.length} {products.length === 1 ? "result" : "results"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No products found in this collection.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              id={product._id || product.id || ""} 
              name={product.name} 
              price={product.price} 
              image={product.image || (product.images && product.images[0]) || ''} 
              discount={product.discount} 
              isSoldOut={product.stock === 0} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
