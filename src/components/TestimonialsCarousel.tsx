"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  image: string;
  title: string;
  experience: string;
  name: string;
  location: string;
}

interface TestimonialsCarouselProps {
  heading?: string;
  testimonials?: Testimonial[];
}

export default function TestimonialsCarousel({ 
  heading = "Testimonials",
  testimonials = []
}: TestimonialsCarouselProps) {
  // Faster autoplay for homepage testimonials (shorter delay between slides)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentBgImage = testimonials[selectedIndex]?.image || testimonials[0]?.image;

  return (
    <section className="relative min-h-screen bg-white text-black flex flex-col items-center overflow-hidden px-6 md:px-16 py-24">
      {/* Background image - change with active testimonial */}
      <div className="absolute inset-0 opacity-15 transition-opacity duration-700">
        {currentBgImage && (
          <Image
            key={currentBgImage}
            src={currentBgImage}
            alt="Testimonials background"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-6xl w-full">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-[#E51A4B]">
          {heading}
        </h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-[0_0_100%] min-w-0 px-4"
              >
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Image Section */}
                  {testimonial.image && (
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-md aspect-[4/3]">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name || "Testimonial"}
                          fill
                          className="rounded-2xl shadow-xl object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Text Section */}
                  <div className="text-gray-700">
                    {testimonial.title && (
                      <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-[#E51A4B]">
                        {testimonial.title}
                      </h3>
                    )}
                    {testimonial.experience && (
                      <div className="relative">
                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#E51A4B]/30" />
                        <p className="text-base md:text-lg leading-relaxed mb-4 pl-6">
                          {testimonial.experience}
                        </p>
                      </div>
                    )}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      {testimonial.name && (
                        <p className="text-lg font-semibold text-gray-900">
                          {testimonial.name}
                        </p>
                      )}
                      {testimonial.location && (
                        <p className="text-sm text-gray-600">
                          {testimonial.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-[#E51A4B] w-8"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Soft background animation */}
      <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-tr from-[#E51A4B]/10 via-white/30 to-[#E51A4B]/10 blur-3xl opacity-40" />
    </section>
  );
}

