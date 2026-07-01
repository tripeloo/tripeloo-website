import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tripeloo',
  description: 'Tripeloo Privacy Policy - Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E51A4B] mb-4">
            Tripeloo – Privacy Policy
          </h1>
          
          <div className="text-sm text-gray-600 mb-8 space-y-1">
            <p><strong>Effective Date:</strong> January 2025</p>
            <p><strong>Company:</strong> Tripeloo Travel Management LLP</p>
            <p><strong>Location:</strong> South Beach, Calicut, Kerala</p>
            <p><strong>Phone:</strong> <a href="tel:90379179463" className="text-[#E51A4B] hover:underline">90379179463</a></p>
            <p><strong>Email:</strong> <a href="mailto:support@tripeloo.com" className="text-[#E51A4B] hover:underline">support@tripeloo.com</a></p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Tripeloo ("we", "our", "us") operates as an online travel web app that lists resorts, activities, things to do, and tour packages. This Privacy Policy explains how we collect, use, store, and protect your personal information. By accessing Tripeloo, you agree to this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">a) Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Booking details</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">b) Usage Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>IP address</li>
                <li>Device details</li>
                <li>Pages visited</li>
                <li>Time spent on the platform</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">c) Additional Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Photos for reviews (optional)</li>
                <li>Travel preferences (optional)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Process booking enquiries</li>
                <li>Forward enquiry to travel providers</li>
                <li>Communicate booking updates</li>
                <li>Customer support</li>
                <li>Improve platform experience</li>
                <li>Prevent fraud</li>
                <li>Send confirmations or alerts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Sharing of Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We only share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Travel providers to confirm bookings</li>
                <li>Essential service tools such as SMS, email delivery, CRM systems</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                We do not share information with advertisers or unrelated third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Protection & Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement encryption, secure servers, restricted access controls, and internal safety checks. While we take precautions, no platform can guarantee 100% security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You may request:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>A copy of your data</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data</li>
                <li>Opt-out of promotional updates</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Contact: <a href="mailto:support@tripeloo.com" className="text-[#E51A4B] hover:underline">support@tripeloo.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies & Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to enhance performance, speed, and analytics. Cookies may be disabled in browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                Data is stored only for booking completion, dispute handling, and legal compliance. Afterward, data is deleted securely.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not knowingly collect data from children under 13. If collected unintentionally, it will be removed immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                Updates will be posted on the website. Continued use of Tripeloo indicates acceptance of updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Contact Information</h2>
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <p className="text-gray-700 font-semibold mb-2">Tripeloo Travel Management LLP</p>
                <p className="text-gray-700">South Beach, Calicut, Kerala</p>
                <p className="text-gray-700">
                  Phone: <a href="tel:90379179463" className="text-[#E51A4B] hover:underline">90379179463</a>
                </p>
                <p className="text-gray-700">
                  Email: <a href="mailto:support@tripeloo.com" className="text-[#E51A4B] hover:underline">support@tripeloo.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

