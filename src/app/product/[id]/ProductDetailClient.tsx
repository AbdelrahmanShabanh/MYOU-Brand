"use client";
import { useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { CartItem, Product } from "@/types";
import { FiShoppingBag, FiTruck, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import { useRandomProducts } from "@/hooks/useRandomProducts";

const sizes = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "XXXL", label: "XXXL" },
];

const fallbackImage = "/images/products/placeholder.jpg";
const fallbackFeatures = [
  "UV Protection",
  "Fast Dry Technology",
  "Performance Zipper for Water Sport",
];

interface ProductDetailClientProps {
  product: Product & {
    _id?: string;
    features?: string[];
    images?: string[];
    shippingInfo?: string;
  };
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState(
    product.images && product.images.length > 0 && product.images[0]
      ? product.images[0]
      : product.image || fallbackImage
  );
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // Fetch random products for recommendations (excluding current product)
  const {
    products: randomProducts,
    loading: randomProductsLoading,
    error: randomProductsError,
  } = useRandomProducts(product._id || product.id, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    dispatch(
      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        size: selectedSize,
        quantity: 1,
      } as CartItem)
    );
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <>
      <div className="px-4 py-16 mx-auto mt-16 max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="overflow-hidden relative bg-gray-100 rounded-lg aspect-square">
              <Image
                src={mainImage || fallbackImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {(product.images || [product.image || fallbackImage])
                .filter((img) => typeof img === "string" && img.trim() !== "")
                .map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(image)}
                    className={`aspect-square relative rounded-md overflow-hidden ${
                      mainImage === image ? "ring-2 ring-pink-500" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <p className="mt-2 text-2xl font-semibold text-pink-600 dark:text-pink-500">
                LE {product.price?.toFixed(2)}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Size
                </h3>
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="flex gap-2 items-center px-4 py-2 text-sm font-medium text-pink-600 bg-pink-100 rounded-full transition-colors duration-300 hover:bg-pink-200 dark:bg-pink-900/30 dark:hover:bg-pink-900/50 dark:text-pink-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  View Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => {
                      setSelectedSize(size.value);
                      setSizeError(false);
                    }}
                    className={`py-2 px-4 text-sm font-medium rounded-full border 
                      ${
                        selectedSize === size.value
                          ? "border-pink-600 bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-500"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                  Please select a size before proceeding
                </p>
              )}
            </div>

            {/* Features */}
            <div className="py-4 border-t border-b dark:border-gray-700">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Features
              </h3>
              <ul className="space-y-2">
                {(product.features && product.features.length > 0
                  ? product.features
                  : fallbackFeatures
                ).map((feature: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-center text-gray-600 dark:text-gray-400"
                  >
                    <span className="mr-2 w-2 h-2 bg-pink-600 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <FiTruck className="mr-2" />
              <span>
                {product.shippingInfo && product.shippingInfo.trim() !== ""
                  ? product.shippingInfo
                  : "Shipping information not available."}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-line dark:text-gray-400">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex justify-center items-center px-4 py-3 w-full font-medium text-white bg-pink-600 rounded-full transition-colors duration-300 hover:bg-pink-700"
              >
                <FiShoppingBag className="mr-2" />
                Add to Cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className="px-4 py-3 w-full font-medium text-pink-600 rounded-full border border-pink-600 transition-colors duration-300 hover:bg-pink-50 dark:text-pink-500 dark:hover:bg-pink-900/20"
              >
                Buy Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeChart && (
          <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-6 mx-4 w-full max-w-sm bg-white rounded-lg dark:bg-gray-800"
            >
              <button
                onClick={() => setShowSizeChart(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
              <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                Size Guide
              </h2>
              <div className="relative w-[300px] h-[300px] mx-auto">
                <Image
                  src="/icons/WOMEN-WEBSITE-SIZE-CHARTai-copy_2048x2048.png"
                  alt="Size Chart"
                  fill
                  className="object-contain"
                  priority
                  sizes="100px"
                />
              </div>
              <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                For the best fit, please measure yourself and compare with the
                size chart above. If you&apos;re between sizes, we recommend
                choosing the larger size.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* You May Also Like Section */}
      <div className="pt-12 mt-24 border-t border-gray-200 dark:border-gray-700">
        <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 dark:text-white">
          You May Also Like
        </h2>
        {randomProductsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading recommendations...
            </span>
          </div>
        ) : randomProductsError ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Unable to load recommendations at the moment.</p>
            <p className="text-sm mt-2">Please try again later.</p>
          </div>
        ) : randomProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 px-4 mx-auto max-w-6xl sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {randomProducts.map((product) => (
              <div className="w-full max-w-[250px] mx-auto" key={product._id}>
                <ProductCard
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  image={
                    product.image ||
                    (product.images && product.images[0]) ||
                    "/images/products/placeholder.jpg"
                  }
                  isSoldOut={product.isSoldOut}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No recommendations available at the moment.</p>
            <p className="text-sm mt-2">Check back later for new products!</p>
          </div>
        )}
      </div>
    </>
  );
}
