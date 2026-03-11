"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PARKER_IMAGES, PARKER_INFO } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

export default function Amenities() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useScrollReveal();
  const images = PARKER_IMAGES.amenityCarousel;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length]);

  return (
    <section
      id="amenities"
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{ background: "var(--cream-mid)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">

        {/* Header */}
        <div className="reveal mb-14 sm:mb-18">
          <span
            className="mb-4 inline-flex items-center gap-4 text-xs font-medium tracking-[0.3em] uppercase"
            style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
          >
            <span style={{ width: 28, height: 1, background: "var(--orange)", display: "inline-block", flexShrink: 0 }} />
            Amenities
          </span>
          <h2
            className="display delay-1"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--ink)", lineHeight: 1.05 }}
          >
            Life Beyond the Suite
          </h2>
        </div>

        {/* Content grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">

          {/* Numbered amenity list */}
          <div className="order-2 lg:order-1">
            <div className="grid gap-0">
              {PARKER_INFO.amenities.map((amenity, i) => (
                <div
                  key={i}
                  className="reveal group flex items-center gap-5 py-4"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    transitionDelay: `${i * 0.05}s`,
                  }}
                >
                  <span
                    className="shrink-0 text-xs font-medium tabular-nums"
                    style={{ color: "var(--orange)", fontFamily: "var(--font-body)", minWidth: 28 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-sm font-medium transition-colors duration-200 group-hover:text-[color:var(--orange)]"
                    style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}
                  >
                    {amenity}
                  </span>
                  <svg
                    className="ml-auto h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    fill="none"
                    viewBox="0 0 16 16"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    style={{ color: "var(--orange)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Image carousel */}
          <div className="order-1 lg:order-2">
            <div className="reveal delay-2 relative aspect-[4/5] overflow-hidden">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="absolute inset-0 transition-opacity duration-1000"
                  style={{ opacity: i === current ? 1 : 0 }}
                >
                  <Image
                    src={src}
                    alt={`Parker amenity ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))}

              {/* Dots */}
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="transition-all duration-300"
                    style={{
                      height: 4,
                      width: i === current ? 24 : 4,
                      borderRadius: 2,
                      background: i === current ? "var(--orange)" : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>

              {/* Image counter */}
              <div
                className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5"
                style={{
                  background: "rgba(250,249,247,0.9)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
                >
                  {String(current + 1).padStart(2, "0")}
                </span>
                <span className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  / {String(images.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
