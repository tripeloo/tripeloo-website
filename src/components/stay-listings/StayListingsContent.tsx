"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { optimizeCloudinaryUrl } from "@/utils/cloudinary";
import { motion } from "framer-motion";
import {
  FaPlaneDeparture,
  FaCloud,
  FaSun,
  FaMountain,
  FaCompass,
  FaWhatsapp,
  FaLeaf,
  FaHiking,
  FaCarSide,
  FaSuitcaseRolling,
  FaRoad,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSortAmountDown,
} from "react-icons/fa";

import { stayData, activitiesData, tripsData, type Stay, type Activity, type Trip } from "./DestinationData";
import { LeadFormPopup } from "@/components/LeadFormPopup";
import { StayCardActions } from "@/components/StayCardActions";

// const tabData = ["Stays", "Things to Do", "Food spots", "Tour packages"];
const tabData = ["Stays"];

// Helper function to map category based on item data
const mapCategory = (item: any, type: 'stay' | 'activity' | 'trip'): string => {
  // If category already exists in DB, use it
  if (item.category) return item.category;
  
  // Map based on tags, name patterns, or other fields
  const name = (item.name || '').toLowerCase();
  const tags = item.tags || [];
  
  if (type === 'stay') {
    if (name.includes('luxury') || name.includes('5-star') || name.includes('villa')) return 'Luxury';
    if (name.includes('budget') || name.includes('hostel')) return 'Budget';
    if (name.includes('eco') || name.includes('treehouse')) return 'Eco Stay';
    if (name.includes('beach') || name.includes('beachfront')) return 'Beach Resort';
    if (tags.some((tag: string) => tag.toLowerCase().includes('resort'))) return 'Resort';
    return 'Resort'; // Default
  }
  
  if (type === 'activity') {
    if (name.includes('trek') || name.includes('adventure') || name.includes('sport')) return 'Adventure';
    if (name.includes('wildlife') || name.includes('safari')) return 'Wildlife';
    if (name.includes('waterfall') || name.includes('nature')) return 'Nature';
    if (name.includes('nightlife') || name.includes('party')) return 'Entertainment';
    if (name.includes('heritage') || name.includes('cultural')) return 'Cultural';
    if (tags.some((tag: string) => tag.toLowerCase().includes('adventure'))) return 'Adventure';
    return 'Adventure'; // Default
  }
  
  if (type === 'trip') {
    if (name.includes('adventure') || name.includes('camping')) return 'Adventure';
    if (name.includes('heritage') || name.includes('cultural')) return 'Cultural';
    if (name.includes('nature') || name.includes('wildlife')) return 'Nature';
    if (name.includes('beach') || name.includes('relax')) return 'Relaxation';
    if (name.includes('nightlife') || name.includes('party')) return 'Entertainment';
    if (tags.some((tag: string) => tag.toLowerCase().includes('adventure'))) return 'Adventure';
    return 'Adventure'; // Default
  }
  
  return 'General';
};

function StayListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawDestination = searchParams.get("destination");
  const categoryParam = searchParams.get("category");
  
  // Map category query param to tab name
  const getDefaultTab = () => {
    // Things to Do, Food spots, Tour packages — commented out, stays only
    // if (categoryParam === "things-to-do") return "Things to Do";
    // if (categoryParam === "getaways" || categoryParam === "restaurants-cafes") return "Food spots";
    return "Stays";
  };
  
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(true);
  const [stays, setStays] = useState<Stay[] | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadPopupStay, setLeadPopupStay] = useState<Stay | null>(null);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    if (!rawDestination) {
      const timer = setTimeout(() => router.push("/destinations"), 5000);
      return () => clearTimeout(timer);
    }
  }, [rawDestination, router]);

  // Update active tab when category query param changes — stays only
  useEffect(() => {
    // Tour packages redirect — commented out
    // if (categoryParam === "tour-packages" && rawDestination) {
    //   router.push(`/tour-packages?destination=${encodeURIComponent(rawDestination)}`);
    //   return;
    // }
    setActiveTab("Stays");
  }, [categoryParam, rawDestination, router]);

  // Fetch data from API
  useEffect(() => {
    if (!rawDestination) return;
    
    const fetchData = async () => {
      setLoading(true);
      const destinationSlug = decodeURIComponent(rawDestination).toLowerCase();
      
      try {
        // Fetch stays
        const staysRes = await fetch(`/api/stays?destination=${encodeURIComponent(destinationSlug)}`);
        if (staysRes.ok) {
          const staysData = await staysRes.json();
          const mappedStays = staysData.data.map((stay: any) => ({
            ...stay,
            category: mapCategory(stay, 'stay'),
          }));
          setStays(mappedStays.length > 0 ? mappedStays : null);
        } else {
          // Fallback to hardcoded data
          const matchedKey = Object.keys(stayData).find((key) =>
            destinationSlug.includes(key.toLowerCase())
          );
          setStays(matchedKey ? stayData[matchedKey] : null);
        }
      } catch (error) {
        console.error('Error fetching stays:', error);
        // Fallback to hardcoded data
        const matchedKey = Object.keys(stayData).find((key) =>
          destinationSlug.includes(key.toLowerCase())
        );
        setStays(matchedKey ? stayData[matchedKey] : null);
      }

      // Fetch activities & trips — commented out, stays only
      setActivities(null);
      setTrips(null);
      
      setLoading(false);
    };

    fetchData();
  }, [rawDestination]);

  // Reset filters when switching tabs (keep sortByPrice as true for default sorting)
  useEffect(() => {
    setSelectedCategories(["All"]);
    setSearchQuery("");
    setSortByPrice(true); // Keep sorting enabled by default
  }, [activeTab]);

  const handleItemClick = (itemId: string) => {
    if (!rawDestination) return;
  
    const destination = encodeURIComponent(rawDestination);
    let queryParam = "";
    let targetPage = "";
  
    if (activeTab === "Stays") {
      queryParam = `stay=${itemId}`;
      targetPage = "/item-details";
    } else if (activeTab === "Things to Do") {
      queryParam = `things-to-do=${itemId}`;
      targetPage = "/things-to-do";
    } else if (activeTab === "Food spots") {
      queryParam = `trips=${itemId}`;
      targetPage = "/trips";
    }
  
    router.push(`${targetPage}?destination=${destination}&${queryParam}`);
  }; 

  if (!rawDestination) {
    return (
      <div className="min-h-screen  bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FaCompass className="text-6xl text-[#E51A4B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Choose Your Destination First
          </h1>
          <p className="text-gray-600 mb-6">
            Redirecting you to the destination selection page in 5 seconds
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/destinations")}
            className="bg-[#E51A4B] text-white px-6 py-3 rounded-full font-semibold"
          >
            Go to Destinations
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const decodedDestination = decodeURIComponent(rawDestination).toLowerCase();

  // Get unique categories based on active tab
  const getCategories = () => {
    if (activeTab === "Stays" && stays) {
      return ["All", ...Array.from(new Set(stays.map((s) => s.category)))];
    } else if (activeTab === "Things to Do" && activities) {
      return ["All", ...Array.from(new Set(activities.map((a) => a.category)))];
    } else if (activeTab === "Food spots" && trips) {
      return ["All", ...Array.from(new Set(trips.map((t) => t.category)))];
    }
    return ["All"];
  };

  // Handle category selection (multiple selection)
  const handleCategoryToggle = (category: string) => {
    if (category === "All") {
      // If "All" is clicked, select only "All"
      setSelectedCategories(["All"]);
    } else {
      // Remove "All" if a specific category is selected
      setSelectedCategories((prev) => {
        const withoutAll = prev.filter((c) => c !== "All");
        if (withoutAll.includes(category)) {
          // Deselect if already selected
          const updated = withoutAll.filter((c) => c !== category);
          // If no categories selected, select "All"
          return updated.length === 0 ? ["All"] : updated;
        } else {
          // Select the category
          return [...withoutAll, category];
        }
      });
    }
  };

  // Filter and sort function
  const filterAndSort = <T extends { name: string; category: string; startingPrice?: number; price?: number }>(
    items: T[] | null
  ): T[] => {
    if (!items) return [];

    let filtered = items;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by categories (multiple selection)
    if (!selectedCategories.includes("All") && selectedCategories.length > 0) {
      filtered = filtered.filter((item) => selectedCategories.includes(item.category));
    }

    // Sort by price (ascending)
    if (sortByPrice) {
      filtered = [...filtered].sort((a, b) => {
        const priceA = a.startingPrice || a.price || 0;
        const priceB = b.startingPrice || b.price || 0;
        return priceA - priceB;
      });
    }

    return filtered;
  };

  const filteredStays = filterAndSort(stays);
  const filteredActivities = filterAndSort(activities);
  const filteredTrips = filterAndSort(trips);

  const hasStays = filteredStays.length > 0;
  const hasActivities = filteredActivities.length > 0;
  const hasTrips = filteredTrips.length > 0;

  const categories = getCategories();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br pt-4 from-blue-50 via-white to-pink-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaCompass className="text-6xl text-[#E51A4B] mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br pt-4 from-blue-50 via-white to-pink-50">
      {/* Dynamic Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeTab === "Stays" && (
          <>
            {/* Sun */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1 }}
              className="absolute top-10 right-10"
            >
              <FaSun className="text-yellow-400 text-8xl" />
            </motion.div>

            {/* Clouds */}
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute top-20 left-10"
            >
              <FaCloud className="text-white text-6xl opacity-40" />
            </motion.div>
            <motion.div
              animate={{ x: [0, -80, 0] }}
              transition={{ duration: 25, repeat: Infinity }}
              className="absolute top-40 right-20"
            >
              <FaCloud className="text-white text-5xl opacity-30" />
            </motion.div>

            {/* Airplanes */}
            <motion.div
              animate={{ x: [-100, window.innerWidth + 100] }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute top-32 left-0"
            >
              <FaPlaneDeparture className="text-gray-400 text-4xl opacity-50" />
            </motion.div>

            {/* Mountains */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.3 }}
              transition={{ duration: 1.5 }}
              className="absolute bottom-0 left-0"
            >
              <FaMountain className="text-gray-500 text-9xl" />
            </motion.div>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 0.25 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute bottom-0 right-10"
            >
              <FaMountain className="text-gray-400 text-7xl" />
            </motion.div>
          </>
        )}

        {activeTab === "Things to Do" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 right-20"
            >
              <FaCompass className="text-[#E51A4B] text-7xl opacity-20" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-40 left-20"
            >
              <FaHiking className="text-green-600 text-6xl opacity-30" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-20 right-40"
            >
              <FaLeaf className="text-green-500 text-5xl opacity-25" />
            </motion.div>
          </>
        )}

        {activeTab === "Food spots" && (
          <>
            <motion.div
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-32 left-20"
            >
              <FaCarSide className="text-blue-500 text-7xl opacity-30" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-32 right-20"
            >
              <FaSuitcaseRolling className="text-orange-500 text-6xl opacity-25" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-1/2 left-10"
            >
              <FaRoad className="text-gray-400 text-8xl opacity-20" />
            </motion.div>
          </>
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        {/* Mobile Search and Filter Bar - Top */}
        <div className="md:hidden mb-4 space-y-3">
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Blur the active element to close the keyboard on mobile
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3"
          >
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                placeholder="Search stays, activities, food spots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchQuery("");
                    // Blur to close keyboard
                    if (document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E51A4B] p-1"
                  aria-label="Clear search"
                >
                  <FaTimes className="text-base" />
                </button>
              )}
            </div>
          </form>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center justify-center gap-2 hover:bg-[#E51A4B] hover:text-white transition-all duration-300"
          >
            <FaFilter className="text-lg" />
            <span className="font-semibold text-base">Filter & Sort</span>
            {(!selectedCategories.includes("All") || !sortByPrice) && (
              <span className="ml-auto bg-[#E51A4B] text-white text-xs px-2 py-1 rounded-full">
                {(!selectedCategories.includes("All") ? selectedCategories.length : 0) + (!sortByPrice ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Filter and Search Panel - Fixed in Right Corner */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hidden md:flex fixed top-24 right-4 z-50 flex-col gap-2"
        >
          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 w-80">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E51A4B]"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 flex items-center justify-center gap-2 hover:bg-[#E51A4B] hover:text-white transition-all duration-300"
          >
            <FaFilter className="text-xl" />
            <span className="font-semibold text-base">Filter</span>
          </button>

          {/* Filter Panel */}
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 w-80 mt-2 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className="text-gray-400 hover:text-[#E51A4B]"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategories.includes(category)
                          ? "bg-[#E51A4B] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Sort */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort
                </label>
                <button
                  onClick={() => setSortByPrice(!sortByPrice)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    sortByPrice
                      ? "bg-[#E51A4B] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaSortAmountDown />
                  <span>Price: Low to High</span>
                </button>
              </div>

              {/* Reset Filters */}
              {(searchQuery || !selectedCategories.includes("All") || !sortByPrice) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories(["All"]);
                    setSortByPrice(true); // Reset to default sorting (low to high)
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-medium"
                >
                  Reset Filters
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Mobile Filter Panel - Bottom Sheet with Backdrop */}
        {showFilterPanel && (
          <>
            {/* Mobile Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterPanel(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            
            {/* Filter Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Filter & Sort</h3>
              <button
                type="button"
                onClick={() => {
                  setShowFilterPanel(false);
                }}
                className="p-2 text-gray-400 hover:text-[#E51A4B] rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                aria-label="Close filters"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        handleCategoryToggle(category);
                      }}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] touch-manipulation ${
                        selectedCategories.includes(category)
                          ? "bg-[#E51A4B] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 active:bg-gray-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Sort */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Sort
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSortByPrice(!sortByPrice);
                  }}
                  className={`w-full px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all min-h-[48px] touch-manipulation ${
                    sortByPrice
                      ? "bg-[#E51A4B] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 active:bg-gray-200"
                  }`}
                >
                  <FaSortAmountDown className="text-lg" />
                  <span className="font-medium">Price: Low to High</span>
                </button>
              </div>

              {/* Reset Filters */}
              {(searchQuery || !selectedCategories.includes("All") || !sortByPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategories(["All"]);
                    setSortByPrice(true); // Reset to default sorting (low to high)
                  }}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-200 text-gray-700 active:bg-gray-300 transition-all font-medium min-h-[48px] touch-manipulation"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Apply Button - Sticky Bottom - Only closes panel, filters already applied */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => {
                  setShowFilterPanel(false);
                }}
                className="w-full bg-[#E51A4B] text-white py-3.5 rounded-xl font-semibold text-base shadow-lg active:bg-[#c4173f] transition-colors min-h-[48px] touch-manipulation"
              >
                Done
              </button>
            </div>
          </motion.div>
          </>
        )}

        {/* Tabs — commented out, stays only (single tab hidden)
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:flex gap-2 md:gap-3 mb-8 md:mb-10 bg-white/80 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl md:rounded-full shadow-lg max-w-2xl mx-auto"
        >
          {tabData.map((tab) => (
            ...
          ))}
        </motion.div>
        */}

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-12 px-2 bg-gradient-to-r from-[#E51A4B] to-[#FF6B6B] bg-clip-text text-transparent capitalize font-display"
        >
          {`Stays in ${decodedDestination}`}
          {/* Things to Do, Food spots, Tour packages headings — commented out
          {activeTab === "Things to Do" && `Things to Do in ${decodedDestination}`}
          {activeTab === "Food spots" && `Food spots in ${decodedDestination}`}
          {activeTab === "Tour packages" && `Tour packages in ${decodedDestination}`}
          */}
        </motion.h1>

        {/* No results message */}
        {activeTab === "Stays" && stays && stays.length > 0 && !hasStays && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories(["All"]);
                setSortByPrice(true); // Reset to default sorting (low to high)
              }}
              className="bg-[#E51A4B] text-white px-6 py-3 rounded-full font-semibold"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* No stays available */}
        {!hasStays && activeTab === "Stays" && (!stays || stays.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaSuitcaseRolling className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No stays or resorts available in this location right now
            </h2>
            <p className="text-gray-600 mb-6">
              We're expanding our listings soon. For assistance, contact our
              support team.
            </p>
            <motion.a
              href="https://wa.me/9190379179463"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-green-600 transition"
            >
              <FaWhatsapp className="text-xl" />
              Chat with us on WhatsApp
            </motion.a>
          </motion.div>
        )}

        {/* Show stays if available */}
        {hasStays && activeTab === "Stays" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredStays.map((stay, index) => (
              <motion.div
                key={stay.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleItemClick(stay.id)}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={optimizeCloudinaryUrl(stay.coverImage)}
                    alt={stay.name}
                    width={400}
                    height={256}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                    <p className="text-[#E51A4B] font-bold text-sm sm:text-base md:text-lg">
                      ₹{stay.startingPrice}
                      <span className="text-xs sm:text-sm text-gray-600"> / night</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 sm:mb-3 group-hover:text-[#E51A4B] transition line-clamp-2">
                    {stay.name}
                  </h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {stay.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600"
                      >
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#E51A4B] rounded-full flex-shrink-0" />
                        <span className="line-clamp-1">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <StayCardActions
                    stayName={stay.name}
                    location={decodedDestination}
                    onFormClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setLeadPopupStay(stay);
                      setShowLeadPopup(true);
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Things to Do, Food spots sections — commented out, stays only */}
        {false && (
        <>
        {/* No results message for Things to Do */}
        {activeTab === "Things to Do" && (activities?.length ?? 0) > 0 && !hasActivities && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories(["All"]);
                setSortByPrice(true); // Reset to default sorting (low to high)
              }}
              className="bg-[#E51A4B] text-white px-6 py-3 rounded-full font-semibold"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* No Things to Do available */}
        {!hasActivities && activeTab === "Things to Do" && !(activities?.length) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaHiking className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No things to do/activities or experiences available in this location right now
            </h2>
            <p className="text-gray-600 mb-6">
              We're curating amazing experiences for you. For custom activity
              recommendations, contact our support team.
            </p>
            <motion.a
              href="https://wa.me/9190379179463"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-green-600 transition"
            >
              <FaWhatsapp className="text-xl" />
              Chat with us on WhatsApp
            </motion.a>
          </motion.div>
        )}

        {/* Show activities if available */}
        {hasActivities && activeTab === "Things to Do" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleItemClick(activity.id)}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={optimizeCloudinaryUrl(activity.coverImage)}
                    alt={activity.name}
                    width={400}
                    height={256}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {((activity.startingPrice ?? activity.price) ?? 0) > 0 && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                      <p className="text-[#E51A4B] font-bold text-sm sm:text-base md:text-lg">
                        ₹{(activity.startingPrice ?? activity.price)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-[#E51A4B] transition line-clamp-2">
                    {activity.name}
                  </h3>
                  {(() => {
                    const d = activity.duration;
                    const hasDur = d != null && String(d).trim() !== "" && String(d).trim() !== "0";
                    return hasDur ? <p className="text-sm sm:text-base text-gray-600">Duration: {d}</p> : null;
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No results message for Food spots */}
        {activeTab === "Food spots" && (trips?.length ?? 0) > 0 && !hasTrips && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaSearch className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No results found
            </h2>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories(["All"]);
                setSortByPrice(true); // Reset to default sorting (low to high)
              }}
              className="bg-[#E51A4B] text-white px-6 py-3 rounded-full font-semibold"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* No Food spots available */}
        {!hasTrips && activeTab === "Food spots" && !(trips?.length) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl max-w-2xl mx-auto"
          >
            <FaCarSide className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No food spots available for this destination right now
            </h2>
            <p className="text-gray-600 mb-6">
              We're adding more dining options. For personalized restaurant
              planning, reach out to our support team.
            </p>
            <motion.a
              href="https://wa.me/9190379179463"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-green-600 transition"
            >
              <FaWhatsapp className="text-xl" />
              Chat with us on WhatsApp
            </motion.a>
          </motion.div>
        )}

        {/* Show food spots if available */}
        {hasTrips && activeTab === "Food spots" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleItemClick(trip.id)}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={optimizeCloudinaryUrl(trip.coverImage)}
                    alt={trip.name}
                    width={400}
                    height={256}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {((trip.price ?? 0) > 0) && (
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-4 sm:py-2 rounded-full">
                      <p className="text-[#E51A4B] font-bold text-sm sm:text-base md:text-lg">
                        ₹{trip.price}
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-[#E51A4B] transition line-clamp-2">
                    {trip.name}
                  </h3>
                  {(() => {
                    const d = trip.duration;
                    const hasDur = d != null && String(d).trim() !== "" && String(d).trim() !== "0";
                    return hasDur ? <p className="text-sm sm:text-base text-gray-600">Duration: {d}</p> : null;
                  })()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </>
        )}
      </div>

      <LeadFormPopup
        isOpen={showLeadPopup}
        onClose={() => {
          setShowLeadPopup(false);
          setLeadPopupStay(null);
        }}
        onSkip={() => {
          setShowLeadPopup(false);
          setLeadPopupStay(null);
        }}
        itemName={leadPopupStay?.name}
        itemType="stay"
        itemPrice={
          leadPopupStay?.startingPrice != null && leadPopupStay.startingPrice > 0
            ? `₹${leadPopupStay.startingPrice.toLocaleString()}/ night`
            : undefined
        }
        itemDestination={decodedDestination}
      />
    </div>
  );
}

export default StayListingsContent;
