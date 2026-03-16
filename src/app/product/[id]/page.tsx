"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleCart } from "@/store/slices/uiSlice";
import { FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { CartItem, Product } from "@/types";

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("S");

  // Parse ID param cleanly
  const productId = Array.isArray(resolvedParams.id)
    ? resolvedParams.id[0]
    : resolvedParams.id;

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "/api"}/api/products/${productId}`,
        );
        if (!res.ok) {
          if (res.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch product details.");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-b-2 border-pink-600 animate-spin"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Product Not Found
        </h2>
        <p className="mb-8 text-gray-600">
          {error || "The product you requested might have been removed."}
        </p>
        <Link
          href="/"
          className="px-6 py-2 font-medium text-white bg-pink-600 rounded-md transition-colors hover:bg-pink-700"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Handle single image parsing as heavily requested
  const mainImage =
    product.image ||
    (product.images && product.images.length > 0 ? product.images[0] : "");
  const isSoldOut =
    typeof product.stock === "number"
      ? product.stock === 0
      : product.countInStock === 0;

  let finalPrice = product.price;
  if (product.discount && product.discount > 0) {
    finalPrice = product.price - (product.price * product.discount) / 100;
  }

  const handleAddToCart = () => {
    if (isSoldOut) return;

    dispatch(
      addToCart({
        id: product._id || product.id || productId || "",
        name: product.name,
        price: finalPrice, // Correct final pricing
        image: mainImage,
        quantity: 1,
        // Optional typing compliance handling
        size: selectedSize,
      } as CartItem),
    );
    dispatch(toggleCart());
  };

  const handleCheckout = () => {
    if (isSoldOut) return;

    dispatch(
      addToCart({
        id: product._id || product.id || productId || "",
        name: product.name,
        price: finalPrice,
        image: mainImage,
        quantity: 1,
        size: selectedSize,
      } as CartItem),
    );
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-sm text-gray-500 transition-colors hover:text-pink-600"
        >
          <FiArrowLeft className="mr-2 w-4 h-4" />
          Back to Shopping
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Main Image View */}
          <div className="relative aspect-[3/4] w-full max-w-lg mx-auto overflow-hidden rounded-2xl bg-white border border-gray-100">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full text-gray-400">
                No Image Available
              </div>
            )}
            {isSoldOut && (
              <div className="flex absolute inset-0 justify-center items-center bg-black/40">
                <span className="px-6 py-2 text-lg font-bold tracking-wider text-white bg-black/80 rounded-full">
                  SOLD OUT
                </span>
              </div>
            )}
            {product.discount && product.discount > 0 ? (
              <div className="absolute top-4 left-4 pt-1">
                <span className="px-3 py-1 text-sm font-bold tracking-wider text-white bg-red-600 rounded-full shadow-lg">
                  {product.discount}% OFF
                </span>
              </div>
            ) : null}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex items-center mb-6 space-x-4">
              {product.discount && product.discount > 0 ? (
                <>
                  <span className="text-xl font-medium text-gray-500 line-through">
                    LE {product.price.toFixed(2)}
                  </span>
                  <span className="text-3xl font-bold text-pink-600">
                    LE {finalPrice.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  LE {product.price.toFixed(2)}
                </span>
              )}
            </div>

            <div className="pt-6 mb-8 border-t border-gray-200">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Description
              </h3>
              <p className="leading-relaxed text-gray-600">
                {product.description ||
                  "No detailed description provided for this item."}
              </p>
            </div>

            <div className="mb-8 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Category</span>
                <span className="font-medium text-gray-900 capitalize">
                  {product.category}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500">Availability</span>
                <span
                  className={`font-medium ${isSoldOut ? "text-red-600" : "text-green-600"}`}
                >
                  {isSoldOut ? "Out of Stock" : "In Stock"}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-medium text-gray-900">Size</h3>
              <div className="flex flex-wrap gap-3">
                {(product.sizes && product.sizes.length > 0
                  ? product.sizes
                  : ["S", "M", "L", "XL", "One Size"]
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border ${
                      selectedSize === size
                        ? "border-pink-600 bg-pink-50 text-pink-600"
                        : "border-gray-200 text-gray-700 hover:border-pink-600"
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`flex items-center justify-center flex-1 px-6 py-4 text-lg font-medium transition-all transform rounded-xl border-2 ${
                  isSoldOut
                    ? "bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed hidden"
                    : "border-pink-600 text-pink-600 hover:bg-pink-50:bg-pink-900/20"
                }`}
              >
                <FiShoppingBag className="mr-2 w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isSoldOut}
                className={`flex items-center justify-center flex-1 px-6 py-4 text-lg font-medium text-white transition-all transform rounded-xl ${
                  isSoldOut
                    ? "bg-gray-400 cursor-not-allowed w-full"
                    : "bg-pink-600 hover:bg-pink-700 hover:scale-[1.02] shadow-xl shadow-pink-200"
                }`}
              >
                {isSoldOut ? "Currently Sold Out" : "Checkout Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
