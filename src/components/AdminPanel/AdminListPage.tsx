"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Edit, Eye, EyeOff, Loader2, Plus, Search, Filter, X, ArrowUpDown, Phone, MapPin, Calendar, Tag, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface AdminListPageProps {
  title: string;
  type: "destinations" | "stays" | "activities" | "trips" | "tour-packages";
  addRoute: string;
  editRoutePrefix: string;
  showAddButton?: boolean;
}

export default function AdminListPage({ title, type, addRoute, editRoutePrefix, showAddButton = true }: AdminListPageProps) {
  // Helper function to get singular form for "Add Your First" button
  const getSingularForm = (title: string): string => {
    if (title === "Things to Do") {
      return "Thing to Do";
    }
    // Remove 's' from the end for plural forms
    if (title.endsWith("s")) {
      return title.slice(0, -1);
    }
    return title;
  };
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All"]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortByPrice, setSortByPrice] = useState(true); // Default to true for automatic low-to-high sorting
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  useEffect(() => {
    fetchItems();
  }, [showHidden]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/${type}?includeHidden=${showHidden}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      setUpdating(id);
      const res = await fetch(`/api/admin/${type}/${id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !currentHidden }),
      });

      if (res.ok) {
        await fetchItems();
      } else {
        alert("Failed to update item");
      }
    } catch (error) {
      console.error("Error toggling hide:", error);
      alert("Failed to update item");
    } finally {
      setUpdating(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`${editRoutePrefix}/${encodeURIComponent(id)}`);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
  };

  // Get unique categories from items
  const getCategories = useMemo(() => {
    const categories = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return ["All", ...Array.from(categories).sort()];
  }, [items]);

  // Handle category selection (multiple selection)
  const handleCategoryToggle = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"]);
    } else {
      setSelectedCategories((prev) => {
        const withoutAll = prev.filter((c) => c !== "All");
        if (withoutAll.includes(category)) {
          const updated = withoutAll.filter((c) => c !== category);
          return updated.length === 0 ? ["All"] : updated;
        } else {
          return [...withoutAll, category];
        }
      });
    }
  };

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.propertyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.destinationSlug || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by categories
    if (!selectedCategories.includes("All") && selectedCategories.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCategory = item.category || "General";
        return selectedCategories.includes(itemCategory);
      });
    }

    // Sort by price (ascending) - always enabled by default
    if (sortByPrice) {
      filtered = [...filtered].sort((a, b) => {
        const priceA = a.startingPrice ?? a.price ?? a.packagePrice ?? 0;
        const priceB = b.startingPrice ?? b.price ?? b.packagePrice ?? 0;
        return priceA - priceB;
      });
    }

    return filtered;
  }, [items, searchQuery, selectedCategories, sortByPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E51A4B]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-white/80 mt-1">Manage your {title.toLowerCase()}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showHidden
                ? "bg-white/20 border-white/30 text-white"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20"
            }`}
          >
            {showHidden ? "Show Visible Only" : "Show Hidden"}
          </button>
          {showAddButton && (
            <button
              onClick={() => router.push(addRoute)}
              className="px-4 py-2 bg-[#E51A4B] text-white rounded-lg hover:bg-[#c91742] transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        {/* Mobile Search and Filter */}
        <div className="md:hidden space-y-3">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E51A4B]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="w-full bg-white rounded-lg shadow-md p-3 flex items-center justify-center gap-2 hover:bg-[#E51A4B] hover:text-white transition-all"
          >
            <Filter size={18} />
            <span className="font-semibold">Filter & Sort</span>
            {(!selectedCategories.includes("All") || !sortByPrice) && (
              <span className="ml-auto bg-[#E51A4B] text-white text-xs px-2 py-1 rounded-full">
                {(!selectedCategories.includes("All") ? selectedCategories.length : 0) + (!sortByPrice ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Search and Filter */}
        <div className="hidden md:flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, property name, destination, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#E51A4B]"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-2 hover:bg-[#E51A4B] hover:text-white transition-all"
          >
            <Filter size={18} />
            <span className="font-semibold">Filter</span>
            {(!selectedCategories.includes("All") || !sortByPrice) && (
              <span className="bg-[#E51A4B] text-white text-xs px-2 py-1 rounded-full">
                {(!selectedCategories.includes("All") ? selectedCategories.length : 0) + (!sortByPrice ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Filter Panel */}
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="hidden md:block bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Filters</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {getCategories.map((category) => (
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
              <label className="block text-sm font-semibold text-white mb-2">
                Sort
              </label>
              <button
                onClick={() => setSortByPrice(!sortByPrice)}
                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  sortByPrice
                    ? "bg-[#E51A4B] text-white"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                <ArrowUpDown size={18} />
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
                className="w-full px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all font-medium"
              >
                Reset Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Mobile Filter Panel - Bottom Sheet */}
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
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-white/60 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 border-b border-white/20">
                <h3 className="text-xl font-bold text-white">Filter & Sort</h3>
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(false)}
                  className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-base font-semibold text-white mb-3">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {getCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                          selectedCategories.includes(category)
                            ? "bg-[#E51A4B] text-white shadow-md"
                            : "bg-white/10 text-white active:bg-white/20 border border-white/20"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Sort */}
                <div>
                  <label className="block text-base font-semibold text-white mb-3">
                    Sort
                  </label>
                  <button
                    type="button"
                    onClick={() => setSortByPrice(!sortByPrice)}
                    className={`w-full px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all min-h-[48px] ${
                      sortByPrice
                        ? "bg-[#E51A4B] text-white shadow-md"
                        : "bg-white/10 text-white active:bg-white/20 border border-white/20"
                    }`}
                  >
                    <ArrowUpDown size={18} />
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
                    className="w-full px-4 py-3.5 rounded-xl bg-white/10 text-white active:bg-white/20 border border-white/20 transition-all font-medium min-h-[48px]"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              {/* Apply Button - Sticky Bottom */}
              <div className="px-6 py-4 border-t border-white/20 bg-white/95 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(false)}
                  className="w-full bg-[#E51A4B] text-white py-3.5 rounded-xl font-semibold text-base shadow-lg active:bg-[#c4173f] transition-colors min-h-[48px]"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Results Count */}
      {filteredItems.length !== items.length && (
        <div className="mb-4 text-sm text-white/80">
          Showing {filteredItems.length} of {items.length} {title.toLowerCase()}
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
          <p className="text-white text-lg">No {title.toLowerCase()} found</p>
          {showAddButton && (
            <button
              onClick={() => router.push(addRoute)}
              className="mt-4 px-6 py-2 bg-[#E51A4B] text-white rounded-lg hover:bg-[#c91742] transition-colors"
            >
              Add Your First {getSingularForm(title)}
            </button>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
          <Search className="text-6xl text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
          <p className="text-white/80 mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategories(["All"]);
              setSortByPrice(true); // Reset to default sorting (low to high)
            }}
            className="bg-[#E51A4B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91742] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg border-2 overflow-hidden transition-all ${
                item.isHidden
                  ? "border-white/30 opacity-60"
                  : "border-white/20 hover:border-[#E51A4B] hover:shadow-lg"
              }`}
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-gray-100">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.name || "Item"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {item.isHidden && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Hidden
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">
                  {item.name || "Untitled"}
                </h3>
                {item.destinationSlug && (
                  <p className="text-sm text-white/70 mb-2">
                    Destination: {item.destinationSlug}
                  </p>
                )}
                {item.location && (
                  <p className="text-sm text-white/70 mb-2">
                    Location: {item.location}
                  </p>
                )}
                {(item.startingPrice !== undefined || item.packagePrice !== undefined) && (
                  <p className="text-[#E51A4B] font-bold text-lg mb-3">
                    ₹{item.startingPrice ?? item.packagePrice ?? 0}
                    {item.currency && ` ${item.currency}`}
                  </p>
                )}
                {item.createdAt && (
                  <p className="text-xs text-white/60 mb-3">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleView(item)}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleHide(item.id, item.isHidden || false)}
                    disabled={updating === item.id}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      item.isHidden
                        ? "bg-green-50 text-green-600 hover:bg-green-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {updating === item.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : item.isHidden ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewingItem && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingItem(null)}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E51A4B] to-[#FF6B6B] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Property Name - Prominent (Admin Only) */}
                    {viewingItem.propertyName ? (
                      <>
                        <h2 className="text-3xl font-bold mb-1">{viewingItem.propertyName}</h2>
                        <p className="text-white/90 text-sm font-medium mb-2">Display Name: {viewingItem.name || "Untitled"}</p>
                      </>
                    ) : (
                      <h2 className="text-2xl font-bold mb-2">{viewingItem.name || "Untitled"}</h2>
                    )}
                  </div>
                  <button
                    onClick={() => setViewingItem(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Cover Image */}
                {viewingItem.coverImage && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <Image
                      src={viewingItem.coverImage}
                      alt={viewingItem.name || "Item"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Basic Details Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Contact Number */}
                  {viewingItem.contactNumber && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="text-blue-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Contact Number</h3>
                      </div>
                      <a
                        href={`tel:${viewingItem.contactNumber}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {viewingItem.contactNumber}
                      </a>
                    </div>
                  )}

                  {/* Address */}
                  {viewingItem.address && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="text-indigo-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Address</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{viewingItem.address}</p>
                    </div>
                  )}

                  {/* Location */}
                  {viewingItem.location && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="text-green-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Location</h3>
                      </div>
                      <p className="text-gray-700">{viewingItem.location}</p>
                    </div>
                  )}

                  {/* Destination */}
                  {viewingItem.destinationSlug && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="text-purple-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Destination</h3>
                      </div>
                      <p className="text-gray-700">{viewingItem.destinationSlug}</p>
                    </div>
                  )}

                  {/* Category */}
                  {viewingItem.category && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="text-orange-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Category</h3>
                      </div>
                      <p className="text-gray-700">{viewingItem.category}</p>
                    </div>
                  )}

                  {/* Price */}
                  {(viewingItem.startingPrice !== undefined || viewingItem.packagePrice !== undefined) && (
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-600 font-bold">₹</span>
                        <h3 className="font-semibold text-gray-900">{viewingItem.packagePrice !== undefined ? "Package Price" : "Starting Price"}</h3>
                      </div>
                      <p className="text-gray-700 font-bold text-lg">
                        ₹{viewingItem.startingPrice ?? viewingItem.packagePrice ?? 0}
                        {viewingItem.currency && ` ${viewingItem.currency}`}
                        {viewingItem.originalPrice && (
                          <span className="text-gray-500 line-through text-sm ml-2">
                            ₹{viewingItem.originalPrice}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Created Date */}
                  {viewingItem.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="text-gray-600" size={18} />
                        <h3 className="font-semibold text-gray-900">Created</h3>
                      </div>
                      <p className="text-gray-700">
                        {new Date(viewingItem.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary/About */}
                {(viewingItem.summary || viewingItem.about) && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {viewingItem.summary || viewingItem.about}
                    </p>
                  </div>
                )}

                {/* DMC details (tour packages / admin) */}
                {viewingItem.dmcDetails?.trim() && (
                  <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">DMC details</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{viewingItem.dmcDetails.trim()}</p>
                  </div>
                )}

                {/* Includes */}
                {viewingItem.includes && viewingItem.includes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Includes</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {viewingItem.includes.map((inc: string, idx: number) => (
                        <li key={idx}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        viewingItem.isHidden
                          ? "bg-gray-100 text-gray-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {viewingItem.isHidden ? "Hidden" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-4 flex gap-3">
                <button
                  onClick={() => {
                    setViewingItem(null);
                    handleEdit(viewingItem.id);
                  }}
                  className="flex-1 px-4 py-2 bg-[#E51A4B] text-white rounded-lg hover:bg-[#c91742] transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

