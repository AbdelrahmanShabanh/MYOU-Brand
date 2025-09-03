"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/store/slices/cartSlice";
import { toggleCart } from "@/store/slices/uiSlice";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  stock?: number;
  sizes?: string[];
  isSoldOut?: boolean;
  discount?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  images,
  stock,
  sizes,
  isSoldOut,
  discount,
}: ProductCardProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === id);
  const productRef = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showSizeError, setShowSizeError] = useState(false);

  const mainImage = images && images.length > 0 ? images[0] : image;
  const validImage =
    mainImage && typeof mainImage === "string" && mainImage.trim() !== "";
  const soldOut = isSoldOut || stock === 0;
  const lowStock = !soldOut && typeof stock === "number" && stock <= 2;

  // Calculate discounted price if discount exists
  let finalPrice = price;
  if (discount && discount > 0) {
    finalPrice = price - (price * discount) / 100;
  }

  // const validImage =
  //   mainImage && typeof mainImage === "string" && mainImage.trim() !== "";

  const handleAddToCart = () => {
    if (soldOut) return;

    // Check if size is required and selected
    if (sizes && sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 3000);
      return;
    }

    // Create and animate the flying element
    const flyingElement = document.createElement("div");
    flyingElement.className = "fixed z-50 w-16 h-16";

    // Clone the product image
    const productImage = productRef.current?.querySelector("img");
    if (productImage) {
      const clone = productImage.cloneNode(true) as HTMLImageElement;
      clone.style.width = "100%";
      clone.style.height = "100%";
      clone.style.objectFit = "cover";
      flyingElement.appendChild(clone);
    }

    // Get the product position
    const productRect = productRef.current?.getBoundingClientRect();
    const cartIcon = document.querySelector("[data-cart-icon]");
    const cartRect = cartIcon?.getBoundingClientRect();

    if (productRect && cartRect) {
      // Set initial position
      flyingElement.style.left = `${productRect.left}px`;
      flyingElement.style.top = `${productRect.top}px`;

      // Add to DOM
      document.body.appendChild(flyingElement);

      // Animate to cart
      requestAnimationFrame(() => {
        flyingElement.style.transition = "all 0.5s ease-in-out";
        flyingElement.style.transform = `translate(${
          cartRect.left - productRect.left
        }px, ${cartRect.top - productRect.top}px) scale(0.1)`;
        flyingElement.style.opacity = "0";
      });

      // Clean up and dispatch actions
      setTimeout(() => {
        document.body.removeChild(flyingElement);
        dispatch(
          addToCart({
            id,
            name,
            price,
            image: mainImage,
            quantity: 1,
            size: selectedSize || "One Size", // Use selected size or default
          } as CartItem)
        );
        dispatch(toggleCart());
        setSelectedSize(""); // Reset size selection
      }, 500);
    }
  };

  const handleWishlistClick = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist({ id, name, price, image: mainImage }));
    }
  };

  const handleViewDetails = () => {
    if (soldOut) return;
    router.push(`/product/${String(id)}`);
  };

  return (
    <div ref={productRef} className="relative group">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {validImage ? (
          <Image
            src={mainImage}
            alt={name}
            fill
            className={`object-cover object-center transition-opacity ${
              soldOut ? "opacity-50" : "group-hover:opacity-75"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        {soldOut && (
          <div className="flex absolute inset-0 justify-center items-center">
            <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              Sold Out
            </span>
          </div>
        )}
        {lowStock && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-semibold">
              Low Stock
            </span>
          </div>
        )}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-1.5 rounded-full 
                     ${
                       isInWishlist
                         ? "bg-pink-100 text-pink-600"
                         : "bg-white/80 text-gray-600 hover:text-pink-600"
                     } 
                     transition-colors duration-200`}
        >
          <FiHeart
            className="w-4 h-4"
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="mt-2">
        <h3 className="text-xs font-medium text-gray-900 truncate sm:text-sm dark:text-gray-100">
          {name}
        </h3>
        {discount && discount > 0 ? (
          <div className="flex gap-2 items-center">
            <span className="text-xs font-medium text-gray-400 line-through sm:text-sm">
              LE {price.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-pink-600 sm:text-sm">
              LE {finalPrice.toFixed(2)}
            </span>
          </div>
        ) : (
          <p className="mt-0.5 text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
            LE {price.toFixed(2)}
          </p>
        )}
      </div>

      {/* Size Selection */}
      {sizes && sizes.length > 0 && !soldOut && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors
                  ${
                    selectedSize === size
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-pink-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
          {showSizeError && (
            <p className="mt-2 text-sm text-red-600">Please select a size</p>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          disabled={soldOut}
          className={`w-full px-4 py-3 text-sm font-medium rounded-full text-white 
                   flex items-center justify-center transition-colors duration-300 whitespace-nowrap
                   ${
                     soldOut
                       ? "bg-gray-400 cursor-not-allowed"
                       : "bg-pink-600 hover:bg-pink-700"
                   }`}
        >
          <FiShoppingBag className="flex-shrink-0 mr-2 w-4 h-4" />
          {soldOut ? "Sold Out" : "Add to Cart"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleViewDetails}
          disabled={soldOut}
          className={`w-full px-4 py-3 text-sm font-medium rounded-full border 
                   ${
                     soldOut
                       ? "text-gray-400 border-gray-300 cursor-not-allowed"
                       : "text-pink-600 border-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                   } 
                   whitespace-nowrap`}
        >
          {soldOut ? "Sold Out" : "View Details"}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductCard;
