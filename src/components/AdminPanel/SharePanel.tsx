"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Share2,
  Loader2,
  Hotel,
  Activity,
  Plane,
  Package as PackageIcon,
  ImageIcon,
  List,
  Check,
  Copy,
  CheckSquare,
  Square,
} from "lucide-react";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import {
  collectPropertyImages,
  type GalleryImage,
} from "@/utils/collectPropertyImages";
import {
  buildDetailsShareMessage,
  openWhatsAppShare,
  type ShareDetailSection,
} from "@/utils/buildAdminShareMessage";
import {
  buildImageShareCaption,
  desktopFallbackShare,
  getSelectedFiles,
  isMobileShareDevice,
  prefetchImageFiles,
  shareFilesNow,
} from "@/utils/sharePropertyImages";

interface Destination {
  id: string;
  name: string;
  slug: string;
}

interface AdditionalDetail {
  heading: string;
  type: "description" | "points";
  description?: string;
  points?: string[];
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
    thumb?: string;
    images?: string[];
    highlights?: string[];
    price?: number;
    duration?: string;
  }>;
}

type ItemType = "stay" | "activity" | "trip" | "tour-package";
type ShareTab = "gallery" | "details";

function buildDetailSectionsFromItem(
  item: Item,
  itemType: ItemType,
  selectedRooms: string[],
  selectedPackages: string[]
): ShareDetailSection[] {
  const sections: ShareDetailSection[] = [];

  const highlights = item.properties?.filter((p) => p?.trim()) ?? [];
  if (highlights.length > 0) {
    sections.push({ id: "highlights", heading: "Highlights", points: highlights });
  }

  const includes = item.includes?.filter((p) => p?.trim()) ?? [];
  if (includes.length > 0) {
    sections.push({ id: "includes", heading: "Includes", points: includes });
  }

  const excludes = item.excludes?.filter((p) => p?.trim()) ?? [];
  if (excludes.length > 0) {
    sections.push({ id: "excludes", heading: "Excludes", points: excludes });
  }

  if (item.importantInfo?.trim()) {
    sections.push({
      id: "important",
      heading: "Good to know",
      points: item.importantInfo
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean),
    });
  }

  item.additionalDetails?.forEach((detail, idx) => {
    const heading = detail.heading?.trim();
    if (!heading) return;
    let points: string[] = [];
    if (detail.type === "points" && Array.isArray(detail.points)) {
      points = detail.points.filter((p) => p?.trim());
    } else if (detail.type === "description" && detail.description?.trim()) {
      points = detail.description
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
    }
    if (points.length > 0) {
      sections.push({ id: `additional-${idx}`, heading, points });
    }
  });

  if (itemType === "stay" && Array.isArray(item.rooms) && item.rooms.length > 0) {
    const roomPoints: string[] = [];
    item.rooms.forEach((room, idx) => {
      const roomKey = room.name || `room-${idx}`;
      if (selectedRooms.length > 0 && !selectedRooms.includes(roomKey)) return;
      const parts = [room.name || `Room ${idx + 1}`];
      if (room.rate) parts.push(`Rate: ${room.rate}`);
      if (room.features?.length) {
        parts.push(`Features: ${room.features.join(", ")}`);
      }
      roomPoints.push(parts.join(" — "));
    });
    if (roomPoints.length > 0) {
      sections.push({ id: "rooms", heading: "Rooms", points: roomPoints });
    }
  }

  if (
    (itemType === "trip" || itemType === "tour-package") &&
    Array.isArray(item.packages) &&
    item.packages.length > 0
  ) {
    const pkgPoints: string[] = [];
    item.packages.forEach((pkg, idx) => {
      const pkgKey = pkg.name || `package-${idx}`;
      if (selectedPackages.length > 0 && !selectedPackages.includes(pkgKey)) return;
      const parts = [pkg.name || `Package ${idx + 1}`];
      if (pkg.duration) parts.push(pkg.duration);
      if (pkg.price != null) parts.push(`₹${pkg.price.toLocaleString("en-IN")}`);
      if (pkg.highlights?.length) {
        parts.push(pkg.highlights.join(", "));
      }
      pkgPoints.push(parts.join(" — "));
    });
    if (pkgPoints.length > 0) {
      sections.push({
        id: "packages",
        heading: itemType === "trip" ? "Menu / dishes" : "Packages",
        points: pkgPoints,
      });
    }
  }

  return sections;
}

