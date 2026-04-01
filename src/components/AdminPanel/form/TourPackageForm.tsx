"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import {
  TOUR_PACKAGE_DURATION_OPTIONS,
  type TourPackageFormType,
} from "@/types/tour-package";

interface FormErrors {
  name?: string;
  destinationSlug?: string;
  coverImage?: string;
  packagePrice?: string;
  numberOfDays?: string;
  numberOfNights?: string;
  general?: string;
}

interface CarouselImage {
  url: string;
  title: string;
}

interface FormData {
  name: string;
  destinationSlug: string;
  coverImage: string;
  carouselImages: CarouselImage[];
  summary: string;
  packagePrice: string;
  currency: string;
  numberOfDays: string;
  numberOfNights: string;
  durationOptions: string[];
  inclusions: string[];
  exclusions: string[];
  tripHighlights: string[];
  detailedItinerary: string;
  countrySpecificGuidelines: string;
  dmcDetails: string;
  formType: TourPackageFormType;
}

interface TourPackageFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function TourPackageForm({ initialData, isEdit = false }: TourPackageFormProps = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    destinationSlug: "",
    coverImage: "",
    carouselImages: [],
    summary: "",
    packagePrice: "",
    currency: "INR",
    numberOfDays: "0",
    numberOfNights: "0",
    durationOptions: [],
    inclusions: [],
    exclusions: [],
    tripHighlights: [],
    detailedItinerary: "",
    countrySpecificGuidelines: "",
    dmcDetails: "",
    formType: "enquiry",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [destinations, setDestinations] = useState<Array<{ slug: string; name: string }>>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [editingInclude, setEditingInclude] = useState<number | null>(null);
  const [editingIncludeValue, setEditingIncludeValue] = useState("");
  const [editingExclude, setEditingExclude] = useState<number | null>(null);
  const [editingExcludeValue, setEditingExcludeValue] = useState("");
  const [editingHighlight, setEditingHighlight] = useState<number | null>(null);
  const [editingHighlightValue, setEditingHighlightValue] = useState("");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch("/api/destinations");
        if (res.ok) {
          const data = await res.json();
          setDestinations(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        name: initialData.name || "",
        destinationSlug: initialData.destinationSlug || "",
        coverImage: initialData.coverImage || "",
        carouselImages: (initialData.carouselImages || []).map((img: any) => {
          if (typeof img === "string") return { url: img.trim(), title: "" };
          const url =
            (typeof img?.url === "string" && img.url) ||
            (typeof img?.src === "string" && img.src) ||
            "";
          const title =
            (typeof img?.title === "string" && img.title) ||
            (typeof img?.caption === "string" && img.caption) ||
            "";
          return { url: url.trim(), title };
        }),
        summary: initialData.summary || "",
        packagePrice: initialData.packagePrice?.toString() ?? "",
        currency: initialData.currency || "INR",
        numberOfDays: initialData.numberOfDays?.toString() ?? "0",
        numberOfNights: initialData.numberOfNights?.toString() ?? "0",
        durationOptions: Array.isArray(initialData.durationOptions) ? initialData.durationOptions : [],
        inclusions: initialData.inclusions || [],
        exclusions: initialData.exclusions || [],
        tripHighlights: initialData.tripHighlights || [],
        detailedItinerary: initialData.detailedItinerary || "",
        countrySpecificGuidelines: initialData.countrySpecificGuidelines || "",
        dmcDetails: initialData.dmcDetails || "",
        formType: initialData.formType === "booking" || initialData.formType === "lead" ? initialData.formType : "enquiry",
      });
      setImagePreview(initialData.coverImage || "");
    }
  }, [initialData, isEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isCarousel = false,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, coverImage: "Please upload a valid image (JPEG, PNG, or WebP)" }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, coverImage: "Image size must be less than 10MB" }));
      return;
    }
    setIsUploading(true);
    setErrors((prev) => ({ ...prev, coverImage: undefined }));
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: uploadFormData });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await response.json();
      if (isCarousel && index !== undefined) {
        const updated = [...formData.carouselImages];
        updated[index] = { ...updated[index], url: data.url };
        setFormData((prev) => ({ ...prev, carouselImages: updated }));
      } else {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
        setImagePreview(data.url);
      }
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, coverImage: err.message || "Failed to upload" }));
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDurationOption = (opt: string) => {
    setFormData((prev) => {
      const has = prev.durationOptions.includes(opt);
      return {
        ...prev,
        durationOptions: has
          ? prev.durationOptions.filter((o) => o !== opt)
          : [...prev.durationOptions, opt],
      };
    });
  };

  const addListItem = (
    field: "inclusions" | "exclusions" | "tripHighlights",
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const val = input.trim();
    if (!val || formData[field].includes(val)) return;
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], val] }));
    setInput("");
  };

  const removeListItem = (field: "inclusions" | "exclusions" | "tripHighlights", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
    if (field === "inclusions") setEditingInclude(null);
    if (field === "exclusions") setEditingExclude(null);
    if (field === "tripHighlights") setEditingHighlight(null);
  };

  const addCarouselImage = () => {
    setFormData((prev) => ({
      ...prev,
      carouselImages: [...prev.carouselImages, { url: "", title: "" }],
    }));
  };
  const removeCarouselImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      carouselImages: prev.carouselImages.filter((_, i) => i !== index),
    }));
  };
  const updateCarouselImage = (index: number, field: "url" | "title", value: string) => {
    const updated = [...formData.carouselImages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, carouselImages: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Package name is required";
    if (!formData.destinationSlug) newErrors.destinationSlug = "Destination is required";
    if (!formData.coverImage.trim()) newErrors.coverImage = "Cover image is required";
    const priceNum = Number(formData.packagePrice);
    if (formData.packagePrice !== "" && (isNaN(priceNum) || priceNum < 0))
      newErrors.packagePrice = "Package price must be 0 or more";
    const days = Number(formData.numberOfDays);
    const nights = Number(formData.numberOfNights);
    if (isNaN(days) || days < 0) newErrors.numberOfDays = "Days must be 0 or more";
    if (isNaN(nights) || nights < 0) newErrors.numberOfNights = "Nights must be 0 or more";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const url =
        isEdit && initialData?.id
          ? `/api/admin/tour-packages/${initialData.id}`
          : "/api/tour-packages/create";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        name: formData.name.trim(),
        destinationSlug: formData.destinationSlug,
        coverImage: formData.coverImage.trim(),
        carouselImages: formData.carouselImages,
        summary: formData.summary.trim(),
        packagePrice: priceNum,
        currency: formData.currency,
        numberOfDays: days,
        numberOfNights: nights,
        durationOptions: formData.durationOptions,
        inclusions: formData.inclusions,
        exclusions: formData.exclusions,
        tripHighlights: formData.tripHighlights,
        detailedItinerary: formData.detailedItinerary.trim(),
        countrySpecificGuidelines: formData.countrySpecificGuidelines.trim(),
        dmcDetails: formData.dmcDetails.trim(),
        formType: formData.formType,
      };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ general: data.error || "Failed to save" });
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(isEdit ? "Tour package updated!" : "Tour package created!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => router.push("/admin/tour-packages"), 1500);
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {isEdit ? "Edit Tour Package" : "Add Tour Package"}
        </h2>
        <p className="text-gray-600 mb-8">
          {isEdit ? "Update the tour package details." : "Fill in the details for the new tour package."}
        </p>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Package Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Kerala Backwaters 5D/4N"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#E51A4B] ${errors.name ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Destination <span className="text-red-500">*</span></label>
              <select
                name="destinationSlug"
                value={formData.destinationSlug}
                onChange={handleInputChange}
                disabled={loadingDestinations}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#E51A4B] ${errors.destinationSlug ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select Destination</option>
                {destinations.map((d) => (
                  <option key={d.slug} value={d.slug}>{d.name}</option>
                ))}
              </select>
              {errors.destinationSlug && <p className="mt-1 text-sm text-red-600">{errors.destinationSlug}</p>}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image <span className="text-red-500">*</span></label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => handleImageUpload(e)}
                className="hidden"
                id="coverImage"
              />
              <label
                htmlFor="coverImage"
                className={`flex items-center gap-2 px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer ${isUploading ? "border-blue-400 bg-blue-50" : errors.coverImage ? "border-red-500" : "border-gray-300 hover:border-[#E51A4B]"}`}
              >
                {isUploading ? <Loader2 className="animate-spin text-blue-600" size={20} /> : <Upload size={20} />}
                <span>{formData.coverImage ? "Change Image" : "Upload Cover Image"}</span>
              </label>
              {formData.coverImage && !isUploading && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16} /> Uploaded</span>}
            </div>
            {imagePreview && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 mt-3">
                <Image src={imagePreview} alt="Cover" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setFormData((p) => ({ ...p, coverImage: "" })); setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {errors.coverImage && <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>}
          </div>

          {/* Carousel (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Carousel Images (Optional)</label>
            {formData.carouselImages.map((img, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-2 flex flex-col sm:flex-row flex-wrap gap-4 items-start">
                {img.url?.trim() ? (
                  <div className="w-full sm:w-44 h-28 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={img.url.trim()}
                      alt={img.title?.trim() || `Carousel ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-44 h-28 shrink-0 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500 text-center px-2">
                    No image — upload below
                  </div>
                )}
                <div className="flex-1 min-w-[200px] space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true, index)}
                    className="w-full max-w-md text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {img.url?.trim() ? "Choose a file to replace this image." : "Upload an image for this slot."}
                  </p>
                  <input
                    type="text"
                    placeholder="Caption"
                    value={img.title}
                    onChange={(e) => updateCarouselImage(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button type="button" onClick={() => removeCarouselImage(index)} className="text-red-600 hover:text-red-700 self-start sm:self-center" aria-label="Remove carousel image">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addCarouselImage} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <Plus size={16} /> Add image
            </button>
          </div>

          {/* Pricing & Duration */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Duration</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package Price <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="packagePrice"
                  value={formData.packagePrice}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.packagePrice ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.packagePrice && <p className="mt-1 text-sm text-red-600">{errors.packagePrice}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Days</label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.numberOfDays ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.numberOfDays && <p className="mt-1 text-sm text-red-600">{errors.numberOfDays}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Nights</label>
                <input
                  type="number"
                  name="numberOfNights"
                  value={formData.numberOfNights}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-lg ${errors.numberOfNights ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.numberOfNights && <p className="mt-1 text-sm text-red-600">{errors.numberOfNights}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Duration options (multi-select)</label>
              <p className="text-xs text-gray-500 mb-2">Select which duration options this package is available in.</p>
              <div className="flex flex-wrap gap-2">
                {TOUR_PACKAGE_DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleDurationOption(opt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      formData.durationOptions.includes(opt)
                        ? "bg-[#E51A4B] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Summary (Optional)</label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              rows={4}
              placeholder="Brief description of the tour..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E51A4B] resize-none"
            />
          </div>

          {/* Inclusions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addListItem("inclusions", includeInput, setIncludeInput); } }}
                placeholder="e.g. Accommodation"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button type="button" onClick={() => addListItem("inclusions", includeInput, setIncludeInput)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.inclusions.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                  {editingInclude === i ? (
                    <>
                      <input
                        value={editingIncludeValue}
                        onChange={(e) => setEditingIncludeValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { const v = editingIncludeValue.trim(); if (v) { const arr = [...formData.inclusions]; arr[i] = v; setFormData((p) => ({ ...p, inclusions: arr })); setEditingInclude(null); } } }}
                        className="w-32 outline-none border-b border-green-600"
                        autoFocus
                      />
                      <button type="button" onClick={() => { const v = editingIncludeValue.trim(); if (v) { const arr = [...formData.inclusions]; arr[i] = v; setFormData((p) => ({ ...p, inclusions: arr })); } setEditingInclude(null); }}><CheckCircle size={14} /></button>
                    </>
                  ) : (
                    <>
                      {item}
                      <button type="button" onClick={() => { setEditingInclude(i); setEditingIncludeValue(item); }}><Pencil size={12} /></button>
                      <button type="button" onClick={() => removeListItem("inclusions", i)}><X size={14} /></button>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Exclusions</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addListItem("exclusions", excludeInput, setExcludeInput); } }}
                placeholder="e.g. Personal expenses"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button type="button" onClick={() => addListItem("exclusions", excludeInput, setExcludeInput)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.exclusions.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">
                  {editingExclude === i ? (
                    <>
                      <input value={editingExcludeValue} onChange={(e) => setEditingExcludeValue(e.target.value)} className="w-32 outline-none border-b border-orange-600" autoFocus />
                      <button type="button" onClick={() => { const v = editingExcludeValue.trim(); if (v) { const arr = [...formData.exclusions]; arr[i] = v; setFormData((p) => ({ ...p, exclusions: arr })); } setEditingExclude(null); }}><CheckCircle size={14} /></button>
                    </>
                  ) : (
                    <>
                      {item}
                      <button type="button" onClick={() => { setEditingExclude(i); setEditingExcludeValue(item); }}><Pencil size={12} /></button>
                      <button type="button" onClick={() => removeListItem("exclusions", i)}><X size={14} /></button>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Trip highlights */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trip highlights (Key experiences & major attractions)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addListItem("tripHighlights", highlightInput, setHighlightInput); } }}
                placeholder="e.g. Houseboat stay"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button type="button" onClick={() => addListItem("tripHighlights", highlightInput, setHighlightInput)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tripHighlights.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                  {editingHighlight === i ? (
                    <>
                      <input value={editingHighlightValue} onChange={(e) => setEditingHighlightValue(e.target.value)} className="w-32 outline-none border-b border-purple-600" autoFocus />
                      <button type="button" onClick={() => { const v = editingHighlightValue.trim(); if (v) { const arr = [...formData.tripHighlights]; arr[i] = v; setFormData((p) => ({ ...p, tripHighlights: arr })); } setEditingHighlight(null); }}><CheckCircle size={14} /></button>
                    </>
                  ) : (
                    <>
                      {item}
                      <button type="button" onClick={() => { setEditingHighlight(i); setEditingHighlightValue(item); }}><Pencil size={12} /></button>
                      <button type="button" onClick={() => removeListItem("tripHighlights", i)}><X size={14} /></button>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed itinerary (formData field type = textarea) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed itinerary</label>
            <textarea
              name="detailedItinerary"
              value={formData.detailedItinerary}
              onChange={handleInputChange}
              rows={10}
              placeholder="Day-wise or section-wise itinerary. Plain text or structured as you like."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E51A4B] resize-y"
            />
          </div>

          {/* Country-specific guidelines */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country-specific guidelines (Optional)</label>
            <textarea
              name="countrySpecificGuidelines"
              value={formData.countrySpecificGuidelines}
              onChange={handleInputChange}
              rows={5}
              placeholder="Visa, health, local rules, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E51A4B] resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">DMC details (Optional)</label>
            <p className="text-xs text-gray-500 mb-2">DMC contacts and notes (visible in admin tour package view).</p>
            <textarea
              name="dmcDetails"
              value={formData.dmcDetails}
              onChange={handleInputChange}
              rows={5}
              placeholder="e.g. DMC name, account manager, phone, email, escalation notes…"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E51A4B] resize-y"
            />
          </div>

          {/* Form type: booking / lead / enquiry */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">On package page, show</label>
            <div className="flex gap-4">
              {(["booking", "lead", "enquiry"] as TourPackageFormType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="formType"
                    value={t}
                    checked={formData.formType === t}
                    onChange={() => setFormData((p) => ({ ...p, formType: t }))}
                    className="text-[#E51A4B] focus:ring-[#E51A4B]"
                  />
                  <span className="capitalize">{t} form</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Form will collect: Name, Email, Contact (required); Preferred travel date, Number of travelers, Budget, Departure city (optional).</p>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-[#E51A4B] hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : isEdit ? "Update Package" : "Create Package"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/tour-packages")}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
