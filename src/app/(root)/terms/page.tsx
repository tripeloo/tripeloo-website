import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Tripeloo',
  description: 'Tripeloo Terms & Conditions - Understand the terms and conditions for using our platform and services.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#E51A4B] mb-4">
            TRIPELOO – TERMS & CONDITIONS
          </h1>

          <div className="prose prose-gray max-w-none space-y-8 mt-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Tripeloo is an online travel platform operated by Tripeloo Travel Management LLP, listing resorts, activities, and tour packages.</li>
                <li>Tripeloo acts only as an intermediary connecting customers with travel providers.</li>
                <li>These Terms apply to all users who browse or book through Tripeloo.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Customer Rights</h2>
              <p className="text-gray-700 mb-3">
                Tripeloo ensures a customer-first approach. As a user, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Clear and transparent information before booking.</li>
                <li>Direct access to provider details, policies, and contact information.</li>
                <li>Support from Tripeloo if a provider delays, denies, or fails to respond.</li>
                <li>Escalate issues to Tripeloo for coordination with providers.</li>
                <li>Fair handling of complaints related to misinformation or miscommunication.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Services Provided by Tripeloo</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-3">
                <li>Tripeloo lists properties, activities, and packages provided by independent third-party providers.</li>
              </ul>
              <p className="text-gray-700 mb-2 font-medium">Tripeloo assists customers by:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Sharing property details</li>
                <li>Communicating with providers</li>
                <li>Helping manually close deals</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Tripeloo does not control service quality, property conditions, or provider behaviour.
              </p>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Responsibilities of Travel Providers</h2>
              <p className="text-gray-700 mb-3">
                All providers listed on Tripeloo must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate property details, photos, and pricing.</li>
                <li>Maintain updated availability and policies.</li>
                <li>Ensure safe, clean, and quality service for customers.</li>
                <li>Handle customer queries, refunds, cancellations, and complaints promptly.</li>
                <li>Honour all confirmed bookings without last-minute changes (unless unavoidable).</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Tripeloo supports the customer if the provider violates these responsibilities.
              </p>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Customer Responsibilities</h2>
              <p className="text-gray-700 mb-3">
                Customers must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide correct personal and booking details.</li>
                <li>Review resort/activities policies before confirming.</li>
                <li>Follow provider rules during the stay or activity.</li>
                <li>Make payments only through the approved communication provided.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Booking Process</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Bookings are confirmed only after the provider accepts the enquiry.</li>
                <li>Tripeloo will inform customers of any change in price, availability, or policy.</li>
                <li>Customers will receive final confirmation through WhatsApp/SMS/Call/Email.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Transparent Pricing</h2>
              <p className="text-gray-700 mb-3">
                To protect customers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>All prices shown on Tripeloo are based on provider-submitted data.</li>
                <li>Tripeloo ensures no hidden charges.</li>
                <li>Any additional charge must be disclosed before booking confirmation.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cancellation & Refund Policy (Customer Favorable Clause)</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-3">
                <li>Cancellations and refunds follow the provider's official cancellation policy.</li>
              </ul>
              <p className="text-gray-700 mb-2 font-medium">Tripeloo will:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Help customers submit cancellation requests</li>
                <li>Follow up with providers on refund status</li>
                <li>Ensure transparency throughout the process</li>
              </ul>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>Customers will receive written confirmation of refund eligibility.</li>
                <li>If a provider delays refunds, Tripeloo will intervene on the customer's behalf.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Customer Protection From Misinformation</h2>
              <p className="text-gray-700 mb-3">
                If a customer suffers due to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-3">
                <li>Incorrect listing details</li>
                <li>Misleading photos</li>
                <li>Wrong inclusions</li>
                <li>Hidden charges by providers</li>
              </ul>
              <p className="text-gray-700 mb-2 font-medium">Tripeloo will:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Escalate the issue directly with the provider</li>
                <li>Push for compensation/refund where applicable</li>
                <li>Remove or suspend providers repeatedly violating rules</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of liability</h2>
              <p className="text-gray-700 mb-3">
                Tripeloo strives to protect customers, however:
              </p>
              <p className="text-gray-700 mb-2 font-medium">Tripeloo is not responsible for:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Service quality issues caused by providers</li>
                <li>Injuries, loss, damage, or accidents at provider properties/activities</li>
                <li>Provider cancellations, delays, or behaviour</li>
                <li>Pricing or availability errors submitted by providers</li>
              </ul>
              <p className="text-gray-700 mt-3 font-medium">
                BUT Tripeloo will always assist the customer in coordinating with the provider to resolve any issue, including refund/escalation support.
              </p>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Platform Usage Rules</h2>
              <p className="text-gray-700 mb-3">
                Customers agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Submit false or misleading booking information</li>
                <li>Misuse or attempt to hack the platform</li>
                <li>Violate provider property rules during their stay</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Intellectual Property</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>All content, brand names, and logos belong to Tripeloo.</li>
                <li>Users may not copy or misuse Tripeloo content without permission.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Policy Updates</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Tripeloo may update Terms anytime.</li>
                <li>Customers will be informed through website updates.</li>
                <li>Continued use means acceptance of updated Terms.</li>
              </ul>
            </section>

            <div className="border-t border-gray-200 my-8"></div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
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

