"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { PARKER_IMAGES } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

const LABELS = [
  "Model Suite — Kitchen", "Model Suite — Living", "Model Suite — Bedroom",
  "LIDO Pool Deck", "Lobby", "Bowling Lounge", "Fitness Centre",
  "Co-Working", "Spa", "Dining Room", "Entertainment",
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const ref = useScrollReveal();
  const images = [
    ...PARKER_IMAGES.modelSuites,
    PARKER_IMAGES.pool,
    ...PARKER_IMAGES.amenityDetail,
  ];

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  return (
    <section
      id="gallery"
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: "var(--dark)" }}
    >
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:px-8">
        <div className="reveal flex items-end justify-between gap-6">
          <div>
            <span
              className="mb-3 inline-flex items-center gap-4 text-xs font-medium tracking-[0.3em] uppercase"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              <span style={{ width: 28, height: 1, background: "var(--orange)", display: "inline-block" }} />
              Gallery
            </span>
            <h2
              className="display"
              style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "white", lineHeight: 1.05 }}
            >
              See Parker
            </h2>
          </div>

          {/* Nav arrows — desktop */}
          <div className="reveal delay-1 hidden sm:flex items-center gap-3">
            <button
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--orange)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--orange)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="flex h-11 w-11 items-center justify-center transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--orange)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--orange)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span
              className="ml-2 text-sm tabular-nums"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}
            >
              {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Main image */}
      <div className="reveal relative w-full overflow-hidden" style={{ aspectRatio: "16/9", maxHeight: "72vh" }}>
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={LABELS[i] || `Parker ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        {/* Mobile nav arrows */}
        <button
          onClick={prev}
          className="sm:hidden absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center"
          style={{ background: "rgba(14,14,12,0.55)", color: "white" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center"
          style={{ background: "rgba(14,14,12,0.55)", color: "white" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Label */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-5 pt-20 sm:px-8"
          style={{ background: "linear-gradient(to top, rgba(14,14,12,0.7) 0%, transparent 100%)" }}
        >
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}
          >
            {LABELS[current] || "Parker"}
          </p>
          <p
            className="sm:hidden text-xs tabular-nums"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)" }}
          >
            {current + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="thumb-strip flex gap-2 overflow-x-auto px-6 py-4 lg:px-8">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative shrink-0 overflow-hidden transition-all duration-300"
            style={{
              height: 52,
              width: 76,
              opacity: i === current ? 1 : 0.38,
              outline: i === current ? "2px solid var(--orange)" : "none",
              outlineOffset: 1,
            }}
          >
            <Image
              src={src}
              alt={`Parker — ${LABELS[i] || `Photo ${i + 1}`} thumbnail`}
              fill
              className="object-cover"
              sizes="76px"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
