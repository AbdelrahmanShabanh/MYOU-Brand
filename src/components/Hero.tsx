"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useHeroSlider } from "@/hooks/useHeroSlider";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides, loading, error } = useHeroSlider();

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const scrollToCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    const collectionsSection = document.getElementById("collections");
    if (collectionsSection) {
      collectionsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="relative h-[80vh] w-full overflow-hidden mt-16 bg-gray-200 animate-pulse">
        <div className="flex absolute inset-0 z-20 flex-col justify-center items-center">
          <div className="mb-4 w-1/2 h-12 bg-gray-300 rounded animate-pulse"></div>
          <div className="mb-8 w-1/3 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-40 h-12 bg-gray-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="relative h-[80vh] w-full overflow-hidden mt-16 bg-gray-100">
        <div className="flex absolute inset-0 z-20 flex-col justify-center items-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-6xl">
            Welcome to MYOU
          </h1>
          <p className="mb-8 text-xl text-gray-600 md:text-2xl">
            Discover Elegant Modest Fashion
          </p>
          <button
            onClick={scrollToCollections}
            className="px-8 py-3 text-lg font-medium text-white bg-pink-600 rounded-full transition-colors duration-300 hover:bg-pink-700"
          >
            SHOP NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] w-full overflow-hidden mt-16">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide._id} className="relative min-w-full h-full">
            <div className="absolute inset-0 z-10 bg-black/30" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            <div className="flex absolute inset-0 z-20 flex-col justify-center items-center text-center text-white">
              <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                {slide.title}
              </h1>
              <p className="mb-8 text-xl md:text-2xl">{slide.subtitle}</p>
              <button
                onClick={scrollToCollections}
                className="px-8 py-3 text-lg font-medium text-white bg-pink-600 rounded-full transition-colors duration-300 hover:bg-pink-700"
              >
                SHOP NOW
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="flex absolute bottom-5 left-1/2 z-30 space-x-2 transform -translate-x-1/2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 
                       ${
                         currentSlide === index ? "bg-pink-600" : "bg-white/50"
                       }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Hero;
