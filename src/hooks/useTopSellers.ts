import { useState, useEffect } from "react";

export interface TopSeller {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
  product: {
    _id: string;
    name: string;
    images?: string[];
    image?: string;
    price: number;
    description?: string;
  };
}

// hook لجلب المنتجات الأكثر مبيعاً
export const useTopSellers = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopSellers = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching top sellers from API...");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/public/top-sellers`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch top sellers");
      }

      const data = await res.json();
      console.log("Top sellers API response:", data);
      setTopSellers(data);
    } catch (err: unknown) {
      console.error("Error fetching top sellers:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellers();
  }, []);

  return { topSellers, loading, error, refetch: fetchTopSellers };
};
