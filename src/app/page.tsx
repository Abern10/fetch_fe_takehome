// src/app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import Image from 'next/image';


// Fetch brand colors
const FETCH_PURPLE = '#2e0d36';
const FETCH_ORANGE = '#ffa726';

// Carousel slide data
const carouselSlides = [
  {
    title: "Find Your Perfect Furry Friend",
    content: "Browse through our database of adorable dogs waiting for their forever home.",
    features: [
      { text: "Search through thousands of dogs", icon: "search" },
      { text: "Save your favorites", icon: "heart" },
      { text: "Get matched with your perfect companion", icon: "target" }
    ]
  },
  {
    title: "Simple and Easy Process",
    content: "Finding your new best friend has never been easier.",
    features: [
      { text: "Filter by breed, age, and location", icon: "filter" },
      { text: "Detailed profiles for each dog", icon: "info" },
      { text: "Quick application process", icon: "document" }
    ]
  },
  {
    title: "Make a Difference",
    content: "Help a dog find their forever home and change a life.",
    features: [
      { text: "All dogs come from reputable shelters", icon: "shield" },
      { text: "Support dog adoption initiatives", icon: "star" },
      { text: "Join our community of dog lovers", icon: "users" }
    ]
  }
];

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotate carousel slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Icon component based on name
  const Icon = ({ name }: { name: string }) => {
    switch (name) {
      case 'search':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'target':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'filter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Column - Login Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <Image
                  src="/Fetch_Logo_Primary_Stacked.png"
                  alt="Fetch Logo"
                  width={120}
                  height={40}
                  priority
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-6">Get Started</h2>
              <p className="text-gray-600">Sign in to find your perfect dog companion</p>
            </div>
            <LoginForm brandColors={{ purple: FETCH_PURPLE, orange: FETCH_ORANGE }} />
          </div>

          {/* Right Column - Carousel */}
          <div
            className="w-full md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center relative"
            style={{ backgroundColor: FETCH_PURPLE }}
          >
            {/* Carousel content */}
            <div className="carousel relative">
              {carouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`carousel-item transition-opacity duration-500 ${activeSlide === index ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                >
                  <h2 className="text-3xl font-bold mb-6">{slide.title}</h2>
                  <p className="mb-8 text-lg">{slide.content}</p>

                  <div className="space-y-6">
                    {slide.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div
                          className="p-3 rounded-full mr-4"
                          style={{ backgroundColor: `${FETCH_ORANGE}40` }}
                        >
                          <Icon name={feature.icon} />
                        </div>
                        <p className="text-lg">{feature.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel indicators */}
            <div className="mt-12 flex items-center justify-center space-x-3">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`transition-all h-2 rounded-full ${activeSlide === index
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}