"use client";
import ListCarousel from "@/components/ListDetails/ListCarousel";
import LocationSection from "@/components/ListDetails/LocationSection";
import PriceSection from "@/components/ListDetails/PriceSection";
import ReviewsSection from "@/components/ListDetails/ReviewsSection";
import RoomsSection from "@/components/ListDetails/RoomsSection";
import BookingSidebar from "@/components/ListDetails/ListingDetailsClient";
import NearbyItems from "@/components/NearbyItems";
import { BottomBookingTab } from "@/components/ListDetails/BottomBookingTab";
import { Star, Car, Hotel, Utensils, Mountain, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { siteConfig } from "@/config/site";

// Expandable Additional Detail Component
const AdditionalDetailItem = ({ detail }: { detail: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only render if heading exists and has content
  const hasContent = 
    (detail.type === 'description' && detail.description?.trim()) ||
    (detail.type === 'points' && detail.points?.length > 0);

  if (!detail.heading?.trim() || !hasContent) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-left">
          {detail.heading}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200">
          {detail.type === 'description' && detail.description && (
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {detail.description}
            </p>
          )}
          {detail.type === 'points' && detail.points && detail.points.length > 0 && (
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
              {detail.points.map((point: string, pointIndex: number) => (
                <li key={pointIndex}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ListingDetailsContent = () => {
  const searchParams = useSearchParams();
  const stayId = searchParams.get("stay");
  const destination = searchParams.get("destination");
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const [stayData, setStayData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, totalReviews: 0 });
  const bookingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchStayData = async () => {
      if (!stayId) {
        setLoading(false);
        return;
      }

      try {
        const encodedStayId = encodeURIComponent(stayId);
        const res = await fetch(`/api/stays/${encodedStayId}`);
        
        if (res.ok) {
          const data = await res.json();
          setStayData(data.data);
        } else {
          const errorData = await res.json();
          console.error('[item-details] Error response:', errorData);
        }
      } catch (error) {
        console.error("[item-details] Error fetching stay data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStayData();
  }, [stayId]);

  // Fetch review summary
  useEffect(() => {
    const fetchReviewSummary = async () => {
      if (!stayId) return;

      try {
        const res = await fetch(`/api/reviews?itemId=${encodeURIComponent(stayId)}&itemType=stay`);
        if (res.ok) {
          const data = await res.json();
          setReviewSummary({
            average: data.summary?.average || 0,
            totalReviews: data.summary?.totalReviews || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching review summary:", error);
      }
    };

    if (stayId) {
      fetchReviewSummary();
    }
  }, [stayId]);

  if (loading) {
    return (
      <div className="mx-0 pt-11 sm:mx-[10%] relative flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stay details...</p>
        </div>
      </div>
    );
  }

  if (!stayData) {
    const handleWhatsAppSupport = () => {
      if (typeof window !== 'undefined') {
        const text = `Hi Tripeloo! I would like to discuss about my vacation and stays. Stay ID: ${stayId || 'N/A'}`;
        const url = `https://wa.me/9190379179463?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      }
    };

    return (
      <div className="mx-0 pt-11 sm:mx-[10%] relative flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Stay Not Found
            </h1>
            <p className="text-gray-600 mb-2">
              We couldn't find the stay you're looking for.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The stay may have been removed or the link might be incorrect.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Go Back
            </button>
            
            <button
              onClick={handleWhatsAppSupport}
              className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M19.11 6.18A9.8 9.8 0 0 0 5.56 20.73l-1 3.69a.8.8 0 0 0 1 1l3.69-1A9.8 9.8 0 1 0 19.11 6.18m-3.38 16.9a8.1 8.1 0 0 1-4.1-1.12l-.29-.18-2.43.66.65-2.43-.19-.29a8.16 8.16 0 1 1 6.35 3.36"/>
                <path d="M13.59 10.87c-.21-.46-.44-.47-.64-.48h-.55a1 1 0 0 0-.72.34 3 3 0 0 0-.9 2.23 5.17 5.17 0 0 0 1.08 2.76 11.78 11.78 0 0 0 3.6 3.6 8.25 8.25 0 0 0 2.76 1.08c1 .25 1.9.08 2.63-.54a2.3 2.3 0 0 0 .75-1.5c.06-.16.06-.3 0-.42s-.19-.14-.4-.23l-1.22-.59c-.2-.09-.34-.14-.49.11s-.57.71-.7.86-.26.18-.48.07a6.7 6.7 0 0 1-2-1.23 9 9 0 0 1-1.68-2.09c-.13-.23 0-.35.09-.47s.2-.24.29-.37a1.56 1.56 0 0 0 .2-.33.39.39 0 0 0 0-.37c-.06-.11-.49-1.19-.67-1.62"/>
              </svg>
              Chat with Support
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
              <a
                href="tel:+9190379179463"
                className="text-[#E51A4B] hover:text-[#C4163F] font-medium text-sm"
              >
                Call us: +91 70664 44430
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: stayData.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };


  return (
    <div className="mx-0 pt-0 sm:pt-11 sm:mx-[10%] relative">
      <ListCarousel carouselImages={stayData.carouselImages || []} coverImage={stayData.coverImage} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          {/* LEFT CONTENT */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {stayData.name}
            </h1>

            {/* Rating + Price - Moved Above Description */}
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-3 text-gray-600">
                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Star className="w-4 h-4 fill-emerald-500" />
                  <span>{reviewSummary.average > 0 ? reviewSummary.average.toFixed(1) : "0.0"}</span>
                </div>
                <span className="text-sm">
                  ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatPrice(stayData.startingPrice)}/-
                </p>
              </div>
            </div>

            {/* Summary */}
            {stayData.summary && (
              <p className="mt-4 text-gray-600 text-sm sm:text-base">
                {stayData.summary}
              </p>
            )}

            {/* Important Info - Good to Know (Right after description) */}
            {stayData.importantInfo && typeof stayData.importantInfo === 'string' && stayData.importantInfo.trim().length > 0 && (
              <div id="additional-information-section" className="mt-6 bg-red-50 rounded-2xl p-5 sm:p-6 shadow-inner">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                  Good to Know
                </h2>
                <div className="text-gray-700 text-sm sm:text-base whitespace-pre-line italic">
                  {stayData.importantInfo}
                </div>
              </div>
            )}

            {/* Includes section hidden */}

            {/* Highlights */}
            {stayData.properties && stayData.properties.length > 0 && (
              <div className="mt-8 bg-red-50 rounded-2xl p-5 sm:p-6 shadow-inner">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
                  Highlights
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                  {stayData.properties.map((property: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-[#E51A4B] font-bold mt-0.5">•</span>
                      <span>{property}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms Section - Only show if rooms exist for this specific stay */}
            {stayData.rooms && Array.isArray(stayData.rooms) && stayData.rooms.length > 0 && (
              <div className="px-4 sm:px-6 mb-5 mt-8 relative">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Choose Your Room
                  </h2>
                </div>

                {/* Info Badge */}
                <div className="inline-block bg-[#7E22CE]/10 text-[#7E22CE] text-xs font-medium px-3 py-1 rounded-full mb-4">
                  💡 Select your preferred room type to continue booking
                </div>

                <RoomsSection 
                  rooms={stayData.rooms} 
                  onRoomSelect={(rooms) => setSelectedRooms(rooms)} 
                />
              </div>
            )}

            {/* Price Section */}
            <div className="mb-5">
              <PriceSection 
                includes={stayData.includes || []} 
                excludes={stayData.excludes || []} 
              />
            </div>

            {/* Additional Details - Expandable */}
            {stayData.additionalDetails && stayData.additionalDetails.length > 0 && (() => {
              const validDetails = stayData.additionalDetails.filter((detail: any) => {
                const hasHeading = detail.heading?.trim();
                const hasContent = 
                  (detail.type === 'description' && detail.description?.trim()) ||
                  (detail.type === 'points' && detail.points?.length > 0);
                return hasHeading && hasContent;
              });
              
              return validDetails.length > 0 ? (
                <div className="px-4 sm:px-6 mb-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                  <div className="space-y-4">
                    {validDetails.map((detail: any, index: number) => (
                      <AdditionalDetailItem key={index} detail={detail} />
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Location */}
            <div className="px-4 sm:px-6 mb-5">
              <LocationSection 
                location={stayData.location} 
                destinationName={stayData.destinationName || stayData.destinationSlug} 
              />
            </div>

            {/* Nearby Things To Do — commented out, stays only
            {stayData.nearbyActivities && stayData.nearbyActivities.length > 0 && (
              <NearbyItems
                title="Nearby Things To Do"
                itemIds={stayData.nearbyActivities}
                itemType="activity"
              />
            )}

            Nearby Food spots — commented out
            {stayData.nearbyTrips && stayData.nearbyTrips.length > 0 && (
              <NearbyItems
                title="Nearby Food spots"
                itemIds={stayData.nearbyTrips}
                itemType="trip"
              />
            )}
            */}

            {/* Mobile Booking Button - Fixed at bottom */}
            <div className="md:hidden">
              <BookingSidebar
                selectedRooms={selectedRooms}
                title={stayData.name}
                price={`${formatPrice(stayData.startingPrice)}/-`}
                oldPrice=""
                savings=""
                isMobile={true}
                destination={destination || stayData.destinationName || stayData.destinationSlug}
                itemType="stay"
                itemLocation={stayData.location || stayData.destinationName || stayData.destinationSlug}
                itemImportantInfo={stayData.importantInfo}
              />
            </div>

            {/* Reviews */}
            {stayData && (
              <div className="px-4 sm:px-6 mb-5">
                <ReviewsSection
                  itemId={stayData._id?.toString() || stayData.id || stayId || ""}
                  itemType="stay"
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div ref={bookingRef} className="hidden md:block sticky top-20">
            <BookingSidebar
              selectedRooms={selectedRooms}
              title={stayData.name}
              price={formatPrice(stayData.startingPrice)}
              oldPrice=""
              savings=""
              className="w-full lg:w-[350px]"
              destination={destination || stayData.destinationName || stayData.destinationSlug}
              itemType="stay"
              itemLocation={stayData.location || stayData.destinationName || stayData.destinationSlug}
              itemImportantInfo={stayData.importantInfo}
            />
          </div>
        </div>
      </div>

      {/* Bottom Booking Tab - Always show */}
      {stayData && (
        <BottomBookingTab
          selectedRooms={selectedRooms}
          title={stayData.name}
          price={formatPrice(stayData.startingPrice)}
          itemType="stay"
          destination={destination || stayData.destinationName || stayData.destinationSlug}
        />
      )}
    </div>
  );
};

const ListingDetails = () => {
  return (
    <Suspense fallback={
      <div className="mx-0 pt-11 sm:mx-[10%] relative flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ListingDetailsContent />
    </Suspense>
  );
};

export default ListingDetails;
