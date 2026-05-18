import type { GalleryImage } from "./collectPropertyImages";
import { formatWhatsAppNumber, getPrimaryWhatsAppNumber } from "@/utils/whatsapp";

export interface ShareDetailSection {
  id: string;
  heading: string;
  points: string[];
}

/** @deprecated Use buildImageShareCaption from sharePropertyImages for image shares */
export function buildImageShareMessage(
  itemName: string,
  destinationName: string,
  itemTypeLabel: string,
  _images: GalleryImage[]
): string {
  const lines: string[] = [
    `Hello! Sharing ${itemTypeLabel} details from Tripeloo:`,
    "",
    `${itemTypeLabel}: ${itemName}`,
  ];

  if (destinationName) {
    lines.push(`Destination: ${destinationName}`);
  }

  lines.push("", "— Tripeloo");
  return lines.join("\n").trim();
}

export function buildDetailsShareMessage(
  itemName: string,
  destinationName: string,
  itemTypeLabel: string,
  sections: ShareDetailSection[],
  extras?: {
    price?: string;
    location?: string;
    summary?: string;
    category?: string;
  }
): string {
  const lines: string[] = [
    `Hello! Sharing ${itemTypeLabel} information from Tripeloo:`,
    "",
    `${itemTypeLabel}: ${itemName}`,
  ];

  if (destinationName) lines.push(`Destination: ${destinationName}`);
  if (extras?.category) lines.push(`Category: ${extras.category}`);
  if (extras?.location) lines.push(`Location: ${extras.location}`);
  if (extras?.price) lines.push(`Price: ${extras.price}`);

  if (extras?.summary?.trim()) {
    lines.push("", "About:", extras.summary.trim());
  }

  const enabledSections = sections.filter((s) => s.points.length > 0);
  for (const section of enabledSections) {
    lines.push("", `${section.heading}:`);
    section.points.forEach((point) => {
      lines.push(`• ${point}`);
    });
  }

  lines.push("", "— Tripeloo");
  return lines.join("\n").trim();
}

export function openWhatsAppShare(message: string) {
  const phone = formatWhatsAppNumber(getPrimaryWhatsAppNumber());
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
