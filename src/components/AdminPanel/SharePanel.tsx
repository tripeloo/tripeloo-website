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
  Search,
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
  propertyName?: string;
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

function itemMatchesSearch(item: Item, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.name, item.propertyName, item.category, item.location]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function destinationMatchesSearch(dest: Destination, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [dest.name, dest.slug].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(q);
}

function formatSectionCopyText(section: ShareDetailSection): string {
  return `${section.heading}:\n${section.points.map((point) => `• ${point}`).join("\n")}`;
}

function CopyIconButton({
  text,
  copyKey,
  copiedKey,
  onCopy,
  showLabel = true,
  className = "",
}: {
  text: string;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (e: React.MouseEvent, text: string, key: string) => void;
  showLabel?: boolean;
  className?: string;
}) {
  const isCopied = copiedKey === copyKey;

  return (
    <button
      type="button"
      onClick={(e) => onCopy(e, text, copyKey)}
      className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#E51A4B] hover:bg-[#c91742] border border-white/25 rounded-lg shadow-md shrink-0 ${className}`}
      aria-label="Copy text"
      title="Copy to clipboard"
    >
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
      {showLabel && (isCopied ? "Copied" : "Copy")}
    </button>
  );
}

function ItemNameHeading({
  item,
  subtitle,
}: {
  item: Item;
  itemType: ItemType;
  subtitle?: string;
}) {
  const propertyName = item.propertyName?.trim();

  return (
    <div>
      <p className="text-lg font-semibold leading-snug">{item.name}</p>
      {propertyName && (
        <p className="text-sm text-amber-300/90 mt-0.5 leading-snug">{propertyName}</p>
      )}
      {subtitle && <p className="text-sm text-white/70 mt-1">{subtitle}</p>}
    </div>
  );
}

