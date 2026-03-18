"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Phone, Mail, Filter, X, Download } from "lucide-react";

interface Lead {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  destination: string;
  travelCount: number;
  travelDate: string;
  createdAt: string;
  status: string;
  itemName?: string;
  itemType?: string;
  selectedDurationOptions?: string[];
  numberOfTravelers?: number;
  budget?: string;
  message?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<string[]>([]);
  
  // Filters
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    fetchDestinations();
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [selectedDestination, selectedDate, selectedStatus]);

  const fetchDestinations = async () => {
    try {
      const res = await fetch("/api/admin/destinations");
      if (res.ok) {
        const data = await res.json();
        const destNames = (data.data || []).map((d: any) => d.name);
        setDestinations(destNames);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDestination) params.append("destination", selectedDestination);
      if (selectedDate) params.append("date", selectedDate);
      if (selectedStatus) params.append("status", selectedStatus);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDestination("");
    setSelectedDate("");
    setSelectedStatus("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportToCSV = () => {
    const headers = ["Full Name", "Mobile Number", "Email", "Destination", "Travel Count", "Number of People", "Travel Date", "Budget", "Message", "Created At", "Status", "Item (Package)", "Selected Durations"];
    const rows = leads.map(lead => [
      lead.fullName,
      lead.mobileNumber,
      lead.email || "",
      lead.destination,
      lead.travelCount.toString(),
      (lead.numberOfTravelers ?? lead.travelCount).toString(),
      formatDate(lead.travelDate),
      lead.budget || "",
      (lead.message || "").replace(/"/g, '""'),
      formatDate(lead.createdAt),
      lead.status,
      lead.itemName || "",
      (lead.selectedDurationOptions || []).join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters = selectedDestination || selectedDate || selectedStatus;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Website Leads
          </h1>
          <p className="text-white/80 text-lg">
            Manage and filter leads from the website
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-white/80 hover:text-white flex items-center gap-2 text-sm"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Destination Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Destination
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E51A4B]"
              >
                <option value="">All Destinations</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest} className="bg-gray-800">
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Travel Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E51A4B]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E51A4B]"
              >
                <option value="">All Status</option>
                <option value="new" className="bg-gray-800">New</option>
                <option value="contacted" className="bg-gray-800">Contacted</option>
                <option value="converted" className="bg-gray-800">Converted</option>
                <option value="closed" className="bg-gray-800">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats and Export */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-white">
            <span className="text-2xl font-bold">{leads.length}</span>
            <span className="text-white/80 ml-2">Total Leads</span>
          </div>
          {leads.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#E51A4B] hover:bg-[#c91742] text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Leads Table */}
        {loading ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B] mx-auto"></div>
            <p className="text-white/80 mt-4">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
            <p className="text-white/80 text-lg">No leads found</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-[#E51A4B] hover:text-[#c91742]"
              >
                Clear filters to see all leads
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Destination</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Travelers</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Travel Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Budget</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Message</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{lead.fullName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white/80">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${lead.mobileNumber}`} className="hover:text-white">
                            {lead.mobileNumber}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-white/80">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{lead.destination || "—"}</span>
                          </div>
                          {lead.itemType === "tour-package" && lead.itemName && (
                            <span className="text-xs text-white/60">Package: {lead.itemName}</span>
                          )}
                          {lead.selectedDurationOptions && lead.selectedDurationOptions.length > 0 && (
                            <span className="text-xs text-teal-300">Duration: {lead.selectedDurationOptions.join(", ")}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-white/80">
                          <Users className="w-4 h-4" />
                          {lead.travelCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(lead.travelDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm max-w-[100px] truncate" title={lead.budget || ""}>
                        {lead.budget || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm max-w-[140px] truncate" title={lead.message || ""}>
                        {lead.message || "—"}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-300' :
                          lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                          lead.status === 'converted' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

