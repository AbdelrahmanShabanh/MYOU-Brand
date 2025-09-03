import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }) {
  const resolvedParams =
    typeof params.then === "function" ? await params : params;
  const { id } = resolvedParams;
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    }/api/products/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    return <div className="py-12 text-center">Product not found.</div>;
  }
  const product = await res.json();
  return <ProductDetailClient product={product} />;
}
