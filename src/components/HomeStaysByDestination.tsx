"use client";

import { DestinationStaysSection } from "@/components/DestinationStaysSection";

const HOME_STAY_DESTINATIONS = [
  { slug: "wayanad", name: "Wayanad" },
  { slug: "munnar", name: "Munnar" },
  { slug: "ooty", name: "Ooty" },
  { slug: "kodaikanal", name: "Kodaikanal" },
] as const;

export function HomeStaysByDestination() {
  return (
    <section className="mt-4 sm:mt-6 bg-gradient-to-b from-gray-50/30 to-white">
      {HOME_STAY_DESTINATIONS.map((destination) => (
        <DestinationStaysSection
          key={destination.slug}
          destinationSlug={destination.slug}
          destinationName={destination.name}
          compact
        />
      ))}
    </section>
  );
}
