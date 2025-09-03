"use client";
import { useEffect, useState } from "react";
import { FiImage, FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

export default function AdminCategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "hero-slider">(
    "categories"
  );

  // Categories state
  const [categories, setCategories] = useState<
    { _id: string; name: string; image: string }[]
  >([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Category edit state
  const [editingCategory, setEditingCategory] = useState<{
    _id: string;
    name: string;
    image: string;
  } | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState<File | null>(null);
  const [editCategoryImagePreview, setEditCategoryImagePreview] = useState<
    string | null
  >(null);

  // Hero slider state
  const [heroSlides, setHeroSlides] = useState<
    {
      _id: string;
      image: string;
      title: string;
      subtitle: string;
      order: number;
      isActive: boolean;
    }[]
  >([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
  });
  const [selectedSlideImage, setSelectedSlideImage] = useState<File | null>(
    null
  );
  const [slideImagePreview, setSlideImagePreview] = useState<string | null>(
    null
  );

  // Hero slide edit state
  const [editingSlide, setEditingSlide] = useState<{
    _id: string;
    image: string;
    title: string;
    subtitle: string;
    order: number;
    isActive: boolean;
  } | null>(null);
  const [editSlideData, setEditSlideData] = useState({
    title: "",
    subtitle: "",
  });
  const [editSlideImage, setEditSlideImage] = useState<File | null>(null);
  const [editSlideImagePreview, setEditSlideImagePreview] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "categories") {
      fetchCategories();
    } else {
      fetchHeroSlides();
    }
  }, [activeTab]);

  // معاينة الصورة المختارة للفئات
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // معاينة الصورة المختارة للسلايدر
  const handleSlideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedSlideImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSlideImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // معاينة الصورة المختارة لتحرير الفئة
  const handleEditCategoryImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCategoryImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditCategoryImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // معاينة الصورة المختارة لتحرير السلايدر
  const handleEditSlideImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditSlideImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditSlideImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/categories`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      setCategories(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHeroSlides() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider/admin`
      );
      if (!res.ok) throw new Error("Failed to fetch hero slides");
      setHeroSlides(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim() || !selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", newCategory.trim());
      formData.append("image", selectedImage);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/categories`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add category: ${res.status} - ${errorText}`);
      }

      const result = await res.json();
      setNewCategory("");
      setSelectedImage(null);
      setImagePreview(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", editCategoryName.trim());
      if (editCategoryImage) {
        formData.append("image", editCategoryImage);
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/categories/${editingCategory._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to update category: ${res.status} - ${errorText}`
        );
      }

      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryImage(null);
      setEditCategoryImagePreview(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditCategory(category: {
    _id: string;
    name: string;
    image: string;
  }) {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImagePreview(category.image);
  }

  function closeEditCategory() {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryImage(null);
    setEditCategoryImagePreview(null);
  }

  async function handleAddHeroSlide(e: React.FormEvent) {
    e.preventDefault();
    if (
      !newSlide.title.trim() ||
      !newSlide.subtitle.trim() ||
      !selectedSlideImage
    )
      return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", newSlide.title.trim());
      formData.append("subtitle", newSlide.subtitle.trim());
      formData.append("image", selectedSlideImage);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to add hero slide: ${res.status} - ${errorText}`
        );
      }

      const result = await res.json();
      setNewSlide({ title: "", subtitle: "" });
      setSelectedSlideImage(null);
      setSlideImagePreview(null);
      fetchHeroSlides();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditHeroSlide(e: React.FormEvent) {
    e.preventDefault();
    if (
      !editingSlide ||
      !editSlideData.title.trim() ||
      !editSlideData.subtitle.trim()
    )
      return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", editSlideData.title.trim());
      formData.append("subtitle", editSlideData.subtitle.trim());
      if (editSlideImage) {
        formData.append("image", editSlideImage);
      }

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider/${editingSlide._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to update hero slide: ${res.status} - ${errorText}`
        );
      }

      setEditingSlide(null);
      setEditSlideData({ title: "", subtitle: "" });
      setEditSlideImage(null);
      setEditSlideImagePreview(null);
      fetchHeroSlides();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openEditSlide(slide: {
    _id: string;
    image: string;
    title: string;
    subtitle: string;
    order: number;
    isActive: boolean;
  }) {
    setEditingSlide(slide);
    setEditSlideData({ title: slide.title, subtitle: slide.subtitle });
    setEditSlideImagePreview(slide.image);
  }

  function closeEditSlide() {
    setEditingSlide(null);
    setEditSlideData({ title: "", subtitle: "" });
    setEditSlideImage(null);
    setEditSlideImagePreview(null);
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/categories/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete category");
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHeroSlide(id: string) {
    if (!window.confirm("Are you sure you want to delete this hero slide?"))
      return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete hero slide");
      fetchHeroSlides();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleHeroSlide(id: string, isActive: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/hero-slider/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );
      if (!res.ok) throw new Error("Failed to update hero slide");
      fetchHeroSlides();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold">
        Manage Categories & Hero Slider
      </h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("hero-slider")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "hero-slider"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hero Slider
          </button>
        </nav>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <form
            onSubmit={handleAddCategory}
            className="mb-8 p-6 bg-gray-50 rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            {imagePreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
              disabled={loading || !newCategory.trim() || !selectedImage}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white p-4 rounded-lg shadow border"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{cat.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditCategory(cat)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      disabled={loading}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-sm text-red-600 hover:text-red-800 hover:underline"
                      disabled={loading}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Slider Tab */}
      {activeTab === "hero-slider" && (
        <div>
          <form
            onSubmit={handleAddHeroSlide}
            className="mb-8 p-6 bg-gray-50 rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-4">Add New Hero Slide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newSlide.title}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, title: e.target.value })
                  }
                  placeholder="Slide title"
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newSlide.subtitle}
                  onChange={(e) =>
                    setNewSlide({ ...newSlide, subtitle: e.target.value })
                  }
                  placeholder="Slide subtitle"
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slide Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSlideImageChange}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            {slideImagePreview && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <img
                  src={slideImagePreview}
                  alt="Preview"
                  className="w-64 h-32 object-cover rounded-md border"
                />
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
              disabled={
                loading ||
                !newSlide.title.trim() ||
                !newSlide.subtitle.trim() ||
                !selectedSlideImage
              }
            >
              {loading ? "Adding..." : "Add Hero Slide"}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroSlides.map((slide) => (
              <div
                key={slide._id}
                className="bg-white p-4 rounded-lg shadow border"
              >
                <div className="relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                  {!slide.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-gray-600">{slide.subtitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Order: {slide.order}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() =>
                      handleToggleHeroSlide(slide._id, slide.isActive)
                    }
                    className={`text-sm px-3 py-1 rounded ${
                      slide.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={loading}
                  >
                    {slide.isActive ? "Active" : "Inactive"}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditSlide(slide)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      disabled={loading}
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHeroSlide(slide._id)}
                      className="text-sm text-red-600 hover:text-red-800 hover:underline"
                      disabled={loading}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Category</h3>
              <button
                onClick={closeEditCategory}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image (optional - leave empty to keep current)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditCategoryImageChange}
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {editCategoryImagePreview && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <img
                    src={editCategoryImagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
                  disabled={loading || !editCategoryName.trim()}
                >
                  {loading ? "Updating..." : "Update Category"}
                </button>
                <button
                  type="button"
                  onClick={closeEditCategory}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Hero Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Hero Slide</h3>
              <button
                onClick={closeEditSlide}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditHeroSlide}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editSlideData.title}
                  onChange={(e) =>
                    setEditSlideData({
                      ...editSlideData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editSlideData.subtitle}
                  onChange={(e) =>
                    setEditSlideData({
                      ...editSlideData,
                      subtitle: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Image (optional - leave empty to keep current)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditSlideImageChange}
                  className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              {editSlideImagePreview && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <img
                    src={editSlideImagePreview}
                    alt="Preview"
                    className="w-64 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50"
                  disabled={
                    loading ||
                    !editSlideData.title.trim() ||
                    !editSlideData.subtitle.trim()
                  }
                >
                  {loading ? "Updating..." : "Update Slide"}
                </button>
                <button
                  type="button"
                  onClick={closeEditSlide}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
