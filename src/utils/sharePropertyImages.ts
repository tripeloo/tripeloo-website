import type { GalleryImage } from "./collectPropertyImages";
import { optimizeCloudinaryUrl } from "./cloudinary";
import { openWhatsAppShare } from "./buildAdminShareMessage";

const MAX_IMAGES_PER_SHARE = 30;

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
  index: number,
  onProgress?: (current: number, total: number) => void
): Promise<File> {
  const url = optimizeCloudinaryUrl(img.url);
  const proxyUrl = `/api/admin/proxy-image?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);

  if (!res.ok) {
    throw new Error(`Could not load: ${img.label}`);
  }

  const blob = await res.blob();
  const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";

  onProgress?.(index + 1, 0);

  return new File([blob], sanitizeFilename(img.label, index, ext), { type });
}

export async function fetchImagesAsFiles(
  images: GalleryImage[],
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const files: File[] = [];
  const total = images.length;

  for (let i = 0; i < images.length; i++) {
    onProgress?.(i, total);
    const file = await fetchImageAsFile(images[i], i);
    files.push(file);
    onProgress?.(i + 1, total);
  }

  return files;
}

function canShareFiles(files: File[], text: string): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  const data: ShareData = { files, text };
  return navigator.canShare ? navigator.canShare(data) : files.length > 0;
}

async function downloadFiles(files: File[]): Promise<void> {
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
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
}

export type ShareImagesResult = "native" | "download-fallback";

export async function shareImagesToWhatsApp(
  images: GalleryImage[],
  caption: string,
  onProgress?: (current: number, total: number, phase: "loading" | "sharing") => void
): Promise<ShareImagesResult> {
  if (images.length === 0) {
    throw new Error("No images selected");
  }

  if (images.length > MAX_IMAGES_PER_SHARE) {
    throw new Error(
      `Please select ${MAX_IMAGES_PER_SHARE} images or fewer. WhatsApp limits how many photos can be shared at once.`
    );
  }

  onProgress?.(0, images.length, "loading");
  const files = await fetchImagesAsFiles(images, (current, total) =>
    onProgress?.(current, total, "loading")
  );

  onProgress?.(images.length, images.length, "sharing");

  const shareData: ShareData = {
    files,
    text: caption,
    title: caption.split("\n")[0] || "Property photos",
  };

  if (canShareFiles(files, caption)) {
    try {
      await navigator.share(shareData);
      return "native";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
    }
  }

  await downloadFiles(files);
  openWhatsAppShare(
    `${caption}\n\n📎 ${files.length} image(s) were saved to your device — please attach them in WhatsApp.`
  );
  return "download-fallback";
}
