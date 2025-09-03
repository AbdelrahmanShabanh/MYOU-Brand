"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";

interface PromoCode {
  _id: string;
  code: string;
  discountAmount: number;
  discountType: "percentage" | "fixed";
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  currentUses: number;
  minOrderAmount: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    discountAmount: "",
    discountType: "percentage" as "percentage" | "fixed",
    validFrom: "",
    validUntil: "",
    maxUses: "",
    minOrderAmount: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/promocodes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch promocodes");
      const data = await res.json();
      setPromoCodes(data);
    } catch (error) {
      console.error("Error fetching promocodes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingCode
        ? `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/promocodes/${editingCode._id}`
        : `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/promocodes`;

      const res = await fetch(url, {
        method: editingCode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          discountAmount: Number(formData.discountAmount),
          maxUses: formData.maxUses ? Number(formData.maxUses) : null,
          minOrderAmount: Number(formData.minOrderAmount),
        }),
      });

      if (!res.ok) throw new Error("Failed to save promocode");

      setShowForm(false);
      setEditingCode(null);
      resetForm();
      fetchPromoCodes();
    } catch (error) {
      console.error("Error saving promocode:", error);
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    setFormData({
      code: promoCode.code,
      discountAmount: promoCode.discountAmount.toString(),
      discountType: promoCode.discountType,
      validFrom: new Date(promoCode.validFrom).toISOString().split("T")[0],
      validUntil: new Date(promoCode.validUntil).toISOString().split("T")[0],
      maxUses: promoCode.maxUses?.toString() || "",
      minOrderAmount: promoCode.minOrderAmount.toString(),
      description: promoCode.description || "",
      isActive: promoCode.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promocode?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/promocodes/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete promocode");
      fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promocode:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountAmount: "",
      discountType: "percentage",
      validFrom: "",
      validUntil: "",
      maxUses: "",
      minOrderAmount: "",
      description: "",
      isActive: true,
    });
  };

  const getStatusColor = (promoCode: PromoCode) => {
    const now = new Date();
    const validUntil = new Date(promoCode.validUntil);

    if (!promoCode.isActive) return "bg-gray-100 text-gray-800";
    if (now > validUntil) return "bg-red-100 text-red-800";
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses)
      return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (promoCode: PromoCode) => {
    const now = new Date();
    const validUntil = new Date(promoCode.validUntil);

    if (!promoCode.isActive) return "Inactive";
    if (now > validUntil) return "Expired";
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses)
      return "Max Uses Reached";
    return "Active";
  };

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-6 w-1/4 h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <div className="mb-4 w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Promo Codes
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCode(null);
              resetForm();
            }}
            className="flex items-center px-4 py-2 text-white bg-pink-600 rounded-lg transition-colors hover:bg-pink-700"
          >
            <FiPlus className="mr-2 w-4 h-4" />
            Add Promo Code
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
            <div className="p-6 w-full max-w-md bg-white rounded-lg dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                {editingCode ? "Edit Promo Code" : "Add Promo Code"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountAmount: e.target.value,
                        })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value as
                            | "percentage"
                            | "fixed",
                        })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Uses (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    rows={3}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Active
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-pink-600 rounded-md transition-colors hover:bg-pink-700"
                  >
                    {editingCode ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingCode(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded-md transition-colors hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Promo Codes Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promoCodes.map((promoCode) => (
            <div
              key={promoCode._id}
              className="p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {promoCode.code}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {promoCode.discountType === "percentage"
                      ? `${promoCode.discountAmount}% off`
                      : `LE ${promoCode.discountAmount} off`}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor( promoCode )}`}
                >
                  {getStatusText(promoCode)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>Min Order: LE {promoCode.minOrderAmount}</p>
                <p>
                  Valid Until:{" "}
                  {new Date(promoCode.validUntil).toLocaleDateString()}
                </p>
                <p>
                  Used: {promoCode.currentUses}
                  {promoCode.maxUses ? ` / ${promoCode.maxUses}` : ""}
                </p>
                {promoCode.description && (
                  <p className="text-gray-500 dark:text-gray-400">
                    {promoCode.description}
                  </p>
                )}
              </div>

              <div className="flex mt-4 space-x-2">
                <button
                  onClick={() => handleEdit(promoCode)}
                  className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700"
                >
                  <FiEdit className="inline mr-1 w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(promoCode._id)}
                  className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-md transition-colors hover:bg-red-700"
                >
                  <FiTrash2 className="inline mr-1 w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {promoCodes.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No promo codes found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
