"use client";

import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  getPrimaryWhatsAppNumber,
  getRandomStayCardWhatsAppNumber,
  formatWhatsAppNumber,
} from "@/utils/whatsapp";

export function buildStayBookingWhatsAppMessage(
  stayName: string,
  location: string
): string {
  return `Hi Tripeloo! I would like to book ${stayName} in ${location}. Please share availability and details.`;
}

interface StayCardActionsProps {
  stayName: string;
  location: string;
  onFormClick: (e: React.MouseEvent) => void;
  className?: string;
}

const PHONE_HREF = `tel:${getPrimaryWhatsAppNumber().replace(/[\s\-]/g, "")}`;

export function StayCardActions({
  stayName,
  location,
  onFormClick,
  className = "",
}: StayCardActionsProps) {
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phone = formatWhatsAppNumber(getRandomStayCardWhatsAppNumber());
    const text = encodeURIComponent(
      buildStayBookingWhatsAppMessage(stayName, location)
    );
    window.open(
      `https://wa.me/${phone}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className={`mt-3 pt-3 border-t border-gray-100 ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={handleWhatsAppClick}
        className="md:hidden w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-semibold transition-colors"
      >
        <FaWhatsapp className="w-5 h-5 flex-shrink-0" />
        Book through WhatsApp
      </button>

      <div className="hidden md:flex items-center gap-2">
        <a
          href={PHONE_HREF}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-[#E51A4B] hover:text-white transition-colors shrink-0"
          aria-label="Call Tripeloo"
        >
          <Phone className="w-5 h-5" />
        </a>
        <button
          type="button"
          onClick={onFormClick}
          className="flex-1 min-w-0 py-2.5 px-3 rounded-xl bg-[#E51A4B] hover:bg-[#c91742] text-white text-sm font-semibold transition-colors text-center"
        >
          Connect with Tripeloo buddy
        </button>
      </div>
    </div>
  );
}
