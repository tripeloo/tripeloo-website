"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ListCarousel from "@/components/ListDetails/ListCarousel";
import { DurationOptionsSection } from "@/components/ListDetails/DurationOptionsSection";
import { TourPackageEnquiryForm } from "@/components/TourPackageEnquiryForm";
import { ChevronDown, ChevronUp, MapPin, Calendar, Package, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getPrimaryWhatsAppNumber, formatWhatsAppNumber } from "@/utils/whatsapp";

function TourPackagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const destination = searchParams.get("destination");
  const packageId = searchParams.get("package");

  const [list, setList] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [itineraryExpanded, setItineraryExpanded] = useState(false);
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const enquiryFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!destination) {
      setLoading(false);
      return;
    }
    if (packageId) {
      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/tour-packages/${encodeURIComponent(packageId)}`);
          if (res.ok) {
            const data = await res.json();
            setDetail(data.data);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    } else {
      const fetchList = async () => {
        try {
          const res = await fetch(`/api/tour-packages?destination=${encodeURIComponent(destination)}`);
          if (res.ok) {
            const data = await res.json();
            setList(data.data || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchList();
    }
  }, [destination, packageId]);

  const formatPrice = (price: number, curr: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: curr || "INR", maximumFractionDigits: 0 }).format(price);

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-[#E51A4B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose a destination</h1>
          <p className="text-gray-600 mb-6">Select a destination to view tour packages.</p>
          <Link
            href="/stay-listings"
            className="inline-block px-6 py-3 bg-[#E51A4B] text-white font-semibold rounded-lg hover:bg-[#c91742] transition-colors"
          >
            Browse destinations
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (packageId && !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Package not found</h1>
          <button
            onClick={() => router.push(`/tour-packages?destination=${encodeURIComponent(destination)}`)}
            className="mt-4 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            Back to packages
          </button>
        </div>
      </div>
    );
  }

  if (packageId && detail) {
    return (
      <div className="mx-0 pt-0 sm:pt-11 sm:mx-[10%] relative">
        <ListCarousel carouselImages={detail.carouselImages || []} coverImage={detail.coverImage} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{detail.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-600">
                {detail.destinationName && (
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {detail.destinationName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {detail.numberOfDays}D / {detail.numberOfNights}N
                </span>
              </div>
              <p className="text-xl font-bold text-[#E51A4B] mt-2">
                {formatPrice(detail.packagePrice, detail.currency)}
              </p>
              {detail.durationOptions?.length > 0 && (
                <DurationOptionsSection
                  options={detail.durationOptions}
                  selectedOptions={selectedDurations}
                  onSelectionChange={setSelectedDurations}
                />
              )}
              {detail.summary && (
                <p className="mt-6 text-gray-600 leading-relaxed">{detail.summary}</p>
              )}
              {detail.inclusions?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Inclusions</h2>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {detail.inclusions.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.exclusions?.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Exclusions</h2>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {detail.exclusions.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.tripHighlights?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Trip highlights</h2>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {detail.tripHighlights.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.detailedItinerary && (
                <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setItineraryExpanded(!itineraryExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Detailed itinerary</h2>
                    {itineraryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {itineraryExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                        {detail.detailedItinerary}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {detail.countrySpecificGuidelines && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setGuidelinesExpanded(!guidelinesExpanded)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <h2 className="text-lg font-semibold text-gray-900">Country-specific guidelines</h2>
                    {guidelinesExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {guidelinesExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                      <pre className="whitespace-pre-wrap text-gray-700 text-sm font-sans">
                        {detail.countrySpecificGuidelines}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:w-[360px] shrink-0" ref={enquiryFormRef} id="tour-package-enquiry-form">
              <div className="sticky top-20 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                {selectedDurations.length > 0 && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">
                      {selectedDurations.length} duration{selectedDurations.length !== 1 ? "s" : ""} selected
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {selectedDurations.join(", ")}
                    </p>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {detail.formType === "booking" ? "Booking" : detail.formType === "lead" ? "Lead" : "Enquiry"} form
                </h3>
                <TourPackageEnquiryForm
                  packageName={detail.name}
                  packagePrice={detail.packagePrice}
                  currency={detail.currency}
                  destination={detail.destinationName || detail.destinationSlug}
                  selectedDurationOptions={selectedDurations}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: fixed bottom enquiry CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg safe-area-pb">
          <div className="max-w-md mx-auto px-4 py-3">
            <button
              type="button"
              onClick={() => enquiryFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              <span>Send Enquiry</span>
            </button>
          </div>
        </div>
        {/* Spacer so content isn't hidden behind fixed bar on mobile */}
        <div className="h-20 md:hidden" aria-hidden="true" />
      </div>
    );
  }

  if (list.length === 0) {
    const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(getPrimaryWhatsAppNumber())}?text=${encodeURIComponent(
      `Hi Tripeloo! I'm interested in customized tour packages for ${destination ? decodeURIComponent(destination) : "my destination"}.`
    )}`;
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming soon</h1>
          <p className="text-gray-600 mb-6">
            Tour packages for this destination are on the way. Connect with our team for customized packages.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <FaWhatsapp className="w-5 h-5" />
            Connect on WhatsApp for customised packages
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-11 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tour packages</h1>
        <p className="text-gray-600 mb-8">Destination: {decodeURIComponent(destination)}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((pkg: any) => (
            <Link
              key={pkg.id}
              href={`/tour-packages?destination=${encodeURIComponent(destination)}&package=${encodeURIComponent(pkg.id)}`}
              className="group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative w-full h-48 bg-gray-100">
                {pkg.coverImage ? (
                  <Image
                    src={pkg.coverImage}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-[#E51A4B]">
                  {pkg.name}
                </h2>
                <p className="text-[#E51A4B] font-bold mt-2">
                  {formatPrice(pkg.packagePrice ?? 0, pkg.currency || "INR")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {pkg.numberOfDays}D / {pkg.numberOfNights}N
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TourPackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B]" />
        </div>
      }
    >
      <TourPackagesContent />
    </Suspense>
  );
}
