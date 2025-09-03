import { useState, useEffect } from "react";

export interface RandomProduct {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  isSoldOut?: boolean;
}

export const useRandomProducts = (
  excludeProductId?: string,
  limit: number = 4
) => {
  const [products, setProducts] = useState<RandomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch if we have a valid limit
        if (limit <= 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/products/random?limit=${limit}&exclude=${
            excludeProductId || ""
          }`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch random products");
        }

        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching random products:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProducts();
  }, [excludeProductId, limit]);

  return { products, loading, error };
};
