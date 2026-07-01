"use client";

import Link from "next/link";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import { useEffect, useState } from "react";
import { destinations as fallback } from "@/data/destinations";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type Card = { slug: string; name: string; image: string };

const SECTION_SUBTITLE =
  "Handpicked destinations with standout stays, curated for your next getaway.";

function SectionHeader() {
  return (
    <div className="text-center mb-5 sm:mb-6 md:mb-7">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 font-display">
        Top Travel Picks
      </h2>
      <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto px-2 leading-relaxed">
        {SECTION_SUBTITLE}
      </p>
    </div>
  );
}

export function FeaturedDestinations() {
  const [destinations, setDestinations] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";

        const homeRes = await fetch(`${base}/api/home`, { cache: "no-store" });
        if (homeRes.ok) {
          const homeData = await homeRes.json();
          const featuredSlugs = homeData.data?.featuredDestinations || [];

          if (featuredSlugs.length > 0) {
            const destRes = await fetch(`${base}/api/destinations`, { cache: "no-store" });
            if (destRes.ok) {
              const destJson = await destRes.json();
              const allDestinations = (destJson.data as Array<any>) || [];

              const featured = featuredSlugs
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((featured: any) => {
                  const dest = allDestinations.find((d: any) => d.slug === featured.slug);
                  return dest
                    ? {
                        slug: dest.slug,
                        name: dest.name,
                        image: dest.coverImage,
                      }
                    : null;
                })
                .filter((d: any) => d !== null)
                .slice(0, 8);

              if (featured.length > 0) {
                setDestinations(featured);
                setLoading(false);
                return;
              }
            }
          }
        }

        const res = await fetch(`${base}/api/destinations`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        const rows = (json.data as Array<any>) || [];
        const featured = rows.slice(0, 8).map((d: any) => ({
          slug: d.slug,
          name: d.name,
          image: d.coverImage,
        }));
        setDestinations(featured);
      } catch {
        const featured = fallback.slice(0, 8).map((d) => ({
          slug: d.slug,
          name: d.name,
          image: d.coverImage,
        }));
        setDestinations(featured);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const highlightCards = destinations.slice(0, 4);

  if (loading) {
    return (
      <section className="mt-2 sm:mt-3 pt-0" id="featured-destinations-section">
        <div className="container px-3 sm:px-4">
          <SectionHeader />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[5/3] sm:aspect-[2/1] rounded-2xl sm:rounded-3xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-2 sm:mt-3 pt-0" id="featured-destinations-section">
      <div className="container px-3 sm:px-4">
        <SectionHeader />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {highlightCards.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}#destination-overview-section`}
              className="group relative aspect-[5/3] sm:aspect-[2/1] overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 shadow-sm hover:shadow-lg transition-shadow"
            >
              <img
                src={optimizeCloudinaryUrl(d.image)}
                alt={d.name}
                width={480}
                height={240}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 text-[11px] sm:text-sm md:text-base font-bold text-white uppercase tracking-wide leading-tight text-right drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] max-w-[92%]">
                {d.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Tripeloo highlights carousel — commented out
        <div className="flex items-end justify-between">
          <h2 className="text-lg sm:text-2xl font-bold">Tripeloo highlights</h2>
          <Link href="/destinations" className="text-brand text-sm">View all</Link>
        </div>
        <div className="mt-4 relative px-10 md:px-12">
          <Swiper ... carousel with tags ... />
        </div>
        */}
        {false && (
          <>
            <div className="flex items-end justify-between mt-8">
              <h2 className="text-lg sm:text-2xl font-bold">Tripeloo highlights</h2>
              <Link href="/destinations" className="text-brand text-sm">
                View all
              </Link>
            </div>

            <div className="mt-4 relative px-10 md:px-12">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={16}
                slidesPerView={1.12}
                breakpoints={{
                  640: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                  },
                }}
                navigation={{
                  nextEl: ".swiper-button-next-highlights",
                  prevEl: ".swiper-button-prev-highlights",
                }}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                }}
                loop={destinations.length > 4}
                className="!pb-10"
              >
                {destinations.map((d) => (
                  <SwiperSlide key={d.slug}>
                    <Link
                      href={`/destinations/${d.slug}#destination-overview-section`}
                      className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg hover:shadow-xl h-full transition-shadow"
                    >
                      <div className="relative h-56 sm:h-64">
                        <img
                          src={optimizeCloudinaryUrl(d.image)}
                          alt={d.name}
                          width={400}
                          height={256}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="font-bold text-lg sm:text-xl text-gray-900">{d.name}</div>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 cursor-default select-none">
                            Stays
                          </span>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              {destinations.length > 3 && (
                <>
                  <button
                    type="button"
                    className="swiper-button-prev-highlights absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B] hidden md:flex items-center justify-center"
                    aria-label="Previous"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="swiper-button-next-highlights absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B] hidden md:flex items-center justify-center"
                    aria-label="Next"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
