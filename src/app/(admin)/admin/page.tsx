"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Image as ImageIcon, MapPin, Hotel, Activity, UtensilsCrossed, MessageSquare, Gift, TrendingUp, Users, Star, Package } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [greeting, setGreeting] = useState("");
  const [stats, setStats] = useState({
    destinations: 0,
    stays: 0,
    activities: 0,
    trips: 0,
    tourPackages: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [destinationsRes, staysRes, activitiesRes, tripsRes, tourPackagesRes, reviewsRes] = await Promise.all([
        fetch("/api/admin/destinations"),
        fetch("/api/admin/stays"),
        fetch("/api/admin/activities"),
        fetch("/api/admin/trips"),
        fetch("/api/admin/tour-packages"),
        fetch("/api/admin/reviews"),
      ]);

      const destinations = destinationsRes.ok ? await destinationsRes.json() : { data: [] };
      const stays = staysRes.ok ? await staysRes.json() : { data: [] };
      const activities = activitiesRes.ok ? await activitiesRes.json() : { data: [] };
      const trips = tripsRes.ok ? await tripsRes.json() : { data: [] };
      const tourPackages = tourPackagesRes.ok ? await tourPackagesRes.json() : { data: [] };
      const reviews = reviewsRes.ok ? await reviewsRes.json() : { data: [] };

      setStats({
        destinations: Array.isArray(destinations.data) ? destinations.data.length : destinations.data?.length || 0,
        stays: Array.isArray(stays.data) ? stays.data.length : stays.data?.length || 0,
        activities: Array.isArray(activities.data) ? activities.data.length : activities.data?.length || 0,
        trips: Array.isArray(trips.data) ? trips.data.length : trips.data?.length || 0,
        tourPackages: Array.isArray(tourPackages.data) ? tourPackages.data.length : tourPackages.data?.length || 0,
        reviews: Array.isArray(reviews.data) ? reviews.data.length : reviews.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { href: "/admin", label: "Home Page", icon: ImageIcon, color: "bg-blue-500" },
    { href: "/admin/destinations", label: "Destinations", icon: MapPin, color: "bg-green-500" },
    { href: "/admin/stays", label: "Stays", icon: Hotel, color: "bg-purple-500" },
    // { href: "/admin/things", label: "Things to Do", icon: Activity, color: "bg-orange-500" },
    // { href: "/admin/trips", label: "Food spots", icon: UtensilsCrossed, color: "bg-cyan-500" },
    // { href: "/admin/tour-packages", label: "Tour Packages", icon: Package, color: "bg-teal-500" },
    { href: "/admin/reviews", label: "Reviews", icon: MessageSquare, color: "bg-pink-500" },
    { href: "/admin/loyalty-points", label: "Loyalty Points", icon: Gift, color: "bg-red-500" },
    { href: "/admin/leads", label: "Website Leads", icon: Users, color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {greeting}, Admin! 👋
          </h1>
          <p className="text-white/80 text-lg">
            Welcome to the Tripeloo Admin Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Destinations"
            value={stats.destinations}
            icon={MapPin}
            color="bg-green-500/20 border-green-500/50"
            iconColor="text-green-400"
          />
          <StatCard
            label="Stays"
            value={stats.stays}
            icon={Hotel}
            color="bg-purple-500/20 border-purple-500/50"
            iconColor="text-purple-400"
          />
          {/* <StatCard
            label="Things to Do"
            value={stats.activities}
            icon={Activity}
            color="bg-orange-500/20 border-orange-500/50"
            iconColor="text-orange-400"
          />
          <StatCard
            label="Food spots"
            value={stats.trips}
            icon={UtensilsCrossed}
            color="bg-cyan-500/20 border-cyan-500/50"
            iconColor="text-cyan-400"
          />
          <StatCard
            label="Tour Packages"
            value={stats.tourPackages}
            icon={Package}
            color="bg-teal-500/20 border-teal-500/50"
            iconColor="text-teal-400"
          /> */}
          <StatCard
            label="Reviews"
            value={stats.reviews}
            icon={Star}
            color="bg-pink-500/20 border-pink-500/50"
            iconColor="text-pink-400"
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-4 transition-all duration-200 hover:scale-105"
              >
                <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">{link.label}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity / Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/destinations/add"
                className="block w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                + Add New Destination
              </Link>
              <Link
                href="/admin/stays/add"
                className="block w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                + Add New Stay
              </Link>
              {/* <Link
                href="/admin/things/add"
                className="block w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                + Add New Activity
              </Link>
              <Link
                href="/admin/trips/add"
                className="block w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                + Add New Trip
              </Link>
              <Link
                href="/admin/tour-packages/add"
                className="block w-full bg-[#E51A4B] hover:bg-[#c91742] text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
              >
                + Add New Tour Package
              </Link> */}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Management
            </h3>
            <div className="space-y-3">
              <Link
                href="/admin/destinations/list"
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center border border-white/20"
              >
                Manage Destinations
              </Link>
              <Link
                href="/admin/stays/list"
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center border border-white/20"
              >
                Manage Stays
              </Link>
              {/* <Link
                href="/admin/things/list"
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center border border-white/20"
              >
                Manage Activities
              </Link>
              <Link
                href="/admin/trips/list"
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center border border-white/20"
              >
                Manage Food spots
              </Link>
              <Link
                href="/admin/tour-packages/list"
                className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center border border-white/20"
              >
                Manage Tour Packages
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  iconColor,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`${color} border rounded-xl p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
