"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-16 border-t border-gray-100 bg-white">
      <div className="container py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Image
              src="/assets/logo_new.png"
              alt="Tripeloo Logo"
              width={150}
              height={50}
              className="h-10 sm:h-12 w-auto mb-2"
            />
            <p className="mt-2 text-sm text-gray-600">India&apos;s travel platform for stays.</p>
            {/* Was: stays, activities, and curated trips */}
          </div>
          <div>
            <div className="font-semibold">Quick Links</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li><Link className="hover:text-brand" href="/privacy">Privacy</Link></li>
              <li><Link className="hover:text-brand" href="/terms">Terms</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Connect</div>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a className="hover:text-brand" href="https://www.instagram.com/tripeloo/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a className="hover:text-brand" href="https://www.facebook.com/tripeloo" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a className="hover:text-brand" href="https://wa.me/9190379179463" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Contact</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-medium">Email:</span>{' '}
                <a className="hover:text-brand underline underline-offset-2" href="mailto:support@tripeloo.com">support@tripeloo.com</a>
              </li>
              <li>
                <span className="font-medium">Phone:</span>{' '}
                <a className="hover:text-brand underline underline-offset-2" href="tel:90379179463">90379179463</a>
              </li>
              <li className="mt-2">
                <span className="font-medium">Address:</span>
                <p className="text-gray-600">South Beach, Calicut, Kerala</p>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-500">© {currentYear} Tripeloo. All rights reserved.</div>
      </div>
    </footer>
  );
}

