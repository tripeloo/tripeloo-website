import Script from "next/script";

export default function DestinationOverviewThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center px-4">
      {/* Meta Pixel base code for thank you page */}
      <Script id="meta-pixel-destination-overview-thank-you" strategy="afterInteractive">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1356009086544954');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            '<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1356009086544954&ev=PageView&noscript=1" />',
        }}
      />

      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Thank you!
        </h1>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          We&apos;ve received your trip overview enquiry. Our team will get back to you shortly with ideas and customised options.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#E51A4B] text-white font-semibold text-sm shadow-md hover:bg-[#c91742] transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

