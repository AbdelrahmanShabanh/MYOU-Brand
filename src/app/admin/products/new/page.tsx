"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiX } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "",
    discount: "",
    featured: false,
    features: "",
    shippingInfo: "",
    shippingCost: "",
    sizes: [] as string[],
    hasSizes: false,
    sizeStock: {} as Record<string, number>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          }/api/categories`
        );
        if (!res.ok) throw new Error("Failed to fetch categories");
        setCategories(await res.json());
      } catch {
        // Optionally handle error
      }
    }
    fetchCategories();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];

    try {
      const formData = new FormData();
      // Add up to 4 images
      for (let i = 0; i < Math.min(files.length, 4); i++) {
        formData.append("images", files[i]);
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/upload/multiple`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      uploaded.push(
        ...data.files.map(
          (file: { url: string; public_id: string }) => file.url
        )
      );
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Error uploading images: " + errorMessage);
    } finally {
      setImages((prev) => [...prev, ...uploaded].slice(0, 4));
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
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

    // Features validation
    const featuresArr = formData.features
      ? formData.features
          .split(/,|\n/)
          .map((f) => f.trim())
          .filter(Boolean)
      : [];
    if (featuresArr.length < 3) {
      newErrors.features = "Please enter at least 3 features.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Send to backend
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            images: images.length ? images : undefined,
            category: formData.category,
            stock: Number(formData.stock),
            discount: formData.discount ? Number(formData.discount) : 0,
            featured: formData.featured,
            features: formData.features
              ? formData.features
                  .split(/,|\n/)
                  .map((f) => f.trim())
                  .filter(Boolean)
              : undefined,
            sizes: formData.hasSizes ? formData.sizes : undefined,
            sizeStock: formData.hasSizes ? formData.sizeStock : undefined,
            shippingInfo: formData.shippingInfo || undefined,
            shippingCost: formData.shippingCost
              ? Number(formData.shippingCost)
              : undefined,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to create product");
      router.push("/admin/products");
    } catch (err) {
      alert("Error creating product: " + (err as Error).message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add New Product
        </h1>
        <Link
          href="/admin/products"
          className="flex items-center px-4 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          <FiX className="mr-2" />
          Cancel
        </Link>
      </div>

      <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
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
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="mt-2">
              <a
                href="/admin/categories"
                className="text-sm text-pink-600 hover:underline"
              >
                Manage Categories
              </a>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
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
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Size Options
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasSizes"
                    name="hasSizes"
                    checked={formData.hasSizes}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label
                    htmlFor="hasSizes"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    This product has different sizes
                  </label>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Check this box if customers need to select a size when
                  purchasing this product. If unchecked, the product will be
                  treated as "One Size" and no size selection will be shown.
                </p>

                {formData.hasSizes && (
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600 dark:text-gray-400">
                      Available Sizes (check all that apply):
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Note: Selecting &quot;One Size&quot; will automatically
                      clear other size selections.
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        "XS",
                        "S",
                        "M",
                        "L",
                        "XL",
                        "XXL",
                        "XXXL",
                        "One Size",
                      ].map((size) => (
                        <label
                          key={size}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={formData.sizes.includes(size)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                {
                                  /* If "One Size" is selected, clear other sizes */
                                }
                                if (size === "One Size") {
                                  setFormData((prev) => ({
                                    ...prev,
                                    sizes: ["One Size"],
                                  }));
                                } else {
                                  {
                                    /* If selecting a regular size, remove "One Size" */
                                  }
                                  setFormData((prev) => ({
                                    ...prev,
                                    sizes: [
                                      ...prev.sizes.filter(
                                        (s) => s !== "One Size"
                                      ),
                                      size,
                                    ],
                                  }));
                                }
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  sizes: prev.sizes.filter((s) => s !== size),
                                }));
                              }
                            }}
                            className="text-pink-600 rounded border-gray-300 focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {size}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.sizes.length === 0 && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Please select at least one size
                      </p>
                    )}

                    {/* Size-based Stock Input */}
                    {formData.sizes.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stock per Size
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Set the stock quantity for each available size
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {formData.sizes.map((size) => (
                            <div key={size} className="space-y-1">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                {size} Stock
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={formData.sizeStock[size] || ""}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : parseInt(e.target.value);
                                  setFormData((prev) => ({
                                    ...prev,
                                    sizeStock: {
                                      ...prev.sizeStock,
                                      [size]: value,
                                    },
                                  }));
                                }}
                                className="px-3 py-2 w-full text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="discount"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
              <label
                htmlFor="featured"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
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

            <div className="md:col-span-2">
              <label
                htmlFor="image"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Image URL
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {uploading && (
                <p className="mt-1 text-xs text-gray-500">Uploading...</p>
              )}
              <div className="flex gap-2 mt-2">
                {images
                  .filter((img) => typeof img === "string" && img.trim() !== "")
                  .map((img, idx) => (
                    <Image
                      key={idx}
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-20 h-20 rounded-md border"
                    />
                  ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to use a placeholder image
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="features"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Features (comma or line separated)
              </label>
              <textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows={2}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="e.g. UV Protection, Fast Dry, Zipper"
              />
              {errors.features && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.features}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="shippingInfo"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Shipping Info
              </label>
              <input
                type="text"
                id="shippingInfo"
                name="shippingInfo"
                value={formData.shippingInfo}
                onChange={handleChange}
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="e.g. Delivered in 2-3 days"
              />
            </div>

            <div>
              <label
                htmlFor="shippingCost"
                className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Shipping Cost (LE)
              </label>
              <input
                type="number"
                id="shippingCost"
                name="shippingCost"
                value={formData.shippingCost}
                onChange={handleChange}
                min="0"
                className="px-4 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700"
            >
              <FiSave className="mr-2" />
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
