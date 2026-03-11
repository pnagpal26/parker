import Image from "next/image";
import { PARKER_IMAGES, PARKER_INFO } from "@/lib/parker-data";
import ContactLink from "@/components/ContactLink";

// base64-encoded — keeps contact info out of server-rendered HTML, away from scrapers
const DIRECT = "NDE2MzEyNTI4Mg==";  // 4163125282
const OFFICE = "NDE2NDk0NzY1Mw==";  // 4164947653
const EMAIL  = "R2FyaW1hQFRlYW1OYWdwYWwuY2E="; // Garima@TeamNagpal.ca

const linkStyle = { color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" };

export default function Footer() {
  return (
    <footer style={{ background: "var(--dark)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 pb-12"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <div className="relative mb-5 h-[42px] w-36">
              <Image
                src={PARKER_IMAGES.logo}
                alt="Parker at Yonge + Eglinton — Luxury Rentals Toronto"
                fill
                sizes="144px"
                className="object-contain object-left"
                style={{ filter: "invert(1)" }}
              />
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {PARKER_INFO.tagline}.
            </p>
          </div>

          {/* Address only */}
          <div>
            <h3
              className="mb-4 text-xs font-medium tracking-[0.22em] uppercase"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              Location
            </h3>
            <address className="not-italic">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                {PARKER_INFO.address}
              </p>
            </address>
          </div>

          {/* Garima's contact */}
          <div>
            <h3
              className="mb-4 text-xs font-medium tracking-[0.22em] uppercase"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              Presented By
            </h3>
            <p
              className="text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-body)" }}
            >
              Garima Nagpal
            </p>
            <p
              className="mt-0.5 text-sm"
              style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              RE/MAX Hallmark Realty
            </p>
            <address className="not-italic mt-4 space-y-2">
              <p>
                <ContactLink
                  encoded={DIRECT}
                  type="tel"
                  prefix="Direct: "
                  className="text-sm transition-colors duration-200 hover:text-white"
                  style={linkStyle}
                />
              </p>
              <p>
                <ContactLink
                  encoded={OFFICE}
                  type="tel"
                  prefix="Office: "
                  className="text-sm transition-colors duration-200 hover:text-white"
                  style={linkStyle}
                />
              </p>
              <p>
                <ContactLink
                  encoded={EMAIL}
                  type="email"
                  className="text-sm transition-colors duration-200 hover:text-white"
                  style={linkStyle}
                />
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <p
            className="text-xs text-center sm:text-left"
            style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-body)" }}
          >
            © {new Date().getFullYear()} Parker at Yonge + Eglinton. All rights reserved.
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-body)" }}
          >
            Presented by Garima Nagpal · RE/MAX Hallmark Realty
          </p>
        </div>

      </div>
    </footer>
  );
}
