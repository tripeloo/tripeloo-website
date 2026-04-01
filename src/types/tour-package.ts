/**
 * Tour package entity and form types.
 */

export type TourPackageFormType = "booking" | "lead" | "enquiry";

export interface TourPackage {
  id: string;
  name: string;
  destinationSlug: string;
  coverImage: string;
  carouselImages?: { url: string; title?: string }[];
  summary?: string;
  // Pricing & duration
  packagePrice: number;
  currency: string;
  numberOfDays: number;
  numberOfNights: number;
  durationOptions: string[]; // multi-select from predefined e.g. ["3D/2N", "5D/4N"]
  // Content
  inclusions: string[];
  exclusions: string[];
  tripHighlights: string[]; // Key experiences and major attractions
  detailedItinerary: string; // formData/textarea
  countrySpecificGuidelines?: string;
  dmcDetails?: string;
  // Form to show on package page
  formType: TourPackageFormType;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Predefined duration options for multi-select in admin */
export const TOUR_PACKAGE_DURATION_OPTIONS = [
  "2D/1N",
  "3D/2N",
  "4D/3N",
  "5D/4N",
  "6D/5N",
  "7D/6N",
  "8D/7N",
  "10D/9N",
  "14D/13N",
  "Custom",
];
