const mongoose = require("mongoose");
const Category = require("./models/Category");

// إعداد اتصال قاعدة البيانات
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/myou-store"
);

// الفئات الافتراضية مع الصور
const defaultCategories = [
  {
    name: "Scarves",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/scarves.jpg",
  },
  {
    name: "Kimonos",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/kimonos.jpg",
  },
  {
    name: "Burkini",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/burkini.jpg",
  },
  {
    name: "Cover Ups",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/cover-ups.jpg",
  },
  {
    name: "Turban Cap",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/turban-cap.jpg",
  },
  {
    name: "Hats & Clutches",
    image:
      "https://res.cloudinary.com/demo/image/upload/v1/categories/hats-clutches.jpg",
  },
];

async function seedCategories() {
  try {
    // حذف الفئات الموجودة
    await Category.deleteMany({});
    console.log("Deleted existing categories");

    // إضافة الفئات الجديدة
    const categories = await Category.insertMany(defaultCategories);
    console.log(`Added ${categories.length} categories:`);

    categories.forEach((cat) => {
      console.log(`- ${cat.name}`);
    });

    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    mongoose.connection.close();
  }
}

seedCategories();

