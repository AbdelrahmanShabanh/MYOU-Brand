import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { notFound } from "next/navigation";
import CollectionClient from "./CollectionClient";
import { Product } from "@/types";

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Fetch categories from API to validate dynamic categories
async function getCategories() {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/api/categories`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((cat: any) =>
      cat.name.toLowerCase().replace(/\s+/g, "-")
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Check if category exists in database
async function isValidCategory(category: string): Promise<boolean> {
  const validCategories = await getCategories();
  return validCategories.includes(category);
}

type GenerateMetadataProps = {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: {
  params: GenerateMetadataProps["params"];
}): Promise<Metadata> {
  const resolvedParams = (await Promise.resolve(params)) || { category: "" };
  const isValid = await isValidCategory(resolvedParams.category);

  if (!isValid) {
    return {
      title: "Category Not Found - MYOU",
      description: "The requested category could not be found.",
    };
  }

  const categoryTitle = capitalizeFirstLetter(resolvedParams.category);

  return {
    title: `${categoryTitle} Collection - MYOU`,
    description: `Explore our ${categoryTitle} collection at MYOU - Modest Fashion Store`,
  };
}

type PageProps = {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({
  params,
}: {
  params: PageProps["params"];
}) {
  const resolvedParams = (await Promise.resolve(params)) || { category: "" };
  const { category } = resolvedParams;

  const isValid = await isValidCategory(category);
  if (!isValid) {
    notFound();
  }

  // Fetch products from backend API
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    }/api/products?category=${category}`,
    {
      cache: "no-store",
    }
  );
  const products: Product[] = await res.json();
  const categoryTitle = capitalizeFirstLetter(category);

  return <CollectionClient products={products} categoryTitle={categoryTitle} />;
}