function itemTypeLabel(type: ItemType): string {
  if (type === "stay") return "Stay";
  if (type === "activity") return "Activity";
  if (type === "trip") return "Food spot";
  return "Tour package";
}

export default function SharePanel() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [itemType, setItemType] = useState<ItemType>("stay");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ShareTab>("gallery");
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set());
  const [enabledSectionIds, setEnabledSectionIds] = useState<Set<string>>(new Set());
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [copied, setCopied] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosReady, setPhotosReady] = useState(false);
  const [photoLoadProgress, setPhotoLoadProgress] = useState("");
  const [sharePrompt, setSharePrompt] = useState<{
    files: File[];
    caption: string;
  } | null>(null);
  const fileCacheRef = useRef<Map<string, File>>(new Map());

  const destinationName =
    destinations.find((d) => d.id === selectedDestination)?.name ?? "";

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch("/api/admin/destinations");
        const data = await res.json();
        if (data.data) setDestinations(data.data);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      }
    };
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (!selectedDestination) {
      setItems([]);
      setSelectedItem(null);
      return;
    }

    const fetchItems = async () => {
      setLoadingItems(true);
      try {
        const destinationSlug =
          destinations.find((d) => d.id === selectedDestination)?.slug ||
          selectedDestination;
        let endpoint = "";
        if (itemType === "stay") {
          endpoint = `/api/stays?destination=${encodeURIComponent(destinationSlug)}`;
        } else if (itemType === "activity") {
          endpoint = `/api/activities?destination=${encodeURIComponent(destinationSlug)}`;
        } else if (itemType === "trip") {
          endpoint = `/api/trips?destination=${encodeURIComponent(destinationSlug)}`;
        } else {
          endpoint = `/api/tour-packages?destination=${encodeURIComponent(destinationSlug)}`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();
        setItems(data.data && Array.isArray(data.data) ? data.data : []);
      } catch {
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [selectedDestination, itemType, destinations]);

  useEffect(() => {
    if (!selectedItemId) {
      setSelectedItem(null);
      return;
    }

    setSelectedItem(null);

    const fetchItemDetails = async () => {
      setLoading(true);
      try {
        let endpoint = "";
        if (itemType === "stay") {
          endpoint = `/api/stays/${encodeURIComponent(selectedItemId)}`;
        } else if (itemType === "activity") {
          endpoint = `/api/activities/${encodeURIComponent(selectedItemId)}`;
        } else if (itemType === "trip") {
          endpoint = `/api/trips/${encodeURIComponent(selectedItemId)}`;
        } else {
          endpoint = `/api/tour-packages/${encodeURIComponent(selectedItemId)}`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.data) {
          const normalizedItem: Item = {
            ...data.data,
            id: String(data.data.id || data.data._id || ""),
            includes: Array.isArray(data.data.includes)
              ? data.data.includes
              : Array.isArray(data.data.inclusions)
              ? data.data.inclusions
              : [],
            excludes: Array.isArray(data.data.excludes)
              ? data.data.excludes
              : Array.isArray(data.data.exclusions)
              ? data.data.exclusions
              : [],
            properties: Array.isArray(data.data.properties)
              ? data.data.properties
              : [],
            carouselImages: Array.isArray(data.data.carouselImages)
              ? data.data.carouselImages
              : [],
            rooms: Array.isArray(data.data.rooms) ? data.data.rooms : [],
            packages: Array.isArray(data.data.packages) ? data.data.packages : [],
          };

          if (String(normalizedItem.id) === String(selectedItemId)) {
            setSelectedItem(normalizedItem);
          }
        } else {
          setSelectedItem(null);
        }
      } catch {
        const item = items.find((i) => String(i.id) === String(selectedItemId));
        if (item) setSelectedItem({ ...item, id: String(item.id) });
        else setSelectedItem(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [selectedItemId, itemType, items]);

  useEffect(() => {
    setSelectedRooms([]);
    setSelectedPackages([]);
  }, [selectedItemId]);

  const allImages = useMemo(() => {
    if (!selectedItem) return [];
    return collectPropertyImages(
      selectedItem,
      itemType,
      selectedRooms,
      selectedPackages
    );
  }, [selectedItem, itemType, selectedRooms, selectedPackages]);

  const detailSections = useMemo(() => {
    if (!selectedItem) return [];
    return buildDetailSectionsFromItem(
      selectedItem,
      itemType,
      selectedRooms,
      selectedPackages
    );
  }, [selectedItem, itemType, selectedRooms, selectedPackages]);

  useEffect(() => {
    if (allImages.length > 0) {
      setSelectedImageUrls(new Set(allImages.map((img) => img.url)));
    } else {
      setSelectedImageUrls(new Set());
    }
  }, [allImages]);

  useEffect(() => {
    fileCacheRef.current = new Map();
    setPhotosReady(false);
    setPhotoLoadProgress("");

    if (allImages.length === 0) {
      setPhotosLoading(false);
      return;
    }

    let cancelled = false;
    setPhotosLoading(true);

    prefetchImageFiles(allImages, (loaded, total) => {
      if (!cancelled) {
        setPhotoLoadProgress(`${loaded}/${total}`);
      }
    })
      .then((cache) => {
        if (!cancelled) {
          fileCacheRef.current = cache;
          setPhotosReady(true);
          setPhotoLoadProgress("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPhotosReady(false);
          setPhotoLoadProgress("");
        }
      })
      .finally(() => {
        if (!cancelled) setPhotosLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allImages]);

  useEffect(() => {
    setEnabledSectionIds(new Set(detailSections.map((s) => s.id)));
    setIncludeSummary(true);
    setIncludePrice(true);
  }, [detailSections]);

  const selectedImages = allImages.filter((img) =>
    selectedImageUrls.has(img.url)
  );

  const enabledSections = detailSections.filter((s) =>
    enabledSectionIds.has(s.id)
  );

  const priceText =
    selectedItem?.startingPrice != null
      ? `From ${selectedItem.currency === "USD" ? "$" : "₹"}${selectedItem.startingPrice.toLocaleString("en-IN")}`
      : "";

  const summaryText = (selectedItem?.summary || selectedItem?.about || "").trim();

  const toggleImage = (url: string) => {
    setSelectedImageUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const selectAllImages = () => {
    setSelectedImageUrls(new Set(allImages.map((img) => img.url)));
  };

  const deselectAllImages = () => {
    setSelectedImageUrls(new Set());
  };

  const toggleSection = (id: string) => {
    setEnabledSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSections = (enable: boolean) => {
    if (enable) {
      setEnabledSectionIds(new Set(detailSections.map((s) => s.id)));
    } else {
      setEnabledSectionIds(new Set());
    }
  };

  const handleShareImages = () => {
    if (!selectedItem) return;
    if (selectedImages.length === 0) {
      alert("Please select at least one image to share.");
      return;
    }

    const files = getSelectedFiles(selectedImages, fileCacheRef.current);

    if (files.length !== selectedImages.length || !photosReady) {
      alert(
        photosLoading
          ? "Photos are still loading. Wait for “Ready to share”, then tap again."
          : "Could not load photos. Check your connection and try again."
      );
      return;
    }

    if (files.length > 30) {
      alert("Please select 30 images or fewer per share.");
      return;
    }

    const caption = buildImageShareCaption(
      selectedItem.name,
      destinationName,
      itemTypeLabel(itemType)
    );

    const result = shareFilesNow(files, caption);

    if (result.ok) return;

    if (result.reason === "blocked") return;

    if (isMobileShareDevice()) {
      setSharePrompt({ files, caption });
      return;
    }

    void desktopFallbackShare(files, caption);
  };

  const handleSharePromptTap = () => {
    if (!sharePrompt) return;
    const result = shareFilesNow(sharePrompt.files, sharePrompt.caption);
    if (result.ok) {
      setSharePrompt(null);
      return;
    }
    if (result.reason !== "blocked") {
      alert(result.message);
    }
  };

  const handleShareDetails = () => {
    if (!selectedItem) return;
    const message = buildDetailsShareMessage(
      selectedItem.name,
      destinationName,
      itemTypeLabel(itemType),
      enabledSections,
      {
        category: selectedItem.category,
        location: selectedItem.location,
        price: includePrice ? priceText : undefined,
        summary: includeSummary ? summaryText : undefined,
      }
    );
    const hasContent =
      enabledSections.length > 0 ||
      (includeSummary && !!summaryText) ||
      (includePrice && !!priceText);
    if (!hasContent) {
      alert("Please select at least one detail section to share.");
      return;
    }
    openWhatsAppShare(message);
  };

  const handleCopyCaption = async () => {
    if (!selectedItem) return;
    const caption = buildImageShareCaption(
      selectedItem.name,
      destinationName,
      itemTypeLabel(itemType)
    );
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showShareActions = selectedItem && !loading;

  return (
    <div className="container mx-auto p-4 text-white pb-28 md:pb-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
          <Share2 className="w-7 h-7 sm:w-8 sm:h-8" />
          WhatsApp Share
        </h1>
        <p className="text-white/80 text-sm sm:text-base">
          On your phone: wait for photos to load, tap Share, then pick WhatsApp — all images go
          together in one share.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 mb-4">
        <h2 className="text-lg font-semibold mb-4">Select property</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/90 mb-2">
            Destination <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedDestination}
            onChange={(e) => {
              setSelectedDestination(e.target.value);
              setSelectedItemId("");
              setSelectedItem(null);
            }}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B]"
          >
            <option value="">Select destination</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/90 mb-2">Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                { type: "stay" as const, icon: Hotel, label: "Stays" },
                { type: "activity" as const, icon: Activity, label: "Activities" },
                { type: "trip" as const, icon: Plane, label: "Food spots" },
                { type: "tour-package" as const, icon: PackageIcon, label: "Tours" },
              ] as const
            ).map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setItemType(type);
                  setSelectedItemId("");
                  setSelectedItem(null);
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  itemType === type
                    ? "bg-[#E51A4B] border-[#E51A4B] text-white"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {selectedDestination && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              {itemTypeLabel(itemType)} <span className="text-red-400">*</span>
            </label>
            {loadingItems ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-[#E51A4B]" size={24} />
              </div>
            ) : (
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B]"
              >
                <option value="">Select {itemTypeLabel(itemType).toLowerCase()}</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-white/70 py-2">
            <Loader2 className="animate-spin text-[#E51A4B]" size={20} />
            Loading property details…
          </div>
        )}

        {selectedItem &&
          itemType === "stay" &&
          selectedItem.rooms &&
          selectedItem.rooms.length > 0 && (
            <div className="mb-2">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Filter by room (optional)
              </label>
              <div className="max-h-32 overflow-y-auto bg-gray-800 rounded-lg p-3 border border-gray-600">
                {selectedItem.rooms.map((room, idx) => {
                  const roomKey = room.name || `room-${idx}`;
                  return (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(roomKey)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRooms([...selectedRooms, roomKey]);
                          } else {
                            setSelectedRooms(selectedRooms.filter((r) => r !== roomKey));
                          }
                        }}
                        className="w-4 h-4 text-[#E51A4B] rounded"
                      />
                      <span className="text-sm text-white/90">
                        {room.name || `Room ${idx + 1}`}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-white/60 mt-1">
                {selectedRooms.length === 0
                  ? "All rooms included"
                  : `${selectedRooms.length} room(s) selected`}
              </p>
            </div>
          )}
      </div>

      {showShareActions && (
        <>
          <div className="sticky top-16 z-20 mb-4 -mx-1 px-1">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-900/90 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab("gallery")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  activeTab === "gallery"
                    ? "bg-[#E51A4B] text-white shadow-md"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <ImageIcon size={20} />
                Image gallery
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  activeTab === "details"
                    ? "bg-[#E51A4B] text-white shadow-md"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <List size={20} />
                Text details
              </button>
            </div>
          </div>

          {activeTab === "gallery" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                  <p className="text-sm text-white/70">
                    {selectedImages.length} of {allImages.length} images selected
                  </p>
                  {photosLoading && (
                    <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                      <Loader2 className="animate-spin" size={12} />
                      Loading photos {photoLoadProgress ? `(${photoLoadProgress})` : "…"}
                    </p>
                  )}
                  {photosReady && !photosLoading && (
                    <p className="text-xs text-[#25D366] mt-1 flex items-center gap-1">
                      <Check size={12} />
                      Ready to share all together
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllImages}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <CheckSquare size={16} />
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllImages}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <Square size={16} />
                    Clear
                  </button>
                </div>
              </div>

              {allImages.length === 0 ? (
                <p className="text-white/60 text-center py-8">No images found for this property.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allImages.map((img) => {
                    const isSelected = selectedImageUrls.has(img.url);
                    return (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => toggleImage(img.url)}
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-[#25D366] ring-2 ring-[#25D366]/50"
                            : "border-gray-600 opacity-60"
                        }`}
                      >
                        <Image
                          src={optimizeCloudinaryUrl(img.url)}
                          alt={img.label}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                        <div
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-[#25D366]" : "bg-black/50"
                          }`}
                        >
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-xs text-white truncate">{img.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="hidden md:flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleShareImages}
                  disabled={
                    selectedImages.length === 0 || photosLoading || !photosReady
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {photosLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Share2 size={20} />
                  )}
                  {photosLoading
                    ? `Loading photos${photoLoadProgress ? ` (${photoLoadProgress})` : "…"}`
                    : `Share ${selectedImages.length} photo(s) together`}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  disabled={photosLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl disabled:opacity-50"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? "Copied" : "Caption"}
                </button>
              </div>

              <p className="text-xs text-white/50 mt-4 hidden md:block">
                Wait for “Ready to share”, then tap Share — your phone opens the share menu with
                all photos at once. Pick WhatsApp. Use Chrome or Safari on mobile.
              </p>
            </div>
          )}

          {activeTab === "details" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
                  <p className="text-sm text-white/70">Choose sections to include in the message</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllSections(true)}
                    className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAllSections(false)}
                    className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {summaryText && (
                  <label className="flex items-start gap-3 p-3 bg-gray-800/80 rounded-lg cursor-pointer hover:bg-gray-700/80">
                    <input
                      type="checkbox"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#E51A4B] rounded"
                    />
                    <div>
                      <span className="font-medium">About / summary</span>
                      <p className="text-sm text-white/60 mt-1 line-clamp-3">{summaryText}</p>
                    </div>
                  </label>
                )}
                {priceText && (
                  <label className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg cursor-pointer hover:bg-gray-700/80">
                    <input
                      type="checkbox"
                      checked={includePrice}
                      onChange={(e) => setIncludePrice(e.target.checked)}
                      className="w-4 h-4 text-[#E51A4B] rounded"
                    />
                    <span className="font-medium">Price — {priceText}</span>
                  </label>
                )}
              </div>

              {detailSections.length === 0 ? (
                <p className="text-white/60 text-center py-6">No detail sections available.</p>
              ) : (
                <div className="space-y-3">
                  {detailSections.map((section) => {
                    const enabled = enabledSectionIds.has(section.id);
                    return (
                      <label
                        key={section.id}
                        className={`block p-4 rounded-lg border cursor-pointer transition-all ${
                          enabled
                            ? "bg-gray-800/90 border-[#E51A4B]/50"
                            : "bg-gray-900/50 border-gray-700 opacity-70"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleSection(section.id)}
                            className="mt-1 w-4 h-4 text-[#E51A4B] rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold">{section.heading}</span>
                            <ul className="mt-2 space-y-1">
                              {section.points.map((point, i) => (
                                <li key={i} className="text-sm text-white/80 flex gap-2">
                                  <span className="text-[#E51A4B]">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={handleShareDetails}
                className="hidden md:flex w-full mt-6 items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-colors"
              >
                <Share2 size={20} />
                Share details on WhatsApp
              </button>
            </div>
          )}
        </>
      )}

      {sharePrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-gray-900 border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Share photos</h3>
            <p className="text-sm text-white/70 mb-5">
              Tap below to open the share menu with {sharePrompt.files.length} photo(s)
              together. Then choose WhatsApp.
            </p>
            <button
              type="button"
              onClick={handleSharePromptTap}
              className="w-full py-3.5 mb-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Open share menu
            </button>
            <button
              type="button"
              onClick={() => setSharePrompt(null)}
              className="w-full py-2.5 text-white/70 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showShareActions && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-gray-900/95 backdrop-blur-md border-t border-white/20 safe-area-pb">
          {activeTab === "gallery" ? (
            <div className="flex flex-col gap-2">
              {photosLoading && (
                <p className="text-xs text-amber-300 text-center flex items-center justify-center gap-1">
                  <Loader2 className="animate-spin" size={12} />
                  Loading photos {photoLoadProgress ? `(${photoLoadProgress})` : "…"}
                </p>
              )}
              {photosReady && !photosLoading && (
                <p className="text-xs text-[#25D366] text-center">
                  Ready — share opens all photos together
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShareImages}
                  disabled={
                    selectedImages.length === 0 || photosLoading || !photosReady
                  }
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white font-semibold rounded-xl"
                >
                  <Share2 size={22} />
                  Share {selectedImages.length} together
                </button>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  disabled={photosLoading}
                  className="p-3.5 bg-gray-800 border border-gray-600 rounded-xl disabled:opacity-50"
                  aria-label="Copy caption"
                >
                  {copied ? <Check size={22} /> : <Copy size={22} />}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleShareDetails}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl"
            >
              <Share2 size={22} />
              Share details on WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  );
}
