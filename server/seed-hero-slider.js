const mongoose = require("mongoose");
const HeroSlider = require("./models/HeroSlider");
require("dotenv").config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB");

  try {
    // Clear existing hero slider data
    await HeroSlider.deleteMany({});
    console.log("Cleared existing hero slider data");

    // Seed hero slider data
    const heroSlides = [
      {
        image: "/slider/IMG-20240915-WA0016.jpg",
        title: "OUR EXCLUSIVE COLLECTION",
        subtitle: "Discover Elegant Modest Fashion",
        order: 0,
        isActive: true,
      },
      {
        image: "/slider/IMG-20240915-WA0018.jpg",
        title: "NEW ARRIVALS",
        subtitle: "Shop The Latest Trends",
        order: 1,
        isActive: true,
      },
      {
        image: "/slider/WhatsApp Image 2025-04-24 at 17.15.35_51c584d0.jpg",
        title: "SUMMER COLLECTION",
        subtitle: "Modest & Stylish",
        order: 2,
        isActive: true,
      },
    ];

    await HeroSlider.insertMany(heroSlides);
    console.log("Hero slider data seeded successfully");

    // Display seeded data
    const seededSlides = await HeroSlider.find().sort({ order: 1 });
    console.log("Seeded hero slides:", seededSlides);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding hero slider data:", error);
    mongoose.connection.close();
  }
});

