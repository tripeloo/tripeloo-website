import type { GalleryImage } from "./collectPropertyImages";
import { optimizeCloudinaryUrl } from "./cloudinary";
import { openWhatsAppShare } from "./buildAdminShareMessage";

const MAX_IMAGES_PER_SHARE = 30;

export function isMobileShareDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(ua) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  );
}

export function canUseNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof window !== "undefined" &&
    window.isSecureContext
  );
}

function sanitizeFilename(label: string, index: number, ext: string): string {
  const base =
    label
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 48) || `image-${index + 1}`;
  return `${base}.${ext}`;
}

export function buildImageShareCaption(
  itemName: string,
  destinationName: string,
  itemTypeLabel: string
): string {
  const lines = [
    `Hello! Sharing ${itemTypeLabel} photos from Tripeloo:`,
    "",
    `${itemTypeLabel}: ${itemName}`,
  ];
  if (destinationName) lines.push(`Destination: ${destinationName}`);
  lines.push("", "— Tripeloo");
  return lines.join("\n");
}

export async function fetchImageAsFile(
  img: GalleryImage,
  index: number
): Promise<File> {
  const url = optimizeCloudinaryUrl(img.url);
  const proxyUrl = `/api/admin/proxy-image?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);

  if (!res.ok) {
    throw new Error(`Could not load: ${img.label}`);
  }

  const blob = await res.blob();
  const type =
    blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  const ext =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";

  return new File([blob], sanitizeFilename(img.label, index, ext), { type });
}

/** Preload all gallery images as File objects (run in background before share tap). */
export async function prefetchImageFiles(
  images: GalleryImage[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, File>> {
  const cache = new Map<string, File>();
  const total = images.length;

  await Promise.all(
    images.map(async (img, index) => {
      const file = await fetchImageAsFile(img, index);
      cache.set(img.url, file);
      onProgress?.(cache.size, total);
    })
  );

  return cache;
}

export function getSelectedFiles(
  images: GalleryImage[],
  cache: Map<string, File>
): File[] {
  return images
    .map((img) => cache.get(img.url))
    .filter((file): file is File => file instanceof File);
}

export type ShareFilesResult =
  | { ok: true; method: "native" }
  | { ok: false; reason: "unsupported" | "blocked" | "failed"; message: string };

/**
 * Must be called synchronously inside a click/tap handler (no await before this).
 * Opens the OS share sheet with all images together.
 */
export function shareFilesNow(files: File[], caption: string): ShareFilesResult {
  if (files.length === 0) {
    return { ok: false, reason: "failed", message: "No images ready to share." };
  }

  if (!canUseNativeShare()) {
    return {
      ok: false,
      reason: "unsupported",
      message: isMobileShareDevice()
        ? "Sharing needs HTTPS and a supported browser (Chrome or Safari)."
        : "Your browser cannot share files directly. Use a phone or download the images.",
    };
  }

  const attempts: ShareData[] = [
    { files },
    { files, title: "Tripeloo property photos" },
    { files, text: caption },
    { files, title: "Tripeloo property photos", text: caption },
  ];

  for (const data of attempts) {
    try {
      if (navigator.canShare && !navigator.canShare(data)) {
        continue;
      }
      void navigator.share(data);
      return { ok: true, method: "native" };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false, reason: "blocked", message: "Share cancelled." };
      }
    }
  }

  try {
    void navigator.share({ files });
    return { ok: true, method: "native" };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Could not open share menu. Try Chrome or Safari on your phone.";
    return { ok: false, reason: "failed", message };
  }
}

export async function downloadFiles(files: File[]): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const url = URL.createObjectURL(files[i]);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = files[i].name;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    if (i < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
}

export async function desktopFallbackShare(
  files: File[],
  caption: string
): Promise<void> {
  await downloadFiles(files);
  openWhatsAppShare(
    `${caption}\n\n📎 ${files.length} image(s) saved to your device — attach them in WhatsApp.`
  );
}
