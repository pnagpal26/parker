"use client";

import Image from "next/image";
import { PARKER_IMAGES, PARKER_INFO } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

export default function About() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="overflow-hidden"
      style={{ background: "var(--cream)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-0 items-stretch">

          {/* Left: Text */}
          <div className="flex flex-col justify-center pr-0 lg:pr-16">
            {/* Section marker */}
            <div className="reveal mb-8 flex items-center gap-4">
              <span
                className="text-xs font-medium tracking-[0.3em] uppercase"
                style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
              >
                About
              </span>
              <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Headline */}
            <h2
              className="reveal display mb-8 delay-1"
              style={{
                fontSize: "clamp(2.8rem, 5.5vw, 4.2rem)",
                color: "var(--ink)",
                lineHeight: 1.05,
              }}
            >
              Reimagining What{" "}
              <em style={{ color: "var(--orange)", fontStyle: "italic" }}>Rental Living</em>{" "}
              Means
            </h2>

            {/* Body copy */}
            <div
              className="reveal delay-2 space-y-4 text-[15px] leading-relaxed"
              style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              <p>
                Nestled at one of Toronto&apos;s most coveted intersections, Parker
                stands as proof that renting can mean choosing — not settling. At 38 storeys,
                it commands the skyline while offering an intimate, community-focused experience within.
              </p>
              <p>
                Every suite features soaring 9&apos; ceilings and premium KitchenAid® appliances.
                Finishes that blur the line between ownership and renting, because you
                shouldn&apos;t have to compromise on quality for flexibility.
              </p>
            </div>

            {/* Pull quote */}
            <blockquote
              className="reveal delay-3 my-8 border-l-2 pl-5"
              style={{ borderColor: "var(--orange)" }}
            >
              <p
                className="display-italic"
                style={{ fontSize: "1.35rem", color: "var(--ink)", lineHeight: 1.4 }}
              >
                &ldquo;{PARKER_INFO.tagline}.&rdquo;
              </p>
            </blockquote>

            {/* Address */}
            <div className="reveal delay-4 flex items-center gap-4">
              <span
                style={{
                  display: "inline-block",
                  width: 28,
                  height: 1,
                  background: "var(--orange)",
                  flexShrink: 0,
                }}
              />
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}
              >
                {PARKER_INFO.address}
              </p>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative min-h-[320px] sm:min-h-[460px] lg:min-h-0 overflow-hidden">
            <div className="clip-reveal h-full w-full">
              <Image
                src={PARKER_IMAGES.exterior}
                alt="Parker tower exterior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle warm overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "rgba(14,14,12,0.08)" }}
              />
            </div>

            {/* Floating tag */}
            <div
              className="absolute bottom-6 left-6 z-10 px-4 py-2"
              style={{
                background: "rgba(250,249,247,0.95)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 500 }}
              >
                38 Storeys · Yonge + Eglinton
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
