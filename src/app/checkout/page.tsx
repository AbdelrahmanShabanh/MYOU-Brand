"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCartBackend, clearCart } from "@/store/slices/cartSlice";
import { FiCheck, FiDollarSign, FiGift, FiMail, FiPhone } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const { user } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shippingMethod] = useState("express");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showSuccess) {
          router.push("/");
        }
        if (showError) {
          setShowError(false);
        }
      }
    };

    if (showSuccess || showError) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showSuccess, showError, router]);

  // Debug modal state changes
  useEffect(() => {
    console.log(
      "Modal state changed - showSuccess:",
      showSuccess,
      "showError:",
      showError
    );
  }, [showSuccess, showError]);

  if (cartItems.length === 0) {
    return null;
  }

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full border-b-2 border-pink-600 animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 50; // Fixed shipping cost
  const total = subtotal + shipping - discount;

  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // التحقق من صحة رقم الهاتف
  const validatePhone = (phone: string) => {
    // Egyptian phone number validation
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid Egyptian phone number";
    }

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponError("");
      setCouponSuccess("");

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/promocodes/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: coupon.trim(),
            orderAmount: subtotal,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.message || "Error applying coupon");
        return;
      }

      setAppliedCoupon(coupon.trim());
      setDiscount(data.discount);
      setCouponSuccess(
        `Coupon applied successfully! Discount: LE ${data.discount.toFixed(2)}`
      );
      setCoupon("");
    } catch {
      setCouponError("Server connection error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the refund and exchange policies");
      return;
    }

    setIsSubmitting(true);

    try {
      // Map cart items to order items with productId
      const items = cartItems.map((item) => ({
        productId: item.id, // Use id as productId since CartItem doesn't have productId
        quantity: item.quantity,
        price: item.price,
      }));

      // Allow guest checkout: userId is optional
      const orderBody: {
        items: typeof items;
        contact: string;
        email: string;
        phone: string;
        country: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        postalCode: string;
        shippingMethod: string;
        paymentMethod: string;
        coupon: string;
        discount: number;
        subtotal: number;
        shipping: number;
        total: number;
        userId?: string;
      } = {
        items,
        contact: email, // Send email as contact
        email: email, // Also send as email for backend
        phone: `+2${phone}`, // Add +2 prefix to phone number
        country,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        shippingMethod,
        paymentMethod,
        coupon: appliedCoupon,
        discount,
        subtotal,
        shipping,
        total,
      };

      if (user && user.id) {
        orderBody.userId = user.id;
      }

      const token = isClient ? localStorage.getItem("token") : null;

      console.log("Submitting order:", orderBody);
      console.log(
        "API URL:",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      );

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/public`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderBody),
        }
      );

      console.log("Order response status:", res.status);

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.message || "Unknown error occurred");
        setShowError(true);
        return;
      }

      // Get the order data to confirm it was created
      const orderData = await res.json();
      console.log("Order created successfully:", orderData);
      console.log("Order ID:", orderData._id);

      console.log("Order successful! Setting showSuccess to true");

      // Clear cart after successful order (for both guest and authenticated users)
      if (user && user.id) {
        // Clear backend cart for authenticated users
        dispatch(clearCartBackend(user.id));
      }

      // Clear local cart state for all users
      dispatch(clearCart());

      // Show success modal after 4 seconds
      console.log("Order successful! Will show success modal in 4 seconds");
      setTimeout(() => {
        console.log("About to set showSuccess to true");
        setShowSuccess(true);
        console.log("showSuccess state set to true");
      }, 4000);

      // Set up redirect after modal is visible (10 seconds after modal shows)
      setTimeout(() => {
        // Redirect after 10 seconds to give users time to see the success message
        setTimeout(() => {
          router.push("/");
        }, 10000);
      }, 14000); // 4 seconds for modal + 10 seconds for display
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setErrorMessage(`Order failed: ${errorMessage}`);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Modal State */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 left-4 z-50 p-2 text-xs text-black bg-yellow-200 rounded">
          Modal State: {showSuccess ? "SHOWING" : "HIDDEN"}
          <button
            onClick={() => {
              console.log("Manual test button clicked");
              setShowSuccess(true);
              console.log("Manual setShowSuccess(true) called");
            }}
            className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Test Modal
          </button>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative p-8 mx-4 max-w-md text-center bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => router.push("/")}
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex relative justify-center items-center mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full animate-pulse-slow">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {/* Floating confetti elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-400 rounded-full animate-bounce"></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Order Submitted Successfully!
            </h3>
            <p className="mb-4 text-gray-600">
              We have sent a confirmation email to your inbox.
              <span className="font-semibold text-pink-600">
                {" "}
                Please check your spam emails
              </span>{" "}
              if you don&apos;t see it in your main inbox.
            </p>
            <p className="mb-4 text-sm text-gray-500">
              Thank you for choosing MYOU!
            </p>
            <div className="flex justify-center items-center mb-4 space-x-2 text-sm text-gray-500">
              <div className="w-4 h-4 rounded-full border-b-2 border-pink-600 animate-spin"></div>
              <span>Redirecting to home page in 10 seconds...</span>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full px-4 py-2 text-white bg-pink-600 rounded-md transition-colors hover:bg-pink-700 font-medium"
              >
                OK
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
                >
                  Go to Home Page Now
                </button>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md transition-colors hover:bg-gray-300"
                >
                  Stay Here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {showError && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50 animate-fadeIn"
          onClick={() => setShowError(false)}
        >
          <div
            className="relative p-8 mx-4 max-w-md text-center bg-white rounded-lg shadow-xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowError(false)}
              className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex relative justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full dark:bg-red-900">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Order Failed
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="px-4 py-2 w-full text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-gray-800">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-2xl font-bold text-pink-600 dark:text-pink-500"
              >
                <Image
                  src="/icons/myoulog.png"
                  alt="MYOU"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </Link>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-8 mx-auto max-w-5xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left: Form Sections */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative mt-1">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <FiMail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`pl-10 block w-full rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        errors.email
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative mt-1">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex">
                      <div className="flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-l-md border border-r-0 border-gray-300 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-400"></div>
                      <input
                        type="tel"
                        placeholder="010 1234 5678"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setPhone(value);
                        }}
                        required
                        className={`flex-1 block w-full rounded-r-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                          errors.phone
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="p-6 space-y-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Delivery
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Country/Region
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option>Egypt</option>
                    <option>UAE</option>
                    <option>Saudi Arabia</option>
                  </select>
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                      errors.firstName
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                      errors.lastName
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                    errors.address
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.address}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                      errors.city
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Postal code (optional)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="block mt-1 w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            {/* <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Shipping method
              </h2>
              <div className="space-y-2">
                <label className="flex items-center px-4 py-3 rounded-md border transition-all duration-150 cursor-pointer focus-within:ring-2 focus-within:ring-pink-500">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                    className="text-pink-600 form-radio"
                  />
                  <span className="flex-1 ml-3">
                    Egypt Express (est. 1-5 days)
                  </span>
                  <span className="font-semibold">
                    LE {shipping.toFixed(2)}
                  </span>
                </label>
                <label className="flex items-center px-4 py-3 rounded-md border transition-all duration-150 cursor-pointer focus-within:ring-2 focus-within:ring-pink-500">
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={shippingMethod === "free"}
                    onChange={() => setShippingMethod("free")}
                    className="text-pink-600 form-radio"
                  />
                  <span className="flex-1 ml-3">
                    Free Shipping (est. 7-14 days)
                  </span>
                  <span className="font-semibold">Free</span>
                </label>
              </div>
            </div> */}

            {/* Payment */}
            <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Payment
              </h2>
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="text-pink-600 form-radio"
                  />
                  <FiDollarSign className="mr-2 ml-2 text-pink-600" />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>

              {/* Custom message about other payment methods */}
              <div className="p-4 mt-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💳{" "}
                  <strong>Want to pay with Vodafone Cash or InstaPay?</strong>
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Contact us on WhatsApp: <strong>+20 107 083 1335</strong> or
                  on Instagram:{" "}
                  <a
                    href="https://www.instagram.com/m.you_brand?igsh=MXNzZDd3b3oxZHYxdw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-pink-600 hover:text-pink-500"
                  >
                    @m.you_brand
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
              />
              <label
                htmlFor="terms"
                className="ml-2 text-sm text-gray-600 dark:text-gray-400"
              >
                I agree to the{" "}
                <a href="#" className="text-pink-600 hover:text-pink-500">
                  refund and exchange policies
                </a>
              </label>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex justify-center items-center px-4 py-3 space-x-2 w-full font-medium text-white rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-b-2 border-white animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>Pay now</span>
                </>
              )}
            </button>
          </form>

          {/* Right: Order Summary */}
          <div className="p-6 bg-white rounded-lg shadow-lg lg:sticky lg:top-8">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="mb-6 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="overflow-hidden relative w-16 h-16 rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    LE {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            {/* Discount Coupon */}
            <form onSubmit={handleApplyCoupon} className="flex mb-4">
              <input
                type="text"
                placeholder="Discount code or gift card"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="flex-1 px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="px-4 font-medium text-gray-700 bg-gray-200 rounded-r-md transition-colors hover:bg-pink-600 hover:text-white"
              >
                Apply
              </button>
            </form>

            {/* Coupon Error Message */}
            {couponError && (
              <div className="mb-2 text-sm text-red-600">{couponError}</div>
            )}

            {/* Coupon Success Message */}
            {couponSuccess && (
              <div className="mb-2 text-sm text-green-600">{couponSuccess}</div>
            )}

            {appliedCoupon && (
              <div className="flex items-center mb-2 text-sm text-green-600">
                <FiGift className="mr-1" /> Coupon{" "}
                <b className="mx-1">{appliedCoupon}</b> applied!
              </div>
            )}
            <div className="pt-4 space-y-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">LE {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-lg font-bold text-gray-900">
                  LE {shipping.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span>- LE {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-medium border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-bold text-pink-600 dark:text-pink-500">
                  LE {total.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
              🔒 Secure checkout • 14-day returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