function ItemSearchListLabel({ item }: { item: Item }) {
  const propertyName = item.propertyName?.trim();

  return (
    <>
      <p className="font-medium text-white leading-snug">{item.name}</p>
      {propertyName && (
        <p className="text-sm text-amber-300/90 mt-0.5 leading-snug break-words">
          {propertyName}
        </p>
      )}
    </>
  );
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
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ShareTab>("gallery");
  const [selectedImageUrls, setSelectedImageUrls] = useState<Set<string>>(new Set());
  const [enabledSectionIds, setEnabledSectionIds] = useState<Set<string>>(new Set());
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [copied, setCopied] = useState(false);
  const [detailsCopied, setDetailsCopied] = useState(false);
  const [copiedTextKey, setCopiedTextKey] = useState<string | null>(null);
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

  const filteredDestinations = useMemo(
    () => destinations.filter((dest) => destinationMatchesSearch(dest, destinationSearchQuery)),
    [destinations, destinationSearchQuery]
  );

  const handleDestinationSelect = (destId: string) => {
    setSelectedDestination(destId);
    setSelectedItemId("");
    setSelectedItem(null);
    setItemSearchQuery("");
  };

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
        setItems(
          data.data && Array.isArray(data.data)
            ? data.data.map((item: Item) => ({
                ...item,
                id: String(item.id),
                propertyName: item.propertyName?.trim() || "",
              }))
            : []
        );
      } catch {
        setItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [selectedDestination, itemType, destinations]);

  const filteredItems = useMemo(
    () => items.filter((item) => itemMatchesSearch(item, itemSearchQuery)),
    [items, itemSearchQuery]
  );

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
            propertyName: data.data.propertyName?.trim() || "",
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
        if (item) {
          setSelectedItem({
            ...item,
            id: String(item.id),
            propertyName: item.propertyName || "",
          });
        } else setSelectedItem(null);
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

  const buildCurrentDetailsMessage = () => {
    if (!selectedItem) return "";
    return buildDetailsShareMessage(
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
  };

  const hasDetailsContent =
    enabledSections.length > 0 ||
    (includeSummary && !!summaryText) ||
    (includePrice && !!priceText);

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
    const message = buildCurrentDetailsMessage();
    if (!hasDetailsContent) {
      alert("Please select at least one detail section to share.");
      return;
    }
    openWhatsAppShare(message);
  };

  const handleCopyDetails = async () => {
    if (!selectedItem) return;
    const message = buildCurrentDetailsMessage();
    if (!hasDetailsContent) {
      alert("Please select at least one detail section to copy.");
      return;
    }
    await navigator.clipboard.writeText(message);
    setDetailsCopied(true);
    setTimeout(() => setDetailsCopied(false), 2000);
  };

  const handleCopyText = async (e: React.MouseEvent, text: string, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopiedTextKey(key);
    setTimeout(() => setCopiedTextKey(null), 2000);
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
          {destinations.length === 0 ? (
            <p className="text-sm text-white/60 p-3 bg-gray-800 rounded-lg border border-gray-600">
              Loading destinations…
            </p>
          ) : (
            <>
              <div className="relative mb-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="search"
                  value={destinationSearchQuery}
                  onChange={(e) => setDestinationSearchQuery(e.target.value)}
                  placeholder="Search destinations…"
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-white/50 mb-2">
                {filteredDestinations.length} of {destinations.length} destination
                {destinations.length !== 1 ? "s" : ""}
              </p>
              <div className="max-h-48 sm:max-h-56 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 divide-y divide-gray-700">
                {filteredDestinations.length === 0 ? (
                  <p className="text-sm text-white/60 p-4 text-center">
                    No matches for &ldquo;{destinationSearchQuery}&rdquo;
                  </p>
                ) : (
                  filteredDestinations.map((dest) => {
                    const isSelected = dest.id === selectedDestination;

                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleDestinationSelect(dest.id)}
                        className={`w-full text-left p-3 transition-colors flex items-start gap-3 ${
                          isSelected
                            ? "bg-[#E51A4B]/20 border-l-4 border-l-[#E51A4B]"
                            : "hover:bg-gray-700/80 border-l-4 border-l-transparent"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                            isSelected ? "bg-[#E51A4B]" : "bg-gray-600"
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white leading-snug">{dest.name}</p>
                          {dest.slug && dest.slug.toLowerCase() !== dest.name.toLowerCase() && (
                            <p className="text-xs text-white/50 mt-0.5 break-words">{dest.slug}</p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Type selector — stays only; activities, food spots, tours commented out
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
                  setItemSearchQuery("");
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
        */}

        {selectedDestination && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              {itemTypeLabel(itemType)} <span className="text-red-400">*</span>
            </label>
            {loadingItems ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-[#E51A4B]" size={24} />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-white/60 p-3 bg-gray-800 rounded-lg border border-gray-600">
                No {itemTypeLabel(itemType).toLowerCase()}s found for this destination.
              </p>
            ) : (
              <>
                <div className="relative mb-2">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="search"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search by display name or property name…"
                    className="w-full pl-10 pr-3 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-white/50 mb-2">
                  {filteredItems.length} of {items.length}{" "}
                  {itemTypeLabel(itemType).toLowerCase()}
                  {filteredItems.length !== 1 ? "s" : ""}
                  {" — property name shown under display name"}
                </p>
                <div className="max-h-64 sm:max-h-72 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800 divide-y divide-gray-700">
                  {filteredItems.length === 0 ? (
                    <p className="text-sm text-white/60 p-4 text-center">
                      No matches for &ldquo;{itemSearchQuery}&rdquo;
                    </p>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = String(item.id) === String(selectedItemId);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedItemId(String(item.id))}
                          className={`w-full text-left p-3 transition-colors flex items-start gap-3 ${
                            isSelected
                              ? "bg-[#E51A4B]/20 border-l-4 border-l-[#E51A4B]"
                              : "hover:bg-gray-700/80 border-l-4 border-l-transparent"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                              isSelected ? "bg-[#E51A4B]" : "bg-gray-600"
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <ItemSearchListLabel item={item} />
                            {item.category && (
                              <p className="text-xs text-white/50 mt-1">{item.category}</p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
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
                <span className="flex flex-col items-start leading-tight">
                  <span>Text details</span>
                  <span className="text-[10px] font-normal opacity-90">Copy lines here</span>
                </span>
              </button>
            </div>
          </div>

          {activeTab === "gallery" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <ItemNameHeading
                    item={selectedItem}
                    itemType={itemType}
                    subtitle={`${selectedImages.length} of ${allImages.length} images selected`}
                  />
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
                <ItemNameHeading
                  item={selectedItem}
                  itemType={itemType}
                  subtitle="Choose sections to include in the message"
                />
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

              <p className="text-xs sm:text-sm text-white/70 mb-4 bg-gray-800/60 border border-gray-600 rounded-lg px-3 py-2">
                Tap the red <strong className="text-white">Copy</strong> button on any line to copy that text.
              </p>

              <div className="space-y-3 mb-4">
                {summaryText && (
                  <div className="flex items-start gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
                    <input
                      type="checkbox"
                      checked={includeSummary}
                      onChange={(e) => setIncludeSummary(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#E51A4B] rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-medium">About / summary</span>
                        <CopyIconButton
                          text={summaryText}
                          copyKey="summary"
                          copiedKey={copiedTextKey}
                          onCopy={handleCopyText}
                        />
                      </div>
                      <p className="text-sm text-white/60 mt-1">{summaryText}</p>
                    </div>
                  </div>
                )}
                {priceText && (
                  <div className="flex items-center gap-3 p-3 bg-gray-800/80 rounded-lg border border-gray-700">
                    <input
                      type="checkbox"
                      checked={includePrice}
                      onChange={(e) => setIncludePrice(e.target.checked)}
                      className="w-4 h-4 text-[#E51A4B] rounded shrink-0"
                    />
                    <span className="font-medium flex-1 min-w-0">Price — {priceText}</span>
                    <CopyIconButton
                      text={priceText}
                      copyKey="price"
                      copiedKey={copiedTextKey}
                      onCopy={handleCopyText}
                    />
                  </div>
                )}
              </div>

              {detailSections.length === 0 ? (
                <p className="text-white/60 text-center py-6">No detail sections available.</p>
              ) : (
                <div className="space-y-3">
                  {detailSections.map((section) => {
                    const enabled = enabledSectionIds.has(section.id);
                    return (
                      <div
                        key={section.id}
                        className={`p-4 rounded-lg border transition-all ${
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
                            className="mt-1 w-4 h-4 text-[#E51A4B] rounded shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                              <span className="font-semibold">{section.heading}</span>
                              <CopyIconButton
                                text={formatSectionCopyText(section)}
                                copyKey={`section-${section.id}`}
                                copiedKey={copiedTextKey}
                                onCopy={handleCopyText}
                              />
                            </div>
                            <ul className="space-y-2">
                              {section.points.map((point, i) => (
                                <li
                                  key={i}
                                  className="text-sm text-white/80 flex items-start gap-2 p-2 rounded-lg bg-black/20 border border-gray-700/60"
                                >
                                  <span className="text-[#E51A4B] shrink-0 mt-0.5">•</span>
                                  <span className="flex-1 min-w-0 break-words">{point}</span>
                                  <CopyIconButton
                                    text={point}
                                    copyKey={`${section.id}-${i}`}
                                    copiedKey={copiedTextKey}
                                    onCopy={handleCopyText}
                                    className="mt-0.5"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="hidden md:flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleShareDetails}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-colors"
                >
                  <Share2 size={20} />
                  Share details on WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl"
                  aria-label="Copy share message"
                  title="Copy full share message"
                >
                  {detailsCopied ? <Check size={18} /> : <Copy size={18} />}
                  {detailsCopied ? "Copied" : "Copy message"}
                </button>
              </div>
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareDetails}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl"
              >
                <Share2 size={22} />
                Share details on WhatsApp
              </button>
              <button
                type="button"
                onClick={handleCopyDetails}
                className="p-3.5 bg-gray-800 border border-gray-600 rounded-xl"
                aria-label="Copy share message"
                title="Copy full share message"
              >
                {detailsCopied ? <Check size={22} /> : <Copy size={22} />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
