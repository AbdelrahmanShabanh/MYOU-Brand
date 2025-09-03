"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProduct } from "@/store/slices/productsSlice";
import { FiSave, FiX } from "react-icons/fi";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function EditProductPage({ params }: PageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products?.items || []);
  const resolvedParams = use(params);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    discount: "",
    featured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        console.log("🔄 Fetching product data for ID:", resolvedParams.id);
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const url = `${apiUrl}/api/products/${resolvedParams.id}`;

        console.log("📡 API URL:", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API Error:", res.status, errorText);
          throw new Error(
            `Failed to fetch product: ${res.status} ${errorText}`
          );
        }

        const product = await res.json();
        console.log("✅ Product data received:", product);

        // Reset form data with fresh product data
        const freshFormData = {
          name: product.name || "",
          description: product.description || "",
          price: product.price ? product.price.toString() : "",
          image: product.image || "",
          category: product.category || "",
          stock: product.stock ? product.stock.toString() : "",
          discount: product.discount ? product.discount.toString() : "",
          featured: !!product.featured,
        };

        console.log("🔄 Setting form data:", freshFormData);
        setFormData(freshFormData);

        // Clear any previous errors
        setErrors({});
      } catch (err: any) {
        console.error("❌ Error fetching product:", err);
        setError(err.message || "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    }

    if (resolvedParams.id) {
      fetchProduct();
    }
  }, [resolvedParams.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.stock) {
      newErrors.stock = "Stock is required";
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = "Stock must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Submitting updated product data:", formData);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const url = `${apiUrl}/api/products/${resolvedParams.id}`;

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image || "/images/products/placeholder.jpg",
        category: formData.category,
        stock: Number(formData.stock),
        discount: formData.discount ? Number(formData.discount) : 0,
        featured: formData.featured,
      };

      console.log("📡 Sending update to:", url);
      console.log("📦 Update data:", updateData);

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Update failed:", res.status, errorText);
        throw new Error(`Failed to update product: ${res.status} ${errorText}`);
      }

      const updatedProduct = await res.json();
      console.log("✅ Product updated successfully:", updatedProduct);

      // Update Redux store with fresh data
      dispatch(
        updateProduct({
          id: updatedProduct._id,
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          image: updatedProduct.image,
          category: updatedProduct.category,
          stock: updatedProduct.stock,
        })
      );

      // Redirect to products list
      router.push("/admin/products");
    } catch (err: any) {
      console.error("❌ Error updating product:", err);
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Add refresh function to manually refetch product data
  const handleRefresh = () => {
    if (resolvedParams.id) {
      setLoading(true);
      setError(null);
      // Force refetch by calling the effect again
      window.location.reload();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formDataData = new FormData();
    formDataData.append("image", file);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataData,
        }
      );
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
    } catch (err) {
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <Link
          href="/admin/products"
          className="flex items-center px-4 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          <FiX className="mr-2" />
          Cancel
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
                  errors.category
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">Select a category</option>
                <option value="Scarves">Scarves</option>
                <option value="Kimonos">Kimonos</option>
                <option value="Hijabs">Hijabs</option>
                <option value="Shawls">Shawls</option>
                <option value="Abayas">Abayas</option>
                <option value="Accessories">Accessories</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
                  errors.price
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
                  errors.stock
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.stock}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="discount"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Featured Product
              </label>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white ${
                  errors.description
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="image"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Product Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              />
              {uploading && (
                <p className="text-xs text-gray-500 mt-1">Uploading...</p>
              )}
              {(imagePreview || formData.image) && (
                <img
                  src={imagePreview || formData.image}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-md border"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
            >
              <FiSave className="mr-2" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="ml-2 flex items-center px-4 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Refresh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
