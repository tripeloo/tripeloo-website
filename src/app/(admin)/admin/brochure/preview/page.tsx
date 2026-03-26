"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Hotel, Activity, Plane, Star, Check, Users, Hourglass, Clock1, Smartphone, PawPrint, BookA, FileText, Printer } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

interface AdditionalDetail {
  heading: string;
  type: "description" | "points";
  description?: string;
  points?: string[];
}

interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  createdAt: Date | string;
}

interface Item {
  id: string;
  name: string;
  category?: string;
  coverImage: string;
  carouselImages?: string[] | Array<{ url: string; title?: string }>;
  summary?: string;
  about?: string;
  startingPrice?: number;
  originalPrice?: number;
  price?: number;
  currency?: string;
  includes?: string[];
  excludes?: string[];
  location?: string;
  additionalDetails?: AdditionalDetail[];
  properties?: string[];
  importantInfo?: string;
  rooms?: Array<{
    name: string;
    thumb?: string;
    images?: string[];
    features?: string[];
    rate?: string;
  }>;
  packages?: Array<{
    name: string;
    duration?: string;
    price?: number;
    thumb?: string;
    images?: string[];
    highlights?: string[];
  }>;
  activityDetails?: {
    ages?: string;
    duration?: string;
    startTime?: string;
    mobileTicket?: boolean;
    animalWelfare?: boolean;
    liveGuide?: boolean | string;
    maxGroupSize?: number;
  };
  destinationName?: string;
}

interface PreviewData {
  selectedItem: Item;
  itemType: "stay" | "activity" | "trip" | "tour-package";
  reviews: Review[];
  customContent: string;
  customPrice: string;
  selectedRooms: string[];
  selectedPackages: string[];
  selectedDestination: string;
}

