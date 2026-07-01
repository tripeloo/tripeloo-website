"use client";

import { useEffect, useState, useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ArrowRight } from "lucide-react";
import { LeadFormPopup } from "@/components/LeadFormPopup";
import { StayCardActions } from "@/components/StayCardActions";
import "swiper/css";
import "swiper/css/navigation";

interface DestinationStaysSectionProps {
  destinationSlug?: string;
  destinationName?: string;
  compact?: boolean;
}

interface StayCard {
  id: string;
  name: string;
  coverImage: string;
  startingPrice?: number;
}

export function DestinationStaysSection({
  destinationSlug = "wayanad",
  destinationName: propDestinationName,
  compact = false,
}: DestinationStaysSectionProps = {}) {
  const router = useRouter();
  const [destinationName, setDestinationName] = useState(propDestinationName || "Wayanad");
  const [stays, setStays] = useState<StayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadPopupStay, setLeadPopupStay] = useState<StayCard | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);

  const initSwiperNavigation = (swiper: SwiperType) => {
    if (!prevRef.current || !nextRef.current || !swiper.navigation) return;

    if (typeof swiper.params.navigation !== "boolean" && swiper.params.navigation) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    }
    swiper.navigation.init();
    swiper.navigation.update();
  };

  useEffect(() => {
    const slug = destinationSlug || "wayanad";
    if (propDestinationName) setDestinationName(propDestinationName);
    const fetchStays = async () => {
      try {
        const res = await fetch(`/api/destinations/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setStays([]);
          return;
        }
        const json = await res.json();
        const dest = json.data?.destination;
        const staysList = json.data?.stays || [];
        if (dest?.name) setDestinationName(dest.name);
        setStays(
          staysList.map((s: any) => ({
            id: s._id?.toString() || s.id || "",
            name: s.name || "",
            coverImage: s.coverImage || "",
            startingPrice: s.startingPrice,
          }))
        );
      } catch {
        setStays([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, [destinationSlug, propDestinationName]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || stays.length <= 1) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const swiper = swiperRef.current;
        if (!entry.isIntersecting || !swiper) return;
        swiper.update();
        initSwiperNavigation(swiper);
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [stays.length, destinationSlug]);

  const handleStayClick = (stayId: string) => {
    const params = new URLSearchParams({
      stay: stayId,
      destination: destinationName,
    });
    router.push(`/item-details?${params.toString()}`);
  };

  const discoverMoreUrl = `/stay-listings?destination=${encodeURIComponent(destinationName)}&category=stays`;

  const openLeadForm = (stay: StayCard, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLeadPopupStay(stay);
    setShowLeadPopup(true);
  };

  const canSwipe = stays.length > 1;
  const desktopSlidesPerView = Math.min(3, stays.length);

  if (loading) {
    return (
      <section className={compact ? "py-6 sm:py-8" : "py-12 bg-gradient-to-b from-gray-50/50 to-white"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E51A4B] border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (stays.length === 0) return null;

  const StayCardContent = ({ stay, onConnectClick }: { stay: StayCard; onConnectClick: (e: React.MouseEvent) => void }) => (
    <>
      <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
        <img
          src={optimizeCloudinaryUrl(stay.coverImage || "/placeholder-image.jpg")}
          alt={stay.name}
          width={400}
          height={300}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
          Stay
        </div>
      </div>
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-[#E51A4B] transition-colors font-display">
          {stay.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          {stay.startingPrice != null && stay.startingPrice > 0 ? (
            <p className="text-lg sm:text-xl font-bold text-[#E51A4B]">
              ₹{stay.startingPrice.toLocaleString()}
              <span className="text-xs text-gray-600 font-normal"> / night</span>
            </p>
          ) : (
            <span />
          )}
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#E51A4B] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>
        <StayCardActions
          stayName={stay.name}
          location={destinationName}
          onFormClick={onConnectClick}
        />
      </div>
    </>
  );

  return (
    <section
      ref={sectionRef}
      className={
        compact
          ? "py-6 sm:py-8 border-b border-gray-100 last:border-b-0"
          : "py-10 sm:py-12 bg-gradient-to-b from-gray-50/50 to-white"
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between gap-3 mb-5 sm:mb-6"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-display">
            Stays in {destinationName}
          </h2>
          <Link
            href={discoverMoreUrl}
            className="text-[#E51A4B] text-sm font-semibold shrink-0 hover:text-red-700 transition-colors"
          >
            View all
          </Link>
        </motion.div>

        {/* Carousel: mobile = 1 card + peek of next, autoplay; desktop = 4 cards */}
        <div className="relative px-2 sm:px-4 md:px-12">
          {stays.length > 1 && (
            <>
              <button
                ref={prevRef}
                type="button"
                className="absolute left-0 md:left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-2.5 md:p-3 rounded-full shadow-xl border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B] flex items-center justify-center"
                aria-label={`Previous stays in ${destinationName}`}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                ref={nextRef}
                type="button"
                className="absolute right-0 md:right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-2.5 md:p-3 rounded-full shadow-xl border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B] flex items-center justify-center"
                aria-label={`Next stays in ${destinationName}`}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <Swiper
            key={`${destinationSlug}-${stays.length}`}
            modules={[Navigation, Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              requestAnimationFrame(() => {
                initSwiperNavigation(swiper);
                swiper.update();
              });
            }}
            onSliderMove={() => {
              isDraggingRef.current = true;
            }}
            onTouchEnd={() => {
              window.setTimeout(() => {
                isDraggingRef.current = false;
              }, 80);
            }}
            onBeforeInit={(swiper) => {
              if (typeof swiper.params.navigation !== "boolean" && swiper.params.navigation) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
            }}
            observer
            observeParents
            updateOnWindowResize
            spaceBetween={16}
            slidesPerView={Math.min(1.15, stays.length)}
            slidesPerGroup={1}
            breakpoints={{
              768: {
                slidesPerView: desktopSlidesPerView,
                spaceBetween: 24,
              },
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            autoplay={
              canSwipe
                ? {
                    delay: 3500,
                    disableOnInteraction: true,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            loop={stays.length > 3}
            grabCursor={canSwipe}
            allowTouchMove={canSwipe}
            simulateTouch={canSwipe}
            className="!pb-12"
          >
            {stays.map((stay) => (
              <SwiperSlide key={stay.id} className="!h-auto">
                <motion.div
                  onClick={() => {
                    if (isDraggingRef.current) return;
                    handleStayClick(stay.id);
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
                >
                  <StayCardContent stay={stay} onConnectClick={(e) => openLeadForm(stay, e)} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <LeadFormPopup
        isOpen={showLeadPopup}
        onClose={() => { setShowLeadPopup(false); setLeadPopupStay(null); }}
        onSkip={() => { setShowLeadPopup(false); setLeadPopupStay(null); }}
        itemName={leadPopupStay?.name}
        itemType="stay"
        itemPrice={leadPopupStay?.startingPrice != null && leadPopupStay.startingPrice > 0 ? `₹${leadPopupStay.startingPrice.toLocaleString()}/ night` : undefined}
        itemDestination={destinationName}
      />
    </section>
  );
}
