"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/store/slices/uiSlice";
import {
  updateCartItemQuantity,
  removeFromCart,
  updateCartItemSize,
} from "@/store/slices/cartSlice";
import Image from "next/image";
// import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import { CartItemSkeleton } from "./LoadingSkeleton";
import { useRouter } from "next/navigation";
import { Product } from "@/types";

// Temporary icon replacements
const FiX = () => <span className="text-xl">✕</span>;
const FiPlus = () => <span className="text-xl">+</span>;
const FiMinus = () => <span className="text-xl">−</span>;
const FiTrash2 = () => <span className="text-xl">🗑</span>;
const FiShoppingBag = () => <span className="text-xl">🛍</span>;

const Cart = () => {
  const dispatch = useAppDispatch();
  const { cartOpen } = useAppSelector((state) => state.ui);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSizes, setEditingSizes] = useState<{ [key: string]: boolean }>({});
  const [productDetails, setProductDetails] = useState<{ [key: string]: Product }>({});
  const router = useRouter();

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalShipping = cartItems.reduce(
    (sum, item) => sum + (item.shippingCost || 0) * item.quantity,
    0
  );

  // Check if all items have sizes
  const allItemsHaveSizes = cartItems.every(
    (item) => item.size && item.size.trim() !== ""
  );

  useEffect(() => {
    // Simulate loading time
    if (cartOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cartOpen]);

  // Fetch product details for items with sizes
  useEffect(() => {
    if (cartOpen && cartItems.length > 0) {
      cartItems.forEach(item => {
        if (!productDetails[item.id]) {
          fetchProductDetails(item.id);
        }
      });
    }
  }, [cartOpen, cartItems]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        dispatch(toggleCart());
      }
    };

    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cartOpen, dispatch]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateCartItemQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleSizeChange = (id: string, newSize: string) => {
    dispatch(updateCartItemSize({ id, size: newSize }));
    setEditingSizes(prev => ({ ...prev, [id]: false }));
  };

  const toggleSizeEditing = (id: string) => {
    setEditingSizes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch product details for size options
  const fetchProductDetails = async (productId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/products/${productId}`
      );
      if (response.ok) {
        const product = await response.json();
        setProductDetails(prev => ({ ...prev, [productId]: product }));
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const handleCheckout = () => {
    if (!allItemsHaveSizes) {
      alert("Please ensure all items have sizes selected before checkout.");
      return;
    }
    dispatch(toggleCart());
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => dispatch(toggleCart())}
          />

          {/* Cart Panel */}
          <motion.div
            ref={cartRef}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 w-full sm:w-96 h-full bg-white 
                     shadow-2xl z-50 overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-pink-50 to-white">
                <div className="flex items-center space-x-3">
                  <FiShoppingBag
                    className="text-pink-600"
                    size={24}
                  />
                  <h2 className="text-xl font-bold text-gray-900">
                    Your Cart
                  </h2>
                </div>
                <button
                  onClick={() => dispatch(toggleCart())}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-gray-500" size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-5">
                {isLoading ? (
                  <div className="space-y-5">
                    {[...Array(3)].map((_, index) => (
                      <CartItemSkeleton key={index} />
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FiShoppingBag
                        className="text-gray-400"
                        size={32}
                      />
                    </div>
                    <p className="text-lg font-medium text-gray-500">
                      Your cart is empty
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Add some items to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-20 h-20 rounded-md overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                            priority
                          />
                        </div>
                                                  <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)}
                            </p>
                            
                            {/* Size Display and Selection */}
                            <div className="mt-2">
                              {editingSizes[item.id] ? (
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-600">
                                    Select Size:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {productDetails[item.id]?.sizes?.map((size) => (
                                      <button
                                        key={size}
                                        onClick={() => handleSizeChange(item.id, size)}
                                        className={`px-2 py-1 text-xs font-medium rounded border transition-colors
                                          ${
                                            item.size === size
                                              ? "bg-pink-600 text-white border-pink-600"
                                              : "bg-white text-gray-700 border-gray-300 hover:border-pink-300"
                                          }`}
                                      >
                                        {size}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    onClick={() => toggleSizeEditing(item.id)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    Size: {item.size || "Not selected"}
                                  </p>
                                  {productDetails[item.id]?.sizes && productDetails[item.id].sizes.length > 0 && (
                                    <button
                                      onClick={() => toggleSizeEditing(item.id)}
                                      className="text-xs text-pink-600 hover:text-pink-700 underline"
                                    >
                                      Change
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          <div className="flex items-center mt-2">
                            <div className="flex items-center bg-gray-100 rounded-full">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1.5 text-gray-600 hover:text-pink-600 transition-colors"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="mx-2 text-sm font-medium text-gray-900 w-6 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1.5 text-gray-600 hover:text-pink-600 transition-colors"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="ml-3 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-5 bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-medium text-gray-700">
                    Subtotal
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-medium text-gray-700">
                    Shipping
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    LE {totalShipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-6 pb-2 border-b border-gray-200">
                  <span className="text-xl font-bold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-pink-600">
                    LE {(total + totalShipping).toFixed(2)}
                  </span>
                </div>

                {!allItemsHaveSizes && cartItems.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please ensure all items have sizes selected before
                      checkout.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={!allItemsHaveSizes}
                  className={`w-full py-3 px-4 rounded-full transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02]
                    ${
                      allItemsHaveSizes
                        ? "bg-pink-600 hover:bg-pink-700 text-white"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                >
                  {allItemsHaveSizes ? "Checkout" : "Select Sizes Required"}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  Secure checkout • Free shipping • 30-day returns
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
