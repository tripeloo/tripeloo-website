export interface GalleryImage {
  url: string;
  label: string;
}

function addImage(
  images: GalleryImage[],
  seen: Set<string>,
  url: string | undefined | null,
  label: string
) {
  if (!url || typeof url !== "string") return;
  const trimmed = url.trim();
  if (!trimmed || seen.has(trimmed)) return;
  seen.add(trimmed);
  images.push({ url: trimmed, label });
}

export function collectPropertyImages(
  item: {
    coverImage?: string;
    carouselImages?: string[] | Array<{ url: string; title?: string }>;
    rooms?: Array<{
      name?: string;
      thumb?: string;
      images?: string[];
    }>;
    packages?: Array<{
      name?: string;
      thumb?: string;
      images?: string[];
    }>;
  },
  itemType: "stay" | "activity" | "trip" | "tour-package",
  selectedRoomKeys?: string[],
  selectedPackageKeys?: string[]
): GalleryImage[] {
  const images: GalleryImage[] = [];
  const seen = new Set<string>();

  addImage(images, seen, item.coverImage, "Cover image");

  if (Array.isArray(item.carouselImages)) {
    item.carouselImages.forEach((img, i) => {
      const url = typeof img === "string" ? img : img?.url;
      const title =
        typeof img === "object" && img?.title ? img.title : `Gallery ${i + 1}`;
      addImage(images, seen, url, title);
    });
  }

  if (itemType === "stay" && Array.isArray(item.rooms)) {
    item.rooms.forEach((room, idx) => {
      const roomKey = room.name || `room-${idx}`;
      if (
        selectedRoomKeys &&
        selectedRoomKeys.length > 0 &&
        !selectedRoomKeys.includes(roomKey)
      ) {
        return;
      }
      const roomLabel = room.name || `Room ${idx + 1}`;
      addImage(images, seen, room.thumb, `${roomLabel} (thumbnail)`);
      if (Array.isArray(room.images)) {
        room.images.forEach((url, i) =>
          addImage(images, seen, url, `${roomLabel} - Photo ${i + 1}`)
        );
      }
    });
  }

  if (
    (itemType === "trip" || itemType === "tour-package") &&
    Array.isArray(item.packages)
  ) {
    item.packages.forEach((pkg, idx) => {
      const pkgKey = pkg.name || `package-${idx}`;
      if (
        selectedPackageKeys &&
        selectedPackageKeys.length > 0 &&
        !selectedPackageKeys.includes(pkgKey)
      ) {
        return;
      }
      const pkgLabel = pkg.name || `Package ${idx + 1}`;
      addImage(images, seen, pkg.thumb, `${pkgLabel} (thumbnail)`);
      if (Array.isArray(pkg.images)) {
        pkg.images.forEach((url, i) =>
          addImage(images, seen, url, `${pkgLabel} - Photo ${i + 1}`)
        );
      }
    });
  }

  return images;
}
