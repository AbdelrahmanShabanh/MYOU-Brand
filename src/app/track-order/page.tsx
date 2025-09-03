"use client";

import { useState } from "react";
import {
  FiSearch,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

export default function TrackOrderPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <FiClock className="w-6 h-6 text-yellow-500" />;
      case "paid":
        return <FiCheckCircle className="w-6 h-6 text-blue-500" />;
      case "shipped":
        return <FiTruck className="w-6 h-6 text-purple-500" />;
      case "delivered":
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case "cancelled":
        return <FiXCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FiPackage className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your order is being processed and will be confirmed soon.";
      case "paid":
        return "Payment received! Your order is being prepared for shipping.";
      case "shipped":
        return "Your order is on its way! You'll receive tracking information soon.";
      case "delivered":
        return "Your order has been delivered successfully!";
      case "cancelled":
        return "Your order has been cancelled. Please contact support if you have questions.";
      default:
        return "Order status is being updated.";
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setOrders([]);

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/public/track`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to track orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to track orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Track Your Orders
          </h1>
          <p className="text-lg text-gray-600">
            Enter your email address to track all your orders
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiSearch className="w-5 h-5 mr-2" />
                  Track Orders
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Found {orders.length} order{orders.length > 1 ? "s" : ""}
              </h2>
              <p className="text-gray-600">
                Here are all your orders with {email}
              </p>
            </div>

            {orders.map((order, index) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-pink-100">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Status Description */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">
                      {getStatusDescription(order.status)}
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Customer Information
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Name:</strong> {order.firstName}{" "}
                          {order.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.contact}
                        </p>
                        <p>
                          <strong>Phone:</strong> {order.phone}
                        </p>
                        <p>
                          <strong>Address:</strong> {order.address}
                        </p>
                        <p>
                          <strong>City:</strong> {order.city}, {order.country}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        Order Summary
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Payment Method:</strong> {order.paymentMethod}
                        </p>
                        <p>
                          <strong>Shipping Method:</strong>{" "}
                          {order.shippingMethod}
                        </p>
                        <p>
                          <strong>Subtotal:</strong> LE{" "}
                          {order.subtotal?.toFixed(2)}
                        </p>
                        <p>
                          <strong>Shipping:</strong> LE{" "}
                          {order.shipping?.toFixed(2)}
                        </p>
                        {order.discount > 0 && (
                          <p>
                            <strong>Discount:</strong> -LE{" "}
                            {order.discount?.toFixed(2)}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-pink-600">
                          <strong>Total:</strong> LE {order.total?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item: any, itemIndex: number) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FiPackage className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.productId?.name || "Product"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              LE {item.price?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
