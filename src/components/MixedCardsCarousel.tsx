"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bed, Camera, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { optimizeCloudinaryUrl } from '@/utils/cloudinary';
import { LeadFormPopup } from '@/components/LeadFormPopup';
import { StayCardActions } from '@/components/StayCardActions';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface MixedCard {
  id: string;
  name: string;
  coverImage: string;
  price: number;
  type: 'stay' | 'activity' | 'trip';
  destination?: string;
}

type FilterTag = 'all' | 'stay' | 'activity' | 'trip';

const FILTER_TAGS: { value: FilterTag; label: string }[] = [
  { value: 'stay', label: 'Stays' },
  // { value: 'all', label: 'All' },
  // { value: 'activity', label: 'Things to do' },
  // { value: 'trip', label: 'Food spots' },
];

export function MixedCardsCarousel() {
  const router = useRouter();
  const [cards, setCards] = useState<MixedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<FilterTag>('stay');
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadPopupStay, setLeadPopupStay] = useState<MixedCard | null>(null);

  useEffect(() => {
    fetchMixedCards();
  }, []);

  const fetchMixedCards = async () => {
    try {
      // Stays only — activities & food spots fetch commented out
      const [staysRes] = await Promise.all([
        fetch('/api/admin/stays?includeHidden=false'),
        // fetch('/api/admin/activities?includeHidden=false'),
        // fetch('/api/admin/trips?includeHidden=false'),
      ]);

      const staysData = await staysRes.json();
      // const activitiesData = await activitiesRes.json();
      // const tripsData = await tripsRes.json();

      // Map and combine all items
      const allCards: MixedCard[] = [];

      // Add stays
      if (staysData.data && Array.isArray(staysData.data)) {
        staysData.data.slice(0, 10).forEach((stay: any) => {
          allCards.push({
            id: stay._id?.toString() || stay.id,
            name: stay.name || '',
            coverImage: stay.coverImage || '',
            price: stay.startingPrice || 0,
            type: 'stay',
            destination: stay.destinationSlug,
          });
        });
      }

      // Add activities (things to do) — commented out
      // if (activitiesData.data && Array.isArray(activitiesData.data)) {
      //   activitiesData.data.slice(0, 10).forEach((activity: any) => { ... });
      // }

      // Add trips (restaurants & cafes) — commented out
      // if (tripsData.data && Array.isArray(tripsData.data)) {
      //   tripsData.data.slice(0, 10).forEach((trip: any) => { ... });
      // }

      // Shuffle the array randomly
      const shuffled = allCards.sort(() => Math.random() - 0.5);
      
      // Take first 20 items
      setCards(shuffled.slice(0, 20));
    } catch (error) {
      console.error('Error fetching mixed cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDestinationName = (slug?: string) => {
    if (!slug) return '';
    return slug
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCardClick = (card: MixedCard) => {
    const destinationName = card.destination || '';
    
    if (card.type === 'stay') {
      const queryParams = new URLSearchParams({
        stay: card.id,
      });
      if (destinationName) {
        queryParams.set('destination', destinationName);
      }
      router.push(`/item-details?${queryParams.toString()}`);
    }
    // Activities & food spots — commented out, stays only
    // else if (card.type === 'activity') { ... }
    // else if (card.type === 'trip') { ... }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stay':
        return <Bed className="w-4 h-4" />;
      case 'activity':
        return <Camera className="w-4 h-4" />;
      case 'trip':
        return <UtensilsCrossed className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stay':
        return 'Stay';
      case 'activity':
        return 'Activity';
      case 'trip':
        return 'Restaurant/Cafe';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stay':
        return 'bg-blue-100 text-blue-700';
      case 'activity':
        return 'bg-green-100 text-green-700';
      case 'trip':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51A4B]"></div>
          </div>
        </div>
      </section>
    );
  }

  const filteredCards = activeTag === 'all'
    ? cards
    : cards.filter((c) => c.type === activeTag);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 pb-0 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-display">
            Experience the Exceptional
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Explore stays
          </p>

          {/* Clickable filter tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {FILTER_TAGS.map((tag) => (
              <motion.button
                key={tag.value}
                type="button"
                onClick={() => setActiveTag(tag.value)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTag === tag.value
                    ? 'bg-[#E51A4B] text-white shadow-lg shadow-[#E51A4B]/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#E51A4B]/50 hover:text-[#E51A4B]'
                }`}
              >
                {tag.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="relative px-10 md:px-12">
          {filteredCards.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-500 text-lg">No items in this category yet. Try another filter.</p>
            </div>
          ) : (
          <>
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
            breakpoints={{
              640: {
                slidesPerView: 2.2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
            navigation={{
              nextEl: '.swiper-button-next-mixed',
              prevEl: '.swiper-button-prev-mixed',
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={filteredCards.length > 5}
            className="!pb-12"
          >
            {filteredCards.map((card) => (
              <SwiperSlide key={`${card.type}-${card.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleCardClick(card)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden flex-shrink-0">
                    <img
                      src={optimizeCloudinaryUrl(card.coverImage || '/placeholder-image.jpg')}
                      alt={card.name}
                      width={400}
                      height={300}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Type Badge */}
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getTypeColor(card.type)}`}>
                      {getTypeIcon(card.type)}
                      <span>{getTypeLabel(card.type)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-[#E51A4B] transition-colors font-display">
                      {card.name}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between">
                      {card.price != null && card.price > 0 ? (
                        <p className="text-lg sm:text-xl font-bold text-[#E51A4B]">
                          ₹{card.price.toLocaleString()}
                          {card.type === 'stay' && <span className="text-xs text-gray-600 font-normal"> / night</span>}
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

                    {card.type === 'stay' && (
                      <StayCardActions
                        stayName={card.name}
                        location={formatDestinationName(card.destination)}
                        onFormClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLeadPopupStay(card);
                          setShowLeadPopup(true);
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {filteredCards.length > 4 && (
            <>
              <motion.button
                className="swiper-button-prev-mixed absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all hidden md:flex items-center justify-center border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B]"
                aria-label="Previous"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <motion.button
                className="swiper-button-next-mixed absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-xl transition-all hidden md:flex items-center justify-center border border-gray-200 hover:border-[#E51A4B] hover:text-[#E51A4B]"
                aria-label="Next"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </>
          )}
          </>
          )}
        </div>
      </div>

      <LeadFormPopup
        isOpen={showLeadPopup}
        onClose={() => {
          setShowLeadPopup(false);
          setLeadPopupStay(null);
        }}
        onSkip={() => {
          setShowLeadPopup(false);
          setLeadPopupStay(null);
        }}
        itemName={leadPopupStay?.name}
        itemType="stay"
        itemPrice={
          leadPopupStay?.price != null && leadPopupStay.price > 0
            ? `₹${leadPopupStay.price.toLocaleString()}/ night`
            : undefined
        }
        itemDestination={formatDestinationName(leadPopupStay?.destination)}
      />
    </section>
  );
}