export default function BrochurePreviewPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<"pages" | "single">("pages");
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Only access sessionStorage on client side
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('brochurePreviewData');
      if (data) {
        try {
          setPreviewData(JSON.parse(data));
        } catch (error) {
          console.error("Error parsing preview data:", error);
        }
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only inject styles on client side
    if (typeof window === 'undefined') return;
    
    // Inject print styles
    const style = document.createElement('style');
    style.id = 'brochure-print-styles';
    style.textContent = `
      @media print {
        /* Hide header and sidebar */
        .metadata-sidebar {
          display: none !important;
        }

        /* Reset body and html styles */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          width: 100% !important;
          height: auto !important;
        }

        /* Hide everything by default */
        body * {
          visibility: hidden;
        }

        /* Show only the preview and its contents */
        #brochure-print-preview,
        #brochure-print-preview * {
          visibility: visible !important;
        }

        /* Ensure parent containers don't interfere */
        body > div {
          background: white !important;
        }

        /* Hide container padding/margins */
        .container {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Show and style preview */
        #brochure-print-preview {
          display: block !important;
          position: relative !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 15mm !important;
          background: white !important;
          color: black !important;
        }
        
        /* Ensure all content inside preview is visible and styled */
        #brochure-print-preview * {
          color: black !important;
        }

        #brochure-print-preview > div,
        #brochure-print-preview section,
        #brochure-print-preview .border-t-2,
        #brochure-print-preview .rounded-lg,
        #brochure-print-preview .rounded-2xl {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        #brochure-print-preview h1,
        #brochure-print-preview h2,
        #brochure-print-preview h3,
        #brochure-print-preview h4 {
          page-break-after: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
        }

        #brochure-print-preview img {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          max-width: 100% !important;
          height: auto !important;
        }

        #brochure-print-preview ul,
        #brochure-print-preview ol {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        body.print-single-page #brochure-print-preview {
          height: auto !important;
          page-break-after: auto !important;
          padding: 10mm !important;
        }

        body.print-single-page #brochure-print-preview > * {
          page-break-inside: auto !important;
          break-inside: auto !important;
        }

        /* Optimize spacing for single page */
        body.print-single-page #brochure-print-preview .mb-6,
        body.print-single-page #brochure-print-preview .mb-8,
        body.print-single-page #brochure-print-preview .mb-10,
        body.print-single-page #brochure-print-preview .mt-6,
        body.print-single-page #brochure-print-preview .mt-8,
        body.print-single-page #brochure-print-preview .mt-10 {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }

        body.print-single-page #brochure-print-preview .space-y-4,
        body.print-single-page #brochure-print-preview .space-y-6,
        body.print-single-page #brochure-print-preview .space-y-8 {
          gap: 0.5rem !important;
        }

        body.print-single-page #brochure-print-preview img {
          max-height: 300px !important;
          object-fit: cover !important;
        }

        body.print-single-page #brochure-print-preview h1 {
          font-size: 1.5rem !important;
          margin-bottom: 0.5rem !important;
        }

        body.print-single-page #brochure-print-preview h2 {
          font-size: 1.25rem !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.5rem !important;
        }

        body.print-single-page #brochure-print-preview h3 {
          font-size: 1.1rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.25rem !important;
        }

        body.print-single-page #brochure-print-preview p {
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
          line-height: 1.4 !important;
        }

        body.print-single-page #brochure-print-preview .p-6,
        body.print-single-page #brochure-print-preview .p-5,
        body.print-single-page #brochure-print-preview .px-6,
        body.print-single-page #brochure-print-preview .py-6,
        body.print-single-page #brochure-print-preview .px-5,
        body.print-single-page #brochure-print-preview .py-5 {
          padding: 0.75rem !important;
        }

        body.print-single-page #brochure-print-preview .gap-2,
        body.print-single-page #brochure-print-preview .gap-3,
        body.print-single-page #brochure-print-preview .gap-4 {
          gap: 0.5rem !important;
        }

        body.print-single-page #brochure-print-preview .rounded-lg,
        body.print-single-page #brochure-print-preview .rounded-2xl {
          border-radius: 0.25rem !important;
        }

        /* Reduce logo size for single page */
        body.print-single-page #brochure-print-preview img[alt*="Logo"],
        body.print-single-page #brochure-print-preview img[alt*="logo"] {
          max-width: 120px !important;
          max-height: 50px !important;
          margin-bottom: 0.5rem !important;
        }

        /* Reduce footer spacing */
        body.print-single-page #brochure-print-preview .border-t-2 {
          margin-top: 0.5rem !important;
          padding-top: 0.5rem !important;
        }

        /* Reduce section spacing */
        body.print-single-page #brochure-print-preview section {
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }

        /* Compact grid layouts */
        body.print-single-page #brochure-print-preview .grid {
          gap: 0.5rem !important;
        }

        /* Reduce list spacing */
        body.print-single-page #brochure-print-preview ul,
        body.print-single-page #brochure-print-preview ol {
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
          padding-left: 1rem !important;
        }

        body.print-single-page #brochure-print-preview li {
          margin-top: 0.125rem !important;
          margin-bottom: 0.125rem !important;
        }

        body.print-multi-page #brochure-print-preview {
          page-break-after: auto !important;
        }

        #brochure-print-preview * {
          color: black !important;
        }

        #brochure-print-preview .shadow-md,
        #brochure-print-preview .shadow-lg {
          box-shadow: none !important;
        }
      }

      #brochure-print-preview {
        visibility: visible;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    return () => {
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading preview...</div>
      </div>
    );
  }

  if (!previewData || !previewData.selectedItem) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">No preview data found.</p>
          <button
            onClick={() => router.push('/admin/brochure')}
            className="bg-[#E51A4B] hover:bg-[#c91742] text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { selectedItem, itemType, reviews, customContent, customPrice, selectedRooms, selectedPackages, selectedDestination } = previewData;

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePrint = () => {
    // Apply print mode class to body
    document.body.classList.add(printMode === "single" ? "print-single-page" : "print-multi-page");
    window.print();
    // Remove class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove("print-single-page", "print-multi-page");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Simple Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10 metadata-sidebar">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/brochure')}
              className="flex items-center gap-2 text-white hover:text-[#E51A4B] transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Form
            </button>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setPrintMode("pages")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    printMode === "pages"
                      ? "bg-[#E51A4B] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Multi-Page
                </button>
                <button
                  onClick={() => setPrintMode("single")}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    printMode === "single"
                      ? "bg-[#E51A4B] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Single Page
                </button>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-[#E51A4B] hover:bg-[#c91742] text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Printer size={20} />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content - Centered */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div id="brochure-print-preview" className="bg-white text-gray-900 rounded-lg p-6 shadow-lg">
              {/* Logo at Top Middle */}
              <div className="flex justify-center mb-6" style={{ minHeight: '64px' }}>
                <Image
                  src="/assets/logo_new.png"
                  alt="Tripeloo Logo"
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                  style={{ minWidth: '150px', maxWidth: '200px', height: 'auto' }}
                />
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-6">
                {selectedItem.name}
              </h1>

              {/* Carousel - Cover Image + All Carousel Images */}
              <div className="mb-6">
                {selectedItem.coverImage && (
                  <img
                    src={optimizeCloudinaryUrl(selectedItem.coverImage)}
                    alt={selectedItem.name}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover rounded-lg mb-4 shadow-md"
                    style={{ minHeight: '300px', maxHeight: '500px' }}
                  />
                )}
                {selectedItem.carouselImages && 
                 Array.isArray(selectedItem.carouselImages) && 
                 selectedItem.carouselImages.filter((img: any) => {
                   const imgUrl = typeof img === 'string' ? img : img?.url || '';
                   return imgUrl && imgUrl.trim() !== "";
                 }).length > 0 && (
                  <div className="space-y-4">
                    {selectedItem.carouselImages
                      .filter((img: any) => {
                        const imgUrl = typeof img === 'string' ? img : img?.url || '';
                        return imgUrl && imgUrl.trim() !== "";
                      })
                      .map((img: any, idx: number) => {
                        const imgUrl = typeof img === 'string' ? img : img?.url || '';
                        return (
                          <img
                            key={idx}
                            src={optimizeCloudinaryUrl(imgUrl)}
                            alt={`${selectedItem.name} - Image ${idx + 1}`}
                            width={800}
                            height={500}
                            className="w-full h-auto object-cover rounded-lg shadow-md"
                            style={{ minHeight: '300px', maxHeight: '500px' }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-3">
                  <div className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Star className="w-4 h-4 fill-emerald-500" />
                    <span>5.0</span>
                  </div>
                  <span className="text-sm">(Reviews)</span>
                </div>
                {customPrice && (
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{customPrice}</p>
                  </div>
                )}
              </div>

              {/* Summary (for Stays/Food spots) */}
              {selectedItem.summary && itemType !== "activity" && (
                <p className="mt-4 mb-6 text-gray-600 text-sm sm:text-base">
                  {selectedItem.summary}
                </p>
              )}

              {/* About (for Activities) */}
              {selectedItem.about && itemType === "activity" && (
                <div className="mt-8 mb-6 bg-white px-3 py-3 border rounded-lg">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">About</h2>
                  <p className="text-gray-700">{selectedItem.about}</p>
                </div>
              )}

              {/* Activity Details */}
              {selectedItem.activityDetails && Object.keys(selectedItem.activityDetails).length > 0 && itemType === "activity" && (
                <div className="mt-6 mb-6 px-4 flex flex-col gap-4 sm:gap-6 border-y py-4 text-gray-700 text-sm sm:text-base">
                  {selectedItem.activityDetails.ages && (
                    <div className="flex items-center gap-2">
                      <Users size={18} /> <span>{selectedItem.activityDetails.ages}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.duration && (
                    <div className="flex items-center gap-2">
                      <Hourglass size={18} /> <span>Duration: {selectedItem.activityDetails.duration}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock1 size={18} /> <span>Start time: {selectedItem.activityDetails.startTime}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.mobileTicket && (
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} /> <span>Mobile ticket</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.animalWelfare && (
                    <div className="flex items-center gap-2">
                      <PawPrint size={18} /> <span>Meets animal welfare guidelines</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.liveGuide && (
                    <div className="flex items-center gap-2">
                      <BookA size={18} /> <span>Live guide: {selectedItem.activityDetails.liveGuide}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.maxGroupSize && (
                    <div className="flex items-center gap-2">
                      <Users size={18} /> <span>Max Group Size: {selectedItem.activityDetails.maxGroupSize}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Highlights (for Stays) */}
              {selectedItem.properties && Array.isArray(selectedItem.properties) && selectedItem.properties.length > 0 && (itemType === "stay" || itemType === "tour-package") && (
                <div className="mt-8 mb-6 bg-white rounded-2xl p-5 sm:p-6 shadow-inner">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">{itemType === "tour-package" ? "Trip Highlights" : "Highlights"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                    {selectedItem.properties.map((property: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-[#E51A4B] font-bold mt-0.5">•</span>
                        <span>{property}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurant/Cafe Features (for Food spots) */}
              {selectedItem.properties && Array.isArray(selectedItem.properties) && selectedItem.properties.length > 0 && itemType === "trip" && (
                <div className="mt-8 mb-6 bg-white rounded-2xl p-5 sm:p-6 shadow-inner">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Restaurant/Cafe Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base">
                    {selectedItem.properties.map((prop: string, index: number) => (
                      <div key={index}>{prop}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Section (for Stays) */}
              {itemType === "stay" && selectedItem.rooms && Array.isArray(selectedItem.rooms) && selectedItem.rooms.length > 0 && (() => {
                const roomsToShow = selectedRooms.length > 0
                  ? selectedItem.rooms.filter((room: any, idx: number) => {
                      const roomKey = room.name || `room-${idx}`;
                      return selectedRooms.includes(roomKey);
                    })
                  : selectedItem.rooms;
                
                if (roomsToShow.length === 0) return null;
                
                return (
                  <div className="mb-6 mt-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Room</h2>
                    <div className="space-y-8">
                      {roomsToShow.map((room: any, idx: number) => (
                      <div key={idx} className="w-full">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{room.name}</h3>
                        
                        {room.images && Array.isArray(room.images) && room.images.filter((img: string) => img && img.trim() !== "").length > 0 ? (
                          <div className="space-y-4 mb-4">
                            {room.images
                              .filter((img: string) => img && img.trim() !== "")
                              .map((img: string, imgIdx: number) => (
                                <img
                                  key={imgIdx}
                                  src={optimizeCloudinaryUrl(img)}
                                  alt={`${room.name} - Image ${imgIdx + 1}`}
                                  width={800}
                                  height={500}
                                  className="w-full h-auto object-cover rounded-lg shadow-md"
                                  style={{ minHeight: '300px', maxHeight: '500px' }}
                                />
                              ))}
                          </div>
                        ) : room.thumb ? (
                          <div className="mb-4">
                            <img
                              src={optimizeCloudinaryUrl(room.thumb)}
                              alt={room.name}
                              width={800}
                              height={500}
                              className="w-full h-auto object-cover rounded-lg shadow-md"
                              style={{ minHeight: '300px', maxHeight: '500px' }}
                            />
                          </div>
                        ) : (
                          <div className="h-[300px] w-full bg-white border border-gray-200 flex items-center justify-center rounded-lg mb-4">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        
                        {room.features && Array.isArray(room.features) && room.features.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm sm:text-base">
                              {room.features.map((feature: string, fIdx: number) => (
                                <div key={fIdx} className="flex items-start gap-2">
                                  <span className="text-[#E51A4B] font-bold mt-0.5">•</span>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Dishes Section (for Food spots) */}
              {itemType === "trip" && selectedItem.packages && Array.isArray(selectedItem.packages) && selectedItem.packages.length > 0 && (() => {
                const packagesToShow = selectedPackages.length > 0
                  ? selectedItem.packages.filter((pkg: any, idx: number) => {
                      const pkgKey = pkg.name || `dish-${idx}`;
                      return selectedPackages.includes(pkgKey);
                    })
                  : selectedItem.packages;
                
                if (packagesToShow.length === 0) return null;
                
                return (
                  <div className="mb-6 mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Choose Your Dish/Menu Item</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      {packagesToShow.map((pkg: any, idx: number) => (
                      <div key={idx} className="cursor-pointer rounded-xl overflow-hidden shadow-md border border-gray-200">
                        {pkg.thumb ? (
                          <img
                            src={optimizeCloudinaryUrl(pkg.thumb)}
                            alt={pkg.name}
                            width={180}
                            height={120}
                            className="h-[120px] w-full object-cover"
                          />
                        ) : pkg.images && pkg.images.length > 0 ? (
                          <img
                            src={optimizeCloudinaryUrl(pkg.images[0])}
                            alt={pkg.name}
                            width={180}
                            height={120}
                            className="h-[120px] w-full object-cover"
                          />
                        ) : (
                          <div className="h-[120px] w-full bg-white border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        <div className="p-3 flex flex-col gap-1">
                          <h3 className="font-semibold text-sm text-gray-800">{pkg.name}</h3>
                          {pkg.duration && (
                            <p className="text-xs text-gray-600">{pkg.duration}</p>
                          )}
                        </div>
                        {pkg.images && Array.isArray(pkg.images) && pkg.images.filter((img: string) => img && img.trim() !== "").length > 0 && (
                          <div className="p-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                              {pkg.images
                                .filter((img: string) => img && img.trim() !== "")
                                .slice(0, 4)
                                .map((img: string, imgIdx: number) => (
                                  <img
                                    key={imgIdx}
                                    src={optimizeCloudinaryUrl(img)}
                                    alt={`${pkg.name} - Image ${imgIdx + 1}`}
                                    width={150}
                                    height={100}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ))}
                            </div>
                            {pkg.images.filter((img: string) => img && img.trim() !== "").length > 4 && (
                              <p className="text-xs text-gray-500 mt-2">
                                +{pkg.images.filter((img: string) => img && img.trim() !== "").length - 4} more images
                              </p>
                            )}
                          </div>
                        )}
                        {pkg.highlights && Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                          <div className="p-3 pt-0">
                            <div className="space-y-1">
                              {pkg.highlights.slice(0, 3).map((highlight: string, hIdx: number) => (
                                <div key={hIdx} className="text-gray-700 text-xs flex items-start gap-1">
                                  <span className="text-[#E51A4B]">•</span>
                                  <span>{highlight}</span>
                                </div>
                              ))}
                              {pkg.highlights.length > 3 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{pkg.highlights.length - 3} more highlights
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Price Section */}
              {(itemType === "stay" || itemType === "trip" || itemType === "tour-package") && (
                ((selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0) || 
                 (selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0)) && (
                  <div className="mb-6">
                    <section className="bg-white py-7 px-6 md:px-5 rounded-lg border border-gray-200">
                      {selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0 && (
                        <div className={selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0 ? "mb-10" : ""}>
                          <h2 className="text-xl font-semibold text-gray-800 mb-6">Price Includes</h2>
                          <div className="grid md:grid-cols-2 gap-y-4 gap-x-12 text-gray-700">
                            {selectedItem.includes.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                <Check className="text-green-600 w-5 h-5 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0 && (
                        <div className={selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0 ? "mt-10" : ""}>
                          <h2 className="text-xl font-semibold text-gray-800 mb-6">Price Excludes</h2>
                          <div className="grid md:grid-cols-2 gap-y-4 gap-x-12 text-gray-700">
                            {selectedItem.excludes.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                <span className="text-red-600 w-5 h-5 flex-shrink-0 flex items-center justify-center">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                )
              )}

              {/* Additional Details */}
              {selectedItem.additionalDetails && Array.isArray(selectedItem.additionalDetails) && selectedItem.additionalDetails.length > 0 && (() => {
                const validDetails = selectedItem.additionalDetails.filter((detail: AdditionalDetail) => {
                  const hasHeading = detail.heading?.trim();
                  const hasContent = 
                    (detail.type === 'description' && detail.description?.trim()) ||
                    (detail.type === 'points' && Array.isArray(detail.points) && detail.points.length > 0);
                  return hasHeading && hasContent;
                });
                
                return validDetails.length > 0 ? (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                    <div className="space-y-4">
                      {validDetails.map((detail: AdditionalDetail, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                              {detail.heading}
                            </h3>
                            {detail.type === 'description' && detail.description && (
                              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                {detail.description}
                              </p>
                            )}
                            {detail.type === 'points' && detail.points && Array.isArray(detail.points) && detail.points.length > 0 && (
                              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                                {detail.points.map((point: string, pointIndex: number) => (
                                  <li key={pointIndex}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Location */}
              {selectedItem.location && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-[#E51A4B]" />
                    <p>{selectedItem.location}</p>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#E51A4B] text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {getInitials(review.userName)}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{review.userName}</h4>
                                <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{review.review}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Content */}
              {customContent && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b-2 border-[#E51A4B] pb-2">Details</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {customContent}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <div className="flex justify-center mb-4" style={{ minHeight: '48px' }}>
                  <Image
                    src="/assets/logo_new.png"
                    alt="Tripeloo Logo"
                    width={150}
                    height={60}
                    className="h-12 w-auto object-contain"
                    style={{ minWidth: '120px', maxWidth: '150px', height: 'auto' }}
                  />
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-700 font-semibold mb-2">
                    Tripeloo Travel Management LLP
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    South Beach, Calicut, Kerala
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Email: <a href="mailto:support@tripeloo.com" className="text-[#E51A4B] hover:underline">support@tripeloo.com</a>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Phone: <a href="tel:7066444430" className="text-[#E51A4B] hover:underline">7066444430</a>
                  </p>
                  <div className="flex justify-center gap-4 items-center">
                    <a 
                      href="https://www.instagram.com/tripeloo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E51A4B] hover:text-[#c91742] transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.facebook.com/tripeloo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E51A4B] hover:text-[#c91742] transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  © {new Date().getFullYear()} Tripeloo. All rights reserved.
                </p>
              </div>
        </div>
      </div>
    </div>
  );
}

