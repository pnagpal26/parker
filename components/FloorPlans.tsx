"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { PARKER_FLOOR_PLANS } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

type Category = "All" | "Studio" | "1 Bedroom" | "2 Bedroom" | "3 Bedroom";
type FloorPlan = typeof PARKER_FLOOR_PLANS[number];

const CATEGORIES: Category[] = ["All", "Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"];

export default function FloorPlans() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<{ plan: FloorPlan; index: number } | null>(null);
  const sectionRef = useScrollReveal();

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((l) => l && l.index < l.plan.images.length - 1 ? { ...l, index: l.index + 1 } : l);
      if (e.key === "ArrowLeft") setLightbox((l) => l && l.index > 0 ? { ...l, index: l.index - 1 } : l);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const filtered =
    activeCategory === "All"
      ? PARKER_FLOOR_PLANS
      : PARKER_FLOOR_PLANS.filter((p) => p.category === activeCategory);

  return (
    <>
    <section
      id="floorplans"
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{ background: "var(--cream)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">

        {/* Header */}
        <div className="reveal mb-10 sm:mb-14">
          <span
            className="mb-4 inline-flex items-center gap-4 text-xs font-medium tracking-[0.3em] uppercase"
            style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
          >
            <span style={{ width: 28, height: 1, background: "var(--orange)", display: "inline-block", flexShrink: 0 }} />
            Floor Plans
          </span>
          <h2
            className="display delay-1"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--ink)", lineHeight: 1.05 }}
          >
            Find Your Layout
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="reveal delay-2 mb-10 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-5 py-2 text-sm font-medium transition-all duration-200"
              style={{
                fontFamily: "var(--font-body)",
                borderRadius: 100,
                background: activeCategory === cat ? "var(--orange)" : "var(--border)",
                color: activeCategory === cat ? "#fff" : "var(--ink)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Floor plan cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan, i) => (
            <div
              key={plan.name}
              className="reveal group"
              style={{ transitionDelay: `${(i % 6) * 0.07}s` }}
            >
              <div
                className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
                style={{ background: "#fff", border: "1px solid var(--border)" }}
              >
                {/* Floor plan image — clickable */}
                <button
                  className="relative block w-full aspect-[3/4] cursor-zoom-in"
                  style={{ background: "#f5f5f3" }}
                  onClick={() => setLightbox({ plan, index: 0 })}
                  aria-label={`View ${plan.name} floor plan enlarged`}
                >
                  <Image
                    src={plan.images[0]}
                    alt={`${plan.name} floor plan — ${plan.sqft} sq ft ${plan.category}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* image count badge */}
                  {plan.images.length > 1 && (
                    <span
                      className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 text-xs text-white"
                      style={{ background: "rgba(0,0,0,0.55)", fontFamily: "var(--font-body)", borderRadius: 4 }}
                    >
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
                      </svg>
                      {plan.images.length}
                    </span>
                  )}
                  <span
                    className="absolute bottom-3 right-3 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ width: 32, height: 32, background: "rgba(0,0,0,0.5)" }}
                    aria-hidden
                  >
                    <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </span>
                </button>

                {/* Card info */}
                <div className="px-5 py-4">
                  <h3
                    className="display mb-2"
                    style={{ fontSize: "1.35rem", color: "var(--ink)", lineHeight: 1.15 }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="mb-3 text-xs"
                    style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}
                  >
                    {plan.beds === 0 ? "Studio" : `${plan.beds} Bed`}
                    {" · "}
                    {plan.baths} Bath
                    {" · "}
                    {plan.sqft.toLocaleString()} sq ft
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
                  >
                    From {plan.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Lightbox */}
    {lightbox && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
        onClick={() => setLightbox(null)}
      >
        <div
          className="relative flex flex-col"
          style={{ maxWidth: "min(90vw, 620px)", width: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            className="absolute -top-10 right-0 flex items-center gap-1.5 text-xs tracking-widest uppercase transition-colors"
            onClick={() => setLightbox(null)}
            style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
          >
            Close ✕
          </button>

          {/* Main image */}
          <div className="relative w-full" style={{ aspectRatio: "3/4", background: "#f5f5f3" }}>
            <Image
              src={lightbox.plan.images[lightbox.index]}
              alt={`${lightbox.plan.name} — image ${lightbox.index + 1}`}
              fill
              className="object-contain"
              sizes="620px"
              priority
            />

            {/* Prev / Next arrows */}
            {lightbox.plan.images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-200"
                  style={{
                    width: 40, height: 40,
                    background: "rgba(0,0,0,0.45)",
                    borderRadius: "50%",
                    opacity: lightbox.index === 0 ? 0.3 : 1,
                    cursor: lightbox.index === 0 ? "default" : "pointer",
                  }}
                  onClick={() => lightbox.index > 0 && setLightbox({ ...lightbox, index: lightbox.index - 1 })}
                  aria-label="Previous image"
                >
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-200"
                  style={{
                    width: 40, height: 40,
                    background: "rgba(0,0,0,0.45)",
                    borderRadius: "50%",
                    opacity: lightbox.index === lightbox.plan.images.length - 1 ? 0.3 : 1,
                    cursor: lightbox.index === lightbox.plan.images.length - 1 ? "default" : "pointer",
                  }}
                  onClick={() => lightbox.index < lightbox.plan.images.length - 1 && setLightbox({ ...lightbox, index: lightbox.index + 1 })}
                  aria-label="Next image"
                >
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {lightbox.plan.images.length > 1 && (
            <div className="flex justify-center gap-2 py-3" style={{ background: "rgba(0,0,0,0.4)" }}>
              {lightbox.plan.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightbox({ ...lightbox, index: idx })}
                  style={{
                    width: lightbox.index === idx ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: lightbox.index === idx ? "var(--orange)" : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Info bar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "#fff" }}
          >
            <div>
              <p className="display" style={{ fontSize: "1.2rem", color: "var(--ink)" }}>{lightbox.plan.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}>
                {lightbox.plan.beds === 0 ? "Studio" : `${lightbox.plan.beds} Bed`} · {lightbox.plan.baths} Bath · {lightbox.plan.sqft.toLocaleString()} sq ft
                {lightbox.plan.images.length > 1 && (
                  <span style={{ marginLeft: 8 }}>{lightbox.index + 1} / {lightbox.plan.images.length}</span>
                )}
              </p>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}>
              From {lightbox.plan.price}
            </p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
