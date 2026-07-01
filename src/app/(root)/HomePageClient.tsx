"use client";

import { Hero } from '@/components/Hero';
import { FeaturedDestinations } from '@/components/FeaturedDestinations';
import { HomeStaysByDestination } from '@/components/HomeStaysByDestination';
import OurSpecialities from '@/components/OurSpecialities';
import StatisticsSection from '@/components/StatisticsSection';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import { MixedCardsCarousel } from '@/components/MixedCardsCarousel';
import { useEffect, useState } from 'react';

interface HomePageData {
  heroDesktopImage: string;
  heroMobileImage: string;
  discoverTitle: string;
  discoverContent: string;
  discoverButtonText: string;
  discoverButtonLink: string;
  testimonialsHeading: string;
  testimonials: Array<{
    id: string;
    image: string;
    title: string;
    experience: string;
    name: string;
    location: string;
  }>;
  heroBanners?: Array<{
    id: string;
    image: string;
    title?: string;
    link?: string;
  }>;
}

export default function HomePageClient() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await fetch('/api/home');
      if (res.ok) {
        const data = await res.json();
        setHomeData(data.data);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E51A4B]"></div>
      </main>
    );
  }

  return (
    <>
      <Hero 
        banners={homeData?.heroBanners}
      />
      <FeaturedDestinations />
      <HomeStaysByDestination />
      <MixedCardsCarousel />
      <StatisticsSection />
      <OurSpecialities />
      <TestimonialsCarousel 
        heading={homeData?.testimonialsHeading}
        testimonials={homeData?.testimonials}
      />
    </>
  );
}

