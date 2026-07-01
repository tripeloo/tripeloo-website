"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Phone, User, LogOut, Search, X } from 'lucide-react';
import type { Destination } from '@/types/destination';

export function Header() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('stays');
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const { data: session, status } = useSession();

  // Prevent hydration mismatch by only rendering session-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch destinations when search modal opens
  useEffect(() => {
    if (showSearchModal && destinations.length === 0) {
      setLoadingDestinations(true);
      fetch('/api/destinations')
        .then(res => res.json())
        .then(data => {
          setDestinations(data.data || []);
          setLoadingDestinations(false);
        })
        .catch(() => {
          setLoadingDestinations(false);
        });
    }
  }, [showSearchModal, destinations.length]);

  const handleSearchSubmit = () => {
    if (!selectedDestination) {
      alert('Please select a destination');
      return;
    }

    const destinationName = encodeURIComponent(selectedDestination);
    let categoryParam = '';
    
    if (selectedCategory === 'getaways' || selectedCategory === 'restaurants-cafes') {
      categoryParam = 'restaurants-cafes';
    } else if (selectedCategory === 'things-to-do') {
      categoryParam = 'things-to-do';
    }
    // stays is default, so no category param needed

    const queryParams = new URLSearchParams({
      destination: destinationName,
    });
    
    if (categoryParam) {
      queryParams.set('category', categoryParam);
    }

    setShowSearchModal(false);
    router.push(`/stay-listings?${queryParams.toString()}`);
  };

  const openMenu = () => {
    setClosing(false);
    setOpen(true);
  };

  const closeMenu = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };

  return (
    <header className={`${isHomePage ? 'absolute' : 'relative'} top-0 z-30 w-full ${isHomePage ? 'bg-transparent' : 'bg-white shadow-md'}`}>
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button aria-label="Open Menu" className="md:hidden text-gray-900" onClick={openMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo_new.png"
              alt="Tripeloo Logo"
              width={150}
              height={50}
              className={`h-10 sm:h-12 lg:h-16 w-auto`}
              priority
            />
          </Link>
        </div>

        <nav className={`hidden md:flex items-center gap-6 text-sm text-gray-900 font-semibold`}>
          <Link href="/" className="hover:text-[#E51A4B] font-semibold">Home</Link>
          <Link href="/destinations" className="hover:text-[#E51A4B] font-semibold">Destinations</Link>
          <Link href="/about" className="hover:text-[#E51A4B] font-semibold">About / Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Search Icon - Mobile & Desktop */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="text-gray-900 hover:text-[#E51A4B] transition-colors p-2"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Call Assistance - Desktop */}
          <a
            href="tel:90379179463"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-50 px-4 py-2 text-sm font-semibold transition"
          >
            <Phone size={16} />
            <span>Call Assistance</span>
          </a>
          
          {/* Call Icon - Mobile */}
          <a
            href="tel:90379179463"
            className="md:hidden text-gray-900 hover:text-[#E51A4B] transition-colors p-2"
            aria-label="Call Assistance"
          >
            <Phone size={20} />
          </a>
          
          {mounted && session?.user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-50 px-4 py-2 text-sm font-semibold transition"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <User size={16} />
                )}
                <span className="hidden sm:inline">{session.user.name?.split(' ')[0] || 'User'}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    {(session.user as any).loyaltyPoints !== undefined && (
                      <p className="text-xs text-[#E51A4B] font-semibold mt-1">
                        {((session.user as any).loyaltyPoints || 0)} Loyalty Points
                      </p>
                    )}
                  </div>
                  <Link
                    href="/loyalty-points"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    View Loyalty Points
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : mounted ? (
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-900 hover:bg-gray-50 px-4 py-2 text-sm font-semibold transition">Login</Link>
          ) : (
            <div className="inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-900 px-4 py-2 text-sm font-semibold opacity-0">Login</div>
          )}
        </div>
      </div>

      {(open || closing) && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={closeMenu} />
          <div className={`absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white text-gray-900 shadow-xl ${closing ? 'animate-slide-out-left' : 'animate-slide-in-left'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Image
                src="/assets/logo_new.png"
                alt="Tripeloo Logo"
                width={130}
                height={43}
                className="h-10 w-auto"
              />
              <button aria-label="Close Menu" className="p-2" onClick={closeMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="grid gap-2 p-4 text-sm">
              <Link href="/" className="py-2 hover:text-brand" onClick={closeMenu}>Home</Link>
              <Link href="/destinations" className="py-2 hover:text-brand" onClick={closeMenu}>Destinations</Link>
              <Link href="/about" className="py-2 hover:text-brand" onClick={closeMenu}>About / Contact</Link>
            </nav>
            <div className="p-4 border-t border-gray-100 space-y-3">
              <a
                href="tel:90379179463"
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                onClick={closeMenu}
              >
                <Phone size={18} />
                <span>Call Assistance</span>
              </a>
              {mounted && session?.user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                    <p className="text-xs text-gray-500">{session.user.email}</p>
                    {(session.user as any).loyaltyPoints !== undefined && (
                      <p className="text-xs text-[#E51A4B] font-semibold mt-1">
                        {((session.user as any).loyaltyPoints || 0)} Loyalty Points
                      </p>
                    )}
                  </div>
                  <Link
                    href="/loyalty-points"
                    className="block text-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                    onClick={closeMenu}
                  >
                    View Loyalty Points
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      closeMenu();
                    }}
                    className="w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : mounted ? (
                <Link href="/login" className="flex-1 inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition" onClick={closeMenu}>Login</Link>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900">Search Destinations</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Destination Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Destination
                </label>
                {loadingDestinations ? (
                  <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    <p className="text-sm text-gray-500">Loading destinations...</p>
                  </div>
                ) : (
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E51A4B] focus:border-transparent"
                  >
                    <option value="">Choose a destination...</option>
                    {destinations.map((dest) => (
                      <option key={dest._id || dest.slug} value={dest.name}>
                        {dest.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Category
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setSelectedCategory('stays')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition ${
                      selectedCategory === 'stays'
                        ? 'border-[#E51A4B] bg-[#E51A4B] text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Stays
                  </button>
                  {/* Things to Do — commented out, stays only
                  <button
                    onClick={() => setSelectedCategory('things-to-do')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition ${
                      selectedCategory === 'things-to-do'
                        ? 'border-[#E51A4B] bg-[#E51A4B] text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Things to Do
                  </button>
                  Food spots — commented out
                  <button
                    onClick={() => setSelectedCategory('restaurants-cafes')}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition ${
                      selectedCategory === 'restaurants-cafes' || selectedCategory === 'getaways'
                        ? 'border-[#E51A4B] bg-[#E51A4B] text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Food spots
                  </button>
                  */}
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSearchSubmit}
                disabled={!selectedDestination}
                className="w-full bg-[#E51A4B] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

