import { useState, useEffect } from "react";

export interface HeroSlide {
  _id: string;
  image: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// hook لجلب بيانات السلايدر من API
export const useHeroSlider = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch hero slides");
      }

      const data = await res.json();
      setSlides(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return { slides, loading, error, refetch: fetchSlides };
};

