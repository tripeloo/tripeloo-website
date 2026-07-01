import { assets } from "../../../assets/assets";
import Image from "next/image";
import ContactSection from "@/components/Contact";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Tripeloo - your trusted travel companion for discovering beautiful resorts, thrilling adventure activities, and tailor-made getaways across South India. We make travel planning effortless and enjoyable.",
  keywords: [
    'about Tripeloo',
    'travel company',
    'travel agency',
    'resort booking',
    'holiday packages',
    'travel services',
  ],
  openGraph: {
    title: "About Us | Tripeloo",
    description: "Learn about Tripeloo - your trusted travel companion for discovering beautiful resorts, thrilling adventure activities, and tailor-made getaways across South India.",
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: 'About Tripeloo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "About Us | Tripeloo",
    description: "Learn about Tripeloo - your trusted travel companion for discovering beautiful resorts, thrilling adventure activities, and tailor-made getaways across South India.",
  },
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

const About = () => {
  return (
    <div className="text-black min-h-screen ">
      {/* ---------- About Section ---------- */}
      <section className="relative px-6 sm:px-10 py-16 overflow-hidden">
        {/* Background Image with subtle overlay */}
        <Image
          src={assets.about}
          alt="Luxury stay background"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-10"
        />

        <div className="relative mt-5 z-10 max-w-6xl mx-auto">
          <h2 className="text-center text-3xl sm:text-4xl font-semibold text-[#E51A4B] mb-12">
            About <span className="text-red-400 font-bold">Us</span>
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Overlapping Image Style */}
            <div className="relative w-full md:w-1/2 flex justify-center">
              <div className="relative w-[320px] sm:w-[400px]">
                <Image
                  src={assets.staysfeatures}
                  alt="Tripeloo"
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-2xl shadow-xl object-cover"
                />

                {/* Smaller overlapping image (for visual style) */}
                <div className="absolute bottom-[-30px] right-[-30px] w-[160px] sm:w-[200px] rounded-xl overflow-hidden shadow-md border-4 border-white">
                  <Image
                    src={assets.img}
                    alt="Luxury resort"
                    width={200}
                    height={150}
                    className="object-cover w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* About Content */}
            <div className="flex flex-col gap-6 md:w-1/2 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                Welcome to <b className="text-sky-800">Tripeloo</b> — your
                trusted travel companion for discovering the most beautiful
                resorts, thrilling adventure activities, and tailor-made getaways
                across South India. We're here to make travel planning effortless,
                enjoyable, and truly unforgettable.
              </p>

              <h3 className="text-2xl font-semibold text-gray-800 mt-2">
                WHAT WE OFFER:
              </h3>
              <p>
                At <b className="text-sky-800">Tripeloo</b>, we connect
                travelers with handpicked resorts, curated staycation packages,
                and unique local experiences. From luxury beach stays to
                beautiful mountain trails, our platform lets you explore, compare, and
                book with ease — bringing transparency, comfort, and excitement
                to every step of your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Contact Section ---------- */}
      <section className="px-6 sm:px-10 py-16 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-8xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#E51A4B] mb-12">
            Contact <span className="text-red-400 font-bold">Us</span>
          </h2>
          <ContactSection />
        </div>
      </section>

      {/* ---------- Legal & Policies Section ---------- */}
      <section className="px-6 sm:px-10 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#E51A4B] mb-12 text-center">
            Legal & <span className="text-red-400 font-bold">Policies</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Privacy Policy</h3>
              <p className="text-gray-600 mb-4">
                Learn how we collect, use, store, and protect your personal information.
              </p>
              <a
                href="/privacy"
                className="text-[#E51A4B] font-semibold hover:underline inline-flex items-center gap-2"
              >
                Read Privacy Policy →
              </a>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
              <p className="text-gray-600 mb-4">
                Understand the terms and conditions for using our platform and services.
              </p>
              <a
                href="/terms"
                className="text-[#E51A4B] font-semibold hover:underline inline-flex items-center gap-2"
              >
                Read Terms →
              </a>
            </div>

          </div>

          {/* Contact Information Box */}
          <div className="mt-12 bg-gradient-to-r from-[#E51A4B] to-[#c91742] rounded-lg p-8 text-white">
            <h3 className="text-2xl font-semibold mb-6 text-center">Get in Touch</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-semibold mb-2">Company</p>
                <p className="text-white/90">Tripeloo Travel Management LLP</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Location</p>
                <p className="text-white/90">South Beach, Calicut, Kerala</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Contact</p>
                <p className="text-white/90">
                  <a href="tel:90379179463" className="hover:underline">90379179463</a>
                </p>
                <p className="text-white/90">
                  <a href="mailto:support@tripeloo.com" className="hover:underline">support@tripeloo.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
