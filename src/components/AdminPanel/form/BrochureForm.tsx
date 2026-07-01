"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, FileText, Image as ImageIcon, MapPin, Hotel, Activity, Plane, Package as PackageIcon, Star, Check, Users, Hourglass, Clock1, Smartphone, PawPrint, BookA, Dot, Eye } from "lucide-react";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";

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

interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  createdAt: Date | string;
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
  originalPrice?: number;
  price?: number;
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
    duration?: string;
    price?: number;
    thumb?: string;
    images?: string[];
    highlights?: string[];
  }>;
  activityDetails?: {
    ages?: string;
    duration?: string;
    startTime?: string;
    mobileTicket?: boolean;
    animalWelfare?: boolean;
    liveGuide?: boolean | string;
    maxGroupSize?: number;
  };
  destinationName?: string;
}

export default function BrochureForm() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [itemType, setItemType] = useState<"stay" | "activity" | "trip" | "tour-package">("stay");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [customContent, setCustomContent] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]); // Array of room names/indices
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]); // Array of package names/indices
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch("/api/admin/destinations");
        const data = await res.json();
        if (data.data) {
          setDestinations(data.data);
        }
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
        const destinationSlug = destinations.find((d) => d.id === selectedDestination)?.slug || selectedDestination;
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
        if (data.data && Array.isArray(data.data)) {
          setItems(data.data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Error fetching items:", error);
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

    // Clear selectedItem immediately to prevent showing stale rooms/packages from previous stay/restaurant/cafe
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
          // Process rooms - be more lenient with filtering
          let processedRooms: any[] = [];
          if (Array.isArray(data.data.rooms)) {
            processedRooms = data.data.rooms
              .filter((room: any) => {
                // More lenient filter - keep room if it's an object and has name OR id OR is not null/undefined
                return room && typeof room === 'object' && (room.name || room.id || Object.keys(room).length > 0);
              });
          }
          
          const normalizedItem = {
            ...data.data,
            id: String(data.data.id || data.data._id || ''), // Ensure ID is always a string
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
            location: data.data.location || data.data.destinationName || "",
            properties: Array.isArray(data.data.properties)
              ? data.data.properties
              : Array.isArray(data.data.tripHighlights)
              ? data.data.tripHighlights
              : [],
            carouselImages: Array.isArray(data.data.carouselImages)
              ? data.data.carouselImages
                  .map((img: any) => {
                    // Normalize image to string
                    if (typeof img === 'string') return img;
                    if (img && typeof img === 'object' && img.url) return String(img.url);
                    return null;
                  })
                  .filter((img: string | null): img is string => 
                    img !== null && typeof img === 'string' && img.trim() !== ""
                  )
              : [],
            // Use processed rooms array - normalize room images too
            rooms: processedRooms.map((room: any) => ({
              ...room,
              // Ensure images array contains only valid strings
              images: Array.isArray(room.images)
                ? room.images
                    .map((img: any) => {
                      if (typeof img === 'string') return img;
                      if (img && typeof img === 'object' && img.url) return String(img.url);
                      return null;
                    })
                    .filter((img: string | null): img is string => 
                      img !== null && typeof img === 'string' && img.trim() !== ""
                    )
                : (room.thumb ? [String(room.thumb)] : []),
              // Ensure thumb is a string
              thumb: room.thumb ? String(room.thumb) : '',
              // Ensure features array contains only strings
              features: Array.isArray(room.features)
                ? room.features
                    .map((f: any) => typeof f === 'string' ? f : String(f || ''))
                    .filter((f: string) => f.trim() !== '')
                : [],
            })),
          };
          
          // Only set if the selectedItemId hasn't changed during fetch - use string comparison
          if (String(normalizedItem.id) === String(selectedItemId)) {
            setSelectedItem(normalizedItem);
          }
        } else {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        const item = items.find((i) => String(i.id) === String(selectedItemId));
        // Only set if the item ID matches - use string comparison
        if (item && String(item.id) === String(selectedItemId)) {
          setSelectedItem({
            ...item,
            id: String(item.id), // Ensure ID is string
            rooms: Array.isArray(item.rooms) ? item.rooms : [],
          });
        } else {
          setSelectedItem(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [selectedItemId, itemType, items]);

  // Reset room/package selections and clear selectedItem when item changes
  // Reset room/package selections when item changes
  useEffect(() => {
    setSelectedRooms([]);
    setSelectedPackages([]);
  }, [selectedItemId]);

  useEffect(() => {
    if (!selectedItemId || !itemType || itemType === "tour-package") {
      setReviews([]);
      return;
    }

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await fetch(`/api/reviews?itemId=${encodeURIComponent(selectedItemId)}&itemType=${itemType}`);
        if (res.ok) {
          const data = await res.json();
          const reviewsData = (data.data || []).slice(0, 4);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [selectedItemId, itemType]);

  const handleGeneratePDF = async () => {
    if (!previewRef.current || !selectedItem) return;

    setGeneratingPDF(true);
    let pdfContainer: HTMLDivElement | null = null;
    
    try {
      // Convert 210mm to pixels (1mm ≈ 3.779527559 pixels at 96 DPI)
      const mmToPx = 3.779527559;
      const containerWidthPx = 210 * mmToPx; // ~794px
      
      // Create a clean container for PDF generation with fixed dimensions
      pdfContainer = document.createElement("div");
      pdfContainer.style.width = `${containerWidthPx}px`;
      pdfContainer.style.minWidth = `${containerWidthPx}px`;
      pdfContainer.style.maxWidth = `${containerWidthPx}px`;
      pdfContainer.style.padding = "20mm";
      pdfContainer.style.backgroundColor = "#ffffff";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.color = "#000000";
      pdfContainer.style.position = "absolute";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "0";
      pdfContainer.style.zIndex = "-1";
      pdfContainer.style.display = "block";
      document.body.appendChild(pdfContainer);

      // Clone the preview content
      const clonedContent = previewRef.current.cloneNode(true) as HTMLElement;
      
      // Remove any existing styles that might interfere
      clonedContent.removeAttribute("style");
      clonedContent.style.maxHeight = "none";
      clonedContent.style.overflow = "visible";
      clonedContent.style.width = "100%";
      clonedContent.style.minWidth = "100%";
      clonedContent.style.backgroundColor = "#ffffff";
      clonedContent.style.color = "#000000";
      
      // Fix all images to maintain their aspect ratio and explicit dimensions
      const allImages = clonedContent.querySelectorAll("img");
      let logoIndex = 0;
      allImages.forEach((img) => {
        const htmlImg = img as HTMLImageElement;
        if (htmlImg.alt && htmlImg.alt.toLowerCase().includes("logo")) {
          // First logo (top) - larger
          if (logoIndex === 0) {
            htmlImg.style.width = "200px";
            htmlImg.style.height = "80px";
            htmlImg.style.minWidth = "200px";
            htmlImg.style.maxWidth = "200px";
            htmlImg.style.minHeight = "64px";
            htmlImg.style.maxHeight = "80px";
            htmlImg.style.objectFit = "contain";
            htmlImg.style.display = "block";
            htmlImg.setAttribute("width", "200");
            htmlImg.setAttribute("height", "80");
            logoIndex++;
          } 
          // Second logo (bottom) - smaller
          else {
            htmlImg.style.width = "150px";
            htmlImg.style.height = "60px";
            htmlImg.style.minWidth = "150px";
            htmlImg.style.maxWidth = "150px";
            htmlImg.style.minHeight = "48px";
            htmlImg.style.maxHeight = "60px";
            htmlImg.style.objectFit = "contain";
            htmlImg.style.display = "block";
            htmlImg.setAttribute("width", "150");
            htmlImg.setAttribute("height", "60");
          }
        }
        // Ensure all images load properly and have explicit dimensions
        if (!htmlImg.complete) {
          htmlImg.style.display = "block";
        }
        // Remove any responsive classes that might affect sizing
        htmlImg.classList.remove("w-auto", "h-auto");
      });
      
      // Remove scroll-related classes and styles
      clonedContent.classList.remove("max-h-[80vh]", "overflow-y-auto");
      
      // Create comprehensive stylesheet to fix all styling issues
      const style = document.createElement("style");
      style.textContent = `
        * { 
          box-sizing: border-box !important;
        }
        body, html {
          margin: 0 !important;
          padding: 0 !important;
        }
        img { 
          max-width: 100% !important; 
          height: auto !important; 
          display: block !important;
          page-break-inside: avoid !important;
        }
        /* Fix logo sizes - ensure they don't collapse */
        img[alt*="Logo"], img[alt*="logo"] {
          object-fit: contain !important;
          display: block !important;
        }
        /* Top logo - first occurrence */
        img[alt*="Logo"]:first-of-type, img[alt*="logo"]:first-of-type {
          width: 200px !important;
          height: 80px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          min-height: 64px !important;
          max-height: 80px !important;
        }
        /* Bottom logo - second occurrence */
        img[alt*="Logo"]:nth-of-type(2), img[alt*="logo"]:nth-of-type(2) {
          width: 150px !important;
          height: 60px !important;
          min-width: 150px !important;
          max-width: 150px !important;
          min-height: 48px !important;
          max-height: 60px !important;
        }
        .text-white { color: #000 !important; }
        .text-gray-900 { color: #000 !important; }
        .text-gray-800 { color: #000 !important; }
        .text-gray-700 { color: #333 !important; }
        .text-gray-600 { color: #666 !important; }
        .text-gray-500 { color: #888 !important; }
        .text-gray-400 { color: #999 !important; }
        /* Force all backgrounds to white */
        .bg-white, .bg-gray-50, .bg-gray-100, .bg-gray-200, .bg-gray-300, .bg-gray-400, 
        .bg-gray-500, .bg-gray-600, .bg-gray-700, .bg-gray-800, .bg-gray-900,
        .bg-red-50, .bg-red-100, .bg-red-200,
        [class*="bg-gray"], [class*="bg-red"] {
          background: #fff !important;
          background-color: #fff !important;
        }
        /* Remove any inline background colors that might be gray */
        div, section, article, aside, main, header, footer {
          background-color: #fff !important;
        }
        /* Keep specific colored backgrounds only for brand colors */
        .bg-\\[\\#E51A4B\\], [style*="background"][style*="#E51A4B"] {
          background: #E51A4B !important;
        }
        .border-gray-200 { border-color: #ddd !important; }
        .border-gray-600 { border-color: #999 !important; }
        .text-[#E51A4B] { color: #E51A4B !important; }
        .text-emerald-600 { color: #059669 !important; }
        .text-green-600 { color: #16a34a !important; }
        /* Page break rules - Enhanced */
        section, .bg-red-50, .rounded-lg, .rounded-2xl, .border-t-2 {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          page-break-after: auto !important;
        }
        h1, h2, h3, h4, h5, h6 {
          page-break-after: avoid !important;
          break-after: avoid !important;
          page-break-inside: avoid !important;
          page-break-before: auto !important;
        }
        div, p {
          page-break-inside: avoid !important;
          orphans: 4 !important;
          widows: 4 !important;
        }
        /* Prevent breaking within lists and grids */
        ul, ol {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        li {
          page-break-inside: avoid !important;
        }
        /* Keep sections together */
        .mb-6, .mt-8, .mt-6, .mb-10, .mt-10 {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Prevent breaking in grid layouts */
        .grid {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        /* Keep footer together */
        .border-t-2 {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          page-break-before: auto !important;
        }
      `;
      
      // Insert style at the beginning
      clonedContent.insertBefore(style, clonedContent.firstChild);
      
      // Append to container
      pdfContainer.appendChild(clonedContent);

      // Wait for images to load and styles to apply
      // Force all images to load before capturing - Increased timeout for multiple rooms
      const images = pdfContainer.querySelectorAll("img");
      const imageCount = images.length;
      
      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise<void>((resolve) => {
          const htmlImg = img as HTMLImageElement;
          
          // Check if image is already loaded
          if (htmlImg.complete && htmlImg.naturalWidth > 0) {
            resolve();
            return;
          }
          
          // Set up load handler
          const loadHandler = () => {
            if (htmlImg.complete && htmlImg.naturalWidth > 0) {
              resolve();
            }
          };
          
          // Set up error handler - continue even if image fails
          const errorHandler = () => {
            resolve(); // Continue even on error
          };
          
          htmlImg.onload = loadHandler;
          htmlImg.onerror = errorHandler;
          
          // Increase timeout for multiple images (10 seconds per image, but max 30 seconds total)
          const timeoutDuration = Math.min(10000, Math.max(5000, 30000 / imageCount));
          setTimeout(() => {
            resolve(); // Continue even on timeout
          }, timeoutDuration);
          
          // Force reload if needed
          if (htmlImg.src && !htmlImg.complete) {
            const originalSrc = htmlImg.src;
            htmlImg.src = '';
            htmlImg.src = originalSrc;
          }
        });
      });
      
      // Wait for all images with progress tracking
      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Error loading images:', error);
        // Continue anyway - some images might have loaded
      }
      
      // Additional wait for styles and layout to stabilize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force recalculation of container dimensions after all content is loaded
      // This ensures we capture the full height including all images and content
      pdfContainer.style.height = 'auto';
      pdfContainer.style.minHeight = 'auto';
      pdfContainer.style.maxHeight = 'none';
      
      // Wait a bit more for layout recalculation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate canvas with optimized settings for better performance
      // Use fixed dimensions instead of viewport-based
      const containerWidth = pdfContainer.offsetWidth || containerWidthPx;
      
      // Force layout recalculation to get accurate height
      pdfContainer.style.height = 'auto';
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Use scrollHeight to ensure we capture ALL content, add generous buffer
      const measuredHeight = Math.max(
        pdfContainer.scrollHeight || 0,
        pdfContainer.offsetHeight || 0,
        clonedContent.scrollHeight || 0,
        clonedContent.offsetHeight || 0
      );
      
      // Add buffer: 200px for safety, or 10% of content height, whichever is larger
      const buffer = Math.max(200, measuredHeight * 0.1);
      const containerHeight = measuredHeight + buffer;
      
      // Adaptive scale and timeout based on image count
      // More images = lower scale for performance, longer timeout
      const scale = imageCount > 20 ? 1.0 : imageCount > 10 ? 1.1 : 1.2;
      const imageTimeout = Math.min(60000, Math.max(15000, imageCount * 3000)); // More generous timeout
      
      const canvas = await html2canvas(pdfContainer, {
        scale: scale, // Adaptive scale for performance with many images
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: false,
        imageTimeout: imageTimeout, // More generous timeout for multiple images
        removeContainer: false,
        width: containerWidth,
        height: containerHeight,
        windowWidth: containerWidth,
        windowHeight: containerHeight,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          // Skip rendering certain elements that might slow down generation
          const htmlElement = element as HTMLElement;
          return htmlElement.classList?.contains('hidden') || 
                 (htmlElement.style && htmlElement.style.display === 'none') ||
                 htmlElement.getAttribute('aria-hidden') === 'true';
        },
        onclone: (clonedDoc, element) => {
          // Ensure the cloned container has proper height
          const clonedContainer = clonedDoc.body.firstChild as HTMLElement;
          if (clonedContainer) {
            clonedContainer.style.height = 'auto';
            clonedContainer.style.minHeight = 'auto';
            clonedContainer.style.maxHeight = 'none';
            clonedContainer.style.overflow = 'visible';
            clonedContainer.style.backgroundColor = '#ffffff';
          }
          
          // Force all elements with gray/red backgrounds to white
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Check class-based backgrounds
            if (htmlEl.className && typeof htmlEl.className === 'string') {
              const className = htmlEl.className;
              if (className.includes('bg-gray') || 
                  className.includes('bg-red-50') || 
                  className.includes('bg-red-100') ||
                  className.includes('bg-red-200')) {
                htmlEl.style.backgroundColor = '#ffffff';
                htmlEl.style.background = '#ffffff';
              }
            }
            // Check inline styles
            if (htmlEl.style.backgroundColor) {
              const bgColor = htmlEl.style.backgroundColor.toLowerCase();
              if (bgColor.includes('gray') || 
                  bgColor.includes('rgb(249') || // gray-50
                  bgColor.includes('rgb(243') || // gray-100
                  bgColor.includes('rgb(229') || // gray-200
                  bgColor.includes('rgb(254, 242') || // red-50
                  bgColor.includes('#f9f9f9') ||
                  bgColor.includes('#f5f5f5') ||
                  bgColor.includes('#eee') ||
                  bgColor.includes('#fef2f2')) {
                htmlEl.style.backgroundColor = '#ffffff';
                htmlEl.style.background = '#ffffff';
              }
            }
          });
          
          // Ensure all images are loaded and optimize
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            const htmlImg = img as HTMLImageElement;
            // Only hide if image is truly not loaded after our wait
            if (!htmlImg.complete || htmlImg.naturalWidth === 0) {
              // Try to ensure image loads
              if (htmlImg.src && !htmlImg.src.startsWith('data:')) {
                htmlImg.loading = 'eager';
              }
            }
            // Ensure images have proper dimensions
            if (htmlImg.complete && htmlImg.naturalWidth > 0) {
              htmlImg.style.display = 'block';
            }
          });
        },
      });

      // Use adaptive quality based on image count to prevent crashes
      const quality = imageCount > 20 ? 0.75 : imageCount > 10 ? 0.80 : 0.85;
      const imgData = canvas.toDataURL("image/jpeg", quality);
      
      // Calculate dimensions for single page PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Ensure we have enough height - add generous buffer to prevent cutoff
      // Add 50mm buffer (25mm top + 25mm bottom) to ensure last section is included
      const finalPdfHeight = Math.max(imgHeight + 50, 297); // Min A4 height
      
      // Create PDF with custom height to fit entire content (single page)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [210, finalPdfHeight] // Width 210mm (A4 width), height based on content + margins
      });

      // Add image to single page - ensure full image is included
      try {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        // Try with lower quality if it fails
        const fallbackData = canvas.toDataURL("image/jpeg", 0.7);
        pdf.addImage(fallbackData, "JPEG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      }

      // Clean up
      if (pdfContainer && pdfContainer.parentNode) {
        document.body.removeChild(pdfContainer);
      }
      
      const fileName = selectedItem
        ? `${selectedItem.name.replace(/[^a-z0-9]/gi, "_")}_brochure.pdf`
        : "brochure.pdf";
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Clean up on error
      try {
        if (pdfContainer && pdfContainer.parentNode) {
          document.body.removeChild(pdfContainer);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up PDF container:", cleanupError);
      }
      
      // Provide more helpful error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timeout") || errorMessage.includes("Timeout")) {
        alert("PDF generation timed out. This may happen with many images. Please try selecting fewer rooms or wait a moment and try again.");
      } else if (errorMessage.includes("image") || errorMessage.includes("load")) {
        alert("Some images failed to load. Please check your internet connection and try again.");
      } else {
        alert(`Failed to generate PDF: ${errorMessage}. Please try again.`);
      }
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Brochure Generator
        </h1>
        <p className="text-white/80">Create and download PDF brochures for stays, activities, food spots, and tour packages</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Select Item</h2>

          {/* Destination Selection */}
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
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
            >
              <option value="">Select Destination</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id}>
                  {dest.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Type Selection — stays only; activities, food spots, tour packages commented out
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Item Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setItemType("stay");
                  setSelectedItemId("");
                  setSelectedItem(null);
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  itemType === "stay"
                    ? "bg-[#E51A4B] border-[#E51A4B] text-white"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Hotel size={18} />
                <span className="text-sm font-medium">Stays</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType("activity");
                  setSelectedItemId("");
                  setSelectedItem(null);
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  itemType === "activity"
                    ? "bg-[#E51A4B] border-[#E51A4B] text-white"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Activity size={18} />
                <span className="text-sm font-medium">Activities</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType("trip");
                  setSelectedItemId("");
                  setSelectedItem(null);
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  itemType === "trip"
                    ? "bg-[#E51A4B] border-[#E51A4B] text-white"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Plane size={18} />
                <span className="text-sm font-medium">Food spots</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setItemType("tour-package");
                  setSelectedItemId("");
                  setSelectedItem(null);
                }}
                className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                  itemType === "tour-package"
                    ? "bg-[#E51A4B] border-[#E51A4B] text-white"
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <PackageIcon size={18} />
                <span className="text-sm font-medium">Tour packages</span>
              </button>
            </div>
          </div>
          */}

          {/* Item Selection */}
          {selectedDestination && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Select {itemType === "stay" ? "Stay" : itemType === "activity" ? "Activity" : itemType === "trip" ? "Trip" : "Tour Package"}{" "}
                <span className="text-red-400">*</span>
              </label>
              {loadingItems ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="animate-spin text-[#E51A4B]" size={24} />
                </div>
              ) : (
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
                >
                  <option value="">Select {itemType === "stay" ? "Stay" : itemType === "activity" ? "Activity" : itemType === "trip" ? "Trip" : "Tour Package"}</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              {items.length === 0 && !loadingItems && selectedDestination && (
                <p className="text-white/60 text-sm mt-2">No items found for this destination</p>
              )}
            </div>
          )}

          {/* Room Selection (for Stays) - Only show if rooms exist for this specific stay */}
          {selectedItem && String(selectedItem.id) === String(selectedItemId) && itemType === "stay" && selectedItem.rooms && Array.isArray(selectedItem.rooms) && selectedItem.rooms.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Select Rooms to Include (Optional - Leave empty to include all)
              </label>
              <div className="max-h-40 overflow-y-auto bg-gray-800 rounded-lg p-3 border border-gray-600">
                {selectedItem.rooms.map((room: any, idx: number) => {
                  const roomKey = room.name || `room-${idx}`;
                  const isSelected = selectedRooms.includes(roomKey);
                  return (
                    <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRooms([...selectedRooms, roomKey]);
                          } else {
                            setSelectedRooms(selectedRooms.filter((r) => r !== roomKey));
                          }
                        }}
                        className="w-4 h-4 text-[#E51A4B] bg-gray-700 border-gray-600 rounded focus:ring-[#E51A4B]"
                      />
                      <span className="text-sm text-white/90">{room.name || `Room ${idx + 1}`}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-white/60 mt-1">
                {selectedRooms.length === 0 
                  ? "All rooms will be included in the brochure" 
                  : `${selectedRooms.length} room(s) selected`}
              </p>
            </div>
          )}

          {/* Dish Selection (for Food spots) - Only show if dishes exist for this specific restaurant/cafe */}
          {selectedItem && String(selectedItem.id) === String(selectedItemId) && itemType === "trip" && selectedItem.packages && Array.isArray(selectedItem.packages) && selectedItem.packages.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/90 mb-2">
                Select Dishes/Menu Items to Include (Optional - Leave empty to include all)
              </label>
              <div className="max-h-40 overflow-y-auto bg-gray-800 rounded-lg p-3 border border-gray-600">
                {selectedItem.packages.map((pkg: any, idx: number) => {
                  const pkgKey = pkg.name || `package-${idx}`;
                  const isSelected = selectedPackages.includes(pkgKey);
                  return (
                    <label key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackages([...selectedPackages, pkgKey]);
                          } else {
                            setSelectedPackages(selectedPackages.filter((p) => p !== pkgKey));
                          }
                        }}
                        className="w-4 h-4 text-[#E51A4B] bg-gray-700 border-gray-600 rounded focus:ring-[#E51A4B]"
                      />
                      <span className="text-sm text-white/90">{pkg.name || `Dish ${idx + 1}`}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-white/60 mt-1">
                {selectedPackages.length === 0 
                  ? "All dishes will be included in the brochure" 
                  : `${selectedPackages.length} dish(es) selected`}
              </p>
            </div>
          )}

          {/* Custom Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Custom Price (Optional)
            </label>
            <input
              type="text"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="e.g., ₹5,000 / night or Starting from ₹10,000"
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
            />
            <p className="text-xs text-white/60 mt-1">This will override the default price display</p>
          </div>

          {/* Custom Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Custom Content (Optional)
            </label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="Enter custom content, special offers, terms & conditions, contact information, etc."
              rows={6}
              className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          {selectedItem && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Store preview data in sessionStorage
                  const previewData = {
                    selectedItem,
                    itemType,
                    reviews,
                    customContent,
                    customPrice,
                    selectedRooms,
                    selectedPackages,
                    selectedDestination: destinations.find(d => d.id === selectedDestination)?.name || selectedDestination,
                  };
                  sessionStorage.setItem('brochurePreviewData', JSON.stringify(previewData));
                  router.push('/admin/brochure/preview');
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={20} />
                Show Preview
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className="flex-1 bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    Download Brochure PDF
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          
          {loading ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <Loader2 className="animate-spin text-[#E51A4B] mx-auto mb-4" size={32} />
              <p className="text-white/60">Loading item details...</p>
            </div>
          ) : selectedItem ? (
            <div
              ref={previewRef}
              className="bg-white text-gray-900 rounded-lg p-6 shadow-lg max-h-[80vh] overflow-y-auto"
            >
              {/* Logo at Top Middle */}
              <div className="flex justify-center mb-6" style={{ minHeight: '64px' }}>
                <Image
                  src="/assets/logo_new.png"
                  alt="Tripeloo Logo"
                  width={200}
                  height={80}
                  className="h-16 w-auto object-contain"
                  style={{ minWidth: '150px', maxWidth: '200px', height: 'auto' }}
                />
              </div>

              {/* Title - Show before images */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-6">
                {selectedItem.name}
              </h1>

              {/* Carousel - Cover Image + All Carousel Images - Larger Size */}
              <div className="mb-6">
                {selectedItem.coverImage && (
                  <img
                    src={optimizeCloudinaryUrl(selectedItem.coverImage)}
                    alt={selectedItem.name}
                    width={800}
                    height={500}
                    className="w-full h-auto object-cover rounded-lg mb-4 shadow-md"
                    style={{ minHeight: '300px', maxHeight: '500px' }}
                  />
                )}
                {selectedItem.carouselImages && 
                 Array.isArray(selectedItem.carouselImages) && 
                 selectedItem.carouselImages.filter((img: any) => {
                   const imgUrl = typeof img === 'string' ? img : img?.url || '';
                   return imgUrl && imgUrl.trim() !== "";
                 }).length > 0 && (
                  <div className="space-y-4">
                    {selectedItem.carouselImages
                      .filter((img: any) => {
                        const imgUrl = typeof img === 'string' ? img : img?.url || '';
                        return imgUrl && imgUrl.trim() !== "";
                      })
                      .map((img: any, idx: number) => {
                        const imgUrl = typeof img === 'string' ? img : img?.url || '';
                        return (
                          <img
                            key={idx}
                            src={optimizeCloudinaryUrl(imgUrl)}
                            alt={`${selectedItem.name} - Image ${idx + 1}`}
                            width={800}
                            height={500}
                            className="w-full h-auto object-cover rounded-lg shadow-md"
                            style={{ minHeight: '300px', maxHeight: '500px' }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3 text-gray-600 mb-3">
                  <div className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Star className="w-4 h-4 fill-emerald-500" />
                    <span>5.0</span>
                  </div>
                  <span className="text-sm">(Reviews)</span>
                </div>
                {/* Custom Price Only - No DB Prices */}
                {customPrice && (
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{customPrice}</p>
                  </div>
                )}
              </div>

              {/* Summary (for Stays/Food spots) */}
              {selectedItem.summary && itemType !== "activity" && (
                <p className="mt-4 mb-6 text-gray-600 text-sm sm:text-base">
                  {selectedItem.summary}
                </p>
              )}

              {/* Important Info - Good to Know (Right after description for Stays) - COMMENTED OUT */}
              {/* {selectedItem.importantInfo && typeof selectedItem.importantInfo === 'string' && selectedItem.importantInfo.trim().length > 0 && itemType === "stay" && (
                <div className="mt-6 mb-6 bg-red-50 rounded-2xl p-5 sm:p-6 shadow-inner">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Good to Know</h2>
                  <div className="text-gray-700 text-sm sm:text-base whitespace-pre-line italic">
                    {selectedItem.importantInfo}
                  </div>
                </div>
              )} */}

              {/* About (for Activities) */}
              {selectedItem.about && itemType === "activity" && (
                <div className="mt-8 mb-6 bg-white px-3 py-3 border rounded-lg">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">About</h2>
                  <p className="text-gray-700">{selectedItem.about}</p>
                </div>
              )}

              {/* Excludes Section removed */}

              {/* Activity Details (for Activities) - Inline with Icons */}
              {selectedItem.activityDetails && Object.keys(selectedItem.activityDetails).length > 0 && itemType === "activity" && (
                <div className="mt-6 mb-6 px-4 flex flex-col gap-4 sm:gap-6 border-y py-4 text-gray-700 text-sm sm:text-base">
                  {selectedItem.activityDetails.ages && (
                    <div className="flex items-center gap-2">
                      <Users size={18} /> <span>{selectedItem.activityDetails.ages}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.duration && (
                    <div className="flex items-center gap-2">
                      <Hourglass size={18} /> <span>Duration: {selectedItem.activityDetails.duration}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock1 size={18} /> <span>Start time: {selectedItem.activityDetails.startTime}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.mobileTicket && (
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} /> <span>Mobile ticket</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.animalWelfare && (
                    <div className="flex items-center gap-2">
                      <PawPrint size={18} /> <span>Meets animal welfare guidelines</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.liveGuide && (
                    <div className="flex items-center gap-2">
                      <BookA size={18} /> <span>Live guide: {selectedItem.activityDetails.liveGuide}</span>
                    </div>
                  )}
                  {selectedItem.activityDetails.maxGroupSize && (
                    <div className="flex items-center gap-2">
                      <Users size={18} /> <span>Max Group Size: {selectedItem.activityDetails.maxGroupSize}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Excludes Section removed */}

              {/* Highlights (for Stays) */}
              {selectedItem.properties && Array.isArray(selectedItem.properties) && selectedItem.properties.length > 0 && (itemType === "stay" || itemType === "tour-package") && (
                <div className="mt-8 mb-6 bg-white rounded-2xl p-5 sm:p-6 shadow-inner">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">{itemType === "tour-package" ? "Trip Highlights" : "Highlights"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                    {selectedItem.properties.map((property: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-[#E51A4B] font-bold mt-0.5">•</span>
                        <span>{property}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurant/Cafe Features (for Food spots) */}
              {selectedItem.properties && Array.isArray(selectedItem.properties) && selectedItem.properties.length > 0 && itemType === "trip" && (
                <div className="mt-8 mb-6 bg-white rounded-2xl p-5 sm:p-6 shadow-inner">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">Restaurant/Cafe Features</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-gray-700 text-sm sm:text-base">
                    {selectedItem.properties.map((prop: string, index: number) => (
                      <div key={index}>{prop}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rooms Section (for Stays) - Only show if rooms exist for this specific stay */}
              {selectedItem && String(selectedItem.id) === String(selectedItemId) && itemType === "stay" && selectedItem.rooms && Array.isArray(selectedItem.rooms) && selectedItem.rooms.length > 0 && (() => {
                // Filter rooms based on selection
                const roomsToShow = selectedRooms.length > 0
                  ? selectedItem.rooms.filter((room: any, idx: number) => {
                      const roomKey = room.name || `room-${idx}`;
                      return selectedRooms.includes(roomKey);
                    })
                  : selectedItem.rooms;
                
                if (roomsToShow.length === 0) return null;
                
                return (
                  <div className="mb-6 mt-8">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Room</h2>
                    <div className="space-y-8">
                      {roomsToShow.map((room: any, idx: number) => (
                      <div key={idx} className="w-full">
                        {/* Room Name */}
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{room.name}</h3>
                        
                        {/* Room Images - Full Width, Larger Size */}
                        {room.images && Array.isArray(room.images) && room.images.filter((img: string) => img && img.trim() !== "").length > 0 ? (
                          <div className="space-y-4 mb-4">
                            {room.images
                              .filter((img: string) => img && img.trim() !== "")
                              .map((img: string, imgIdx: number) => (
                                <img
                                  key={imgIdx}
                                  src={optimizeCloudinaryUrl(img)}
                                  alt={`${room.name} - Image ${imgIdx + 1}`}
                                  width={800}
                                  height={500}
                                  className="w-full h-auto object-cover rounded-lg shadow-md"
                                  style={{ minHeight: '300px', maxHeight: '500px' }}
                                />
                              ))}
                          </div>
                        ) : room.thumb ? (
                          <div className="mb-4">
                            <img
                              src={optimizeCloudinaryUrl(room.thumb)}
                              alt={room.name}
                              width={800}
                              height={500}
                              className="w-full h-auto object-cover rounded-lg shadow-md"
                              style={{ minHeight: '300px', maxHeight: '500px' }}
                            />
                          </div>
                        ) : (
                          <div className="h-[300px] w-full bg-white border border-gray-200 flex items-center justify-center rounded-lg mb-4">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        
                        {/* Room Features */}
                        {room.features && Array.isArray(room.features) && room.features.length > 0 && (
                          <div className="mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm sm:text-base">
                              {room.features.map((feature: string, fIdx: number) => (
                                <div key={fIdx} className="flex items-start gap-2">
                                  <span className="text-[#E51A4B] font-bold mt-0.5">•</span>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Dishes Section (for Food spots) - Only show if dishes exist for this specific restaurant/cafe */}
              {selectedItem && String(selectedItem.id) === String(selectedItemId) && itemType === "trip" && selectedItem.packages && Array.isArray(selectedItem.packages) && selectedItem.packages.length > 0 && (() => {
                // Filter packages based on selection
                const packagesToShow = selectedPackages.length > 0
                  ? selectedItem.packages.filter((pkg: any, idx: number) => {
                      const pkgKey = pkg.name || `package-${idx}`;
                      return selectedPackages.includes(pkgKey);
                    })
                  : selectedItem.packages;
                
                if (packagesToShow.length === 0) return null;
                
                return (
                  <div className="mb-6 mt-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Choose Your Package</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                      {packagesToShow.map((pkg: any, idx: number) => (
                      <div key={idx} className="cursor-pointer rounded-xl overflow-hidden shadow-md border border-gray-200">
                        {pkg.thumb ? (
                          <img
                            src={optimizeCloudinaryUrl(pkg.thumb)}
                            alt={pkg.name}
                            width={180}
                            height={120}
                            className="h-[120px] w-full object-cover"
                          />
                        ) : pkg.images && pkg.images.length > 0 ? (
                          <img
                            src={optimizeCloudinaryUrl(pkg.images[0])}
                            alt={pkg.name}
                            width={180}
                            height={120}
                            className="h-[120px] w-full object-cover"
                          />
                        ) : (
                          <div className="h-[120px] w-full bg-white border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No Image</span>
                          </div>
                        )}
                        <div className="p-3 flex flex-col gap-1">
                          <h3 className="font-semibold text-sm text-gray-800">{pkg.name}</h3>
                          {pkg.duration && (
                            <p className="text-xs text-gray-600">{pkg.duration}</p>
                          )}
                          {/* Package price excluded - only show if custom price is set globally */}
                        </div>
                        {/* Package Images Gallery */}
                        {pkg.images && Array.isArray(pkg.images) && pkg.images.filter((img: string) => img && img.trim() !== "").length > 0 && (
                          <div className="p-3 pt-0">
                            <div className="grid grid-cols-2 gap-2">
                              {pkg.images
                                .filter((img: string) => img && img.trim() !== "")
                                .slice(0, 4)
                                .map((img: string, imgIdx: number) => (
                                  <img
                                    key={imgIdx}
                                    src={optimizeCloudinaryUrl(img)}
                                    alt={`${pkg.name} - Image ${imgIdx + 1}`}
                                    width={150}
                                    height={100}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ))}
                            </div>
                            {pkg.images.filter((img: string) => img && img.trim() !== "").length > 4 && (
                              <p className="text-xs text-gray-500 mt-2">
                                +{pkg.images.filter((img: string) => img && img.trim() !== "").length - 4} more images
                              </p>
                            )}
                          </div>
                        )}
                        {/* Package Highlights */}
                        {pkg.highlights && Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                          <div className="p-3 pt-0">
                            <div className="space-y-1">
                              {pkg.highlights.slice(0, 3).map((highlight: string, hIdx: number) => (
                                <div key={hIdx} className="text-gray-700 text-xs flex items-start gap-1">
                                  <span className="text-[#E51A4B]">•</span>
                                  <span>{highlight}</span>
                                </div>
                              ))}
                              {pkg.highlights.length > 3 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{pkg.highlights.length - 3} more highlights
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Price Section (for Stays/Food spots) - Keep Price Includes and Price Excludes */}
              {(itemType === "stay" || itemType === "trip" || itemType === "tour-package") && (
                ((selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0) || 
                 (selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0)) && (
                  <div className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <section className="bg-white py-7 px-6 md:px-5 rounded-lg border border-gray-200" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      {selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0 && (
                        <div className={selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0 ? "mb-10" : ""}>
                          <h2 className="text-xl font-semibold text-gray-800 mb-6">Price Includes</h2>
                          <div className="grid md:grid-cols-2 gap-y-4 gap-x-12 text-gray-700">
                            {selectedItem.includes.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                <Check className="text-green-600 w-5 h-5 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedItem.excludes && Array.isArray(selectedItem.excludes) && selectedItem.excludes.length > 0 && (
                        <div className={selectedItem.includes && Array.isArray(selectedItem.includes) && selectedItem.includes.length > 0 ? "mt-10" : ""}>
                          <h2 className="text-xl font-semibold text-gray-800 mb-6">Price Excludes</h2>
                          <div className="grid md:grid-cols-2 gap-y-4 gap-x-12 text-gray-700">
                            {selectedItem.excludes.map((item: string, index: number) => (
                              <div key={index} className="flex items-center gap-3">
                                <span className="text-red-600 w-5 h-5 flex-shrink-0 flex items-center justify-center">•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                )
              )}

              {/* Additional Details - Expandable Style */}
              {selectedItem.additionalDetails && Array.isArray(selectedItem.additionalDetails) && selectedItem.additionalDetails.length > 0 && (() => {
                const validDetails = selectedItem.additionalDetails.filter((detail: AdditionalDetail) => {
                  const hasHeading = detail.heading?.trim();
                  const hasContent = 
                    (detail.type === 'description' && detail.description?.trim()) ||
                    (detail.type === 'points' && Array.isArray(detail.points) && detail.points.length > 0);
                  return hasHeading && hasContent;
                });
                
                return validDetails.length > 0 ? (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
                    <div className="space-y-4">
                      {validDetails.map((detail: AdditionalDetail, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-4">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                              {detail.heading}
                            </h3>
                            {detail.type === 'description' && detail.description && (
                              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                {detail.description}
                              </p>
                            )}
                            {detail.type === 'points' && detail.points && Array.isArray(detail.points) && detail.points.length > 0 && (
                              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                                {detail.points.map((point: string, pointIndex: number) => (
                                  <li key={pointIndex}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Location */}
              {selectedItem.location && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-[#E51A4B]" />
                    <p>{selectedItem.location}</p>
                  </div>
                </div>
              )}

              {/* Reviews Section - Maximum 4 Reviews */}
              {reviews.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h2>
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      const formatDate = (date: Date | string) => {
                        const d = typeof date === "string" ? new Date(date) : date;
                        return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                      };

                      const getInitials = (name: string) => {
                        return name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                      };

                      return (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[#E51A4B] text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {getInitials(review.userName)}
                            </div>
                            
                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-sm">{review.userName}</h4>
                                  <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                                </div>
                                {/* Star Rating */}
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{review.review}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Custom Content */}
              {customContent && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b-2 border-[#E51A4B] pb-2">Details</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {customContent}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div className="flex justify-center mb-4" style={{ minHeight: '48px' }}>
                  <Image
                    src="/assets/logo_new.png"
                    alt="Tripeloo Logo"
                    width={150}
                    height={60}
                    className="h-12 w-auto object-contain"
                    style={{ minWidth: '120px', maxWidth: '150px', height: 'auto' }}
                  />
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-700 font-semibold mb-2">
                    Tripelo Travel Company
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    South Beach, Calicut, Kerala
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Email: <a href="mailto:support@tripeloo.com" className="text-[#E51A4B] hover:underline">support@tripeloo.com</a>
                  </p>
                  <p className="text-sm text-gray-700 mb-3">
                    Phone: <a href="tel:90379179463" className="text-[#E51A4B] hover:underline">90379179463</a>
                  </p>
                  <div className="flex justify-center gap-4 items-center">
                    <a 
                      href="https://www.instagram.com/tripeloo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E51A4B] hover:text-[#c91742] transition-colors"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.facebook.com/tripeloo" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#E51A4B] hover:text-[#c91742] transition-colors"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                  © {new Date().getFullYear()} Tripelo Travel Company. All rights reserved.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <ImageIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Select a destination and item to preview brochure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

