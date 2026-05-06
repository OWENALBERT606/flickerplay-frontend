"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, Play } from "lucide-react"

interface SlideItem {
  src: string
  title: string
  description: string
  rating?: number
  genre?: string
  year?: number
}

interface RegisterHeroCarouselProps {
  slides?: SlideItem[]
}

const FALLBACK_SLIDES: SlideItem[] = [
  {
    src: "/8fdeb8f8cc9b17c0c17cb6c5ae0fd35c.jpg",
    title: "Unlimited Entertainment",
    description: "Stream thousands of movies, series, and documentaries",
  },
  {
    src: "/52de501356165abb489c3cc24f07e64e.jpg",
    title: "Watch Anywhere",
    description: "Enjoy on your TV, laptop, phone, and tablet",
  },
  {
    src: "/8507f90d74a40b47290766ce6f373043.jpg",
    title: "Premium Quality",
    description: "Experience cinema-quality streaming in HD and 4K",
  },
]

export function RegisterHeroCarousel({ slides }: RegisterHeroCarouselProps) {
  const items = slides && slides.length > 0 ? slides : FALLBACK_SLIDES
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const current = items[currentIndex]

  return (
    <div className="relative h-full w-full group overflow-hidden">
      {/* Slides */}
      {items.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.src && (
            <Image
              src={item.src}
              alt={item.title}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="50vw"
            />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-3 z-10">
        {/* Meta badges */}
        <div className="flex items-center gap-3 flex-wrap">
          {current.rating && (
            <span className="flex items-center gap-1 bg-orange-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-white" />
              {current.rating.toFixed(1)}
            </span>
          )}
          {current.year && (
            <span className="text-white/70 text-xs font-medium">{current.year}</span>
          )}
          {current.genre && (
            <span className="text-white/70 text-xs font-medium border border-white/20 px-2 py-0.5 rounded-full">
              {current.genre}
            </span>
          )}
        </div>

        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
          {current.title}
        </h3>
        <p className="text-sm md:text-base text-white/80 max-w-sm line-clamp-2 leading-relaxed">
          {current.description}
        </p>

        {/* Play hint */}
        <div className="flex items-center gap-2 text-white/60 text-xs pt-1">
          <Play className="w-3 h-3 fill-current" />
          <span>Sign in to watch</span>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-6 flex gap-2 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-orange-500"
                : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-4 right-4 z-20 text-white/50 text-xs font-medium">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  )
}
