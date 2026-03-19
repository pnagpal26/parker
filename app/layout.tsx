import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { PARKER_IMAGES, PARKER_INFO, PARKER_PRICING } from "@/lib/parker-data";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://parker.affordablecondos.ca";
const OG_IMAGE = PARKER_IMAGES.hero;

export const metadata: Metadata = {
  title: "Parker — Luxury Rentals at Yonge + Eglinton, Toronto",
  description:
    "Parker is a 38-storey luxury rental tower at Yonge + Eglinton in Toronto. 349 suites, LIDO infinity pool, Nordic spa, 9' ceilings, KitchenAid® appliances. Represented by Team Nagpal.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Parker — Luxury Rentals at Yonge + Eglinton",
    description: "Forget what you know about rental living.",
    siteName: "Parker",
    type: "website",
    url: SITE_URL,
    locale: "en_CA",
    images: [
      {
        url: OG_IMAGE,
        width: 1920,
        height: 1080,
        alt: "Parker — Luxury Rentals at Yonge + Eglinton, Toronto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parker — Luxury Rentals at Yonge + Eglinton",
    description: "Forget what you know about rental living.",
    images: [OG_IMAGE],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "ApartmentComplex"],
      name: PARKER_INFO.name,
      description: `Parker reimagines rental living at one of Toronto's most sought-after intersections. 38 storeys, 349 suites, LIDO infinity pool, Nordic spa, and 9' ceilings throughout.`,
      url: SITE_URL,
      telephone: PARKER_INFO.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "200 Redpath Avenue",
        addressLocality: "Toronto",
        addressRegion: "ON",
        postalCode: "M4P 0E6",
        addressCountry: "CA",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 43.7068,
        longitude: -79.3965,
      },
      numberOfRooms: 349,
      amenityFeature: PARKER_INFO.amenities.map((name) => ({
        "@type": "LocationFeatureSpecification",
        name,
        value: true,
      })),
      broker: {
        "@type": "RealEstateAgent",
        name: "Garima Nagpal",
        worksFor: {
          "@type": "Organization",
          name: "RE/MAX Hallmark Realty",
        },
        telephone: "416-312-5282",
        email: "Garima@TeamNagpal.ca",
      },
      makesOffer: {
        "@type": "AggregateOffer",
        priceCurrency: "CAD",
        lowPrice: PARKER_PRICING[0].price.replace(/[^0-9]/g, ""),
        highPrice: PARKER_PRICING[PARKER_PRICING.length - 1].price.replace(/[^0-9]/g, ""),
        offerCount: 349,
      },
    },
  ],
};

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${cormorant.variable} ${jakarta.variable} antialiased`}>
        {children}

        {/* Meta Pixel */}
        {PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}

        {/* Google Analytics 4 + Google Ads */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
                ${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
