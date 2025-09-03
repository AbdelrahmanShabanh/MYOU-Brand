"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiSettings,
  FiPackage,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/store/slices/uiSlice";
import { toggleWishlist } from "@/store/slices/wishlistSlice";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { hydrateCart } from "@/store/slices/cartSlice";
import { useCategories } from "@/hooks/useCategories";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartHydrated = useAppSelector((state) => state.cart.isHydrated);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated } = useAuth();
  const { categories, loading, error } = useCategories();

  // Hydrate cart on client side
  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  // helper function to convert category name to URL-friendly slug
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // إنشاء روابط التنقل من الفئات الديناميكية
  const navLinks = categories.map((category) => ({
    href: `/collections/${createSlug(category.name)}`,
    label: category.name,
  }));

  return (
    <header className="fixed top-0 right-0 left-0 z-40 bg-white shadow-sm">
      <nav className="px-4 mx-auto max-w-7xl h-16 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-pink-600">
            <Image
              src="/icons/myoulog.png"
              alt="MYOU"
              width={60}
              height={60}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {loading ? (
              // Loading skeleton for categories
              <div className="flex space-x-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-4 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              // Fallback navigation if categories fail to load
              <div className="flex space-x-8">
                <Link
                  href="/collections/scarves"
                  className="text-sm font-medium text-gray-600 hover:text-pink-600"
                >
                  Scarves
                </Link>
                <Link
                  href="/collections/kimonos"
                  className="text-sm font-medium text-gray-600 hover:text-pink-600"
                >
                  Kimonos
                </Link>
                <Link
                  href="/collections/burkini"
                  className="text-sm font-medium text-gray-600 hover:text-pink-600"
                >
                  Burkini
                </Link>
              </div>
            ) : (
              // Dynamic categories from database
              navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center text-sm font-medium text-gray-600 hover:text-pink-600"
              >
                <FiSettings className="mr-1 w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/track-order"
              className="p-2 text-gray-600 hover:text-pink-600"
              title="Track Order"
            >
              <FiPackage className="w-6 h-6" />
            </Link>
            <button
              onClick={() => dispatch(toggleWishlist())}
              className="relative p-2 text-gray-600 hover:text-pink-600"
            >
              <FiHeart className="w-6 h-6" />
              {cartHydrated && wishlistItems.length > 0 && (
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-4 h-4 text-xs text-white bg-pink-600 rounded-full">
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 text-gray-600 hover:text-pink-600"
              data-cart-icon
            >
              <FiShoppingBag className="w-6 h-6" />
              {cartHydrated && cartItems.length > 0 && (
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-4 h-4 text-xs text-white bg-pink-600 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <Link
                href="/auth/signin"
                className="p-2 text-gray-600 hover:text-pink-600"
              >
                <FiUser className="w-6 h-6" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="p-2 text-gray-600 hover:text-pink-600"
              >
                <FiUser className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden bg-white border-t border-gray-200 shadow-md md:hidden"
            >
              <div className="py-2">
                {loading ? (
                  // Loading skeleton for mobile menu
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="mx-4 h-4 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ) : error ? (
                  // Fallback navigation for mobile if categories fail to load
                  <>
                    <Link
                      href="/collections/scarves"
                      className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Scarves
                    </Link>
                    <Link
                      href="/collections/kimonos"
                      className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Kimonos
                    </Link>
                    <Link
                      href="/collections/burkini"
                      className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Burkini
                    </Link>
                  </>
                ) : (
                  // Dynamic categories for mobile menu
                  navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))
                )}
                <Link
                  href="/track-order"
                  className="block flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiPackage className="mr-2 w-4 h-4" />
                  Track Order
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FiSettings className="mr-2 w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;
