"use client";

import { useState } from "react";
import Image from "next/image";
import { PARKER_FLOOR_PLANS } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

type Category = "All" | "Studio" | "1 Bedroom" | "2 Bedroom" | "3 Bedroom";

const CATEGORIES: Category[] = ["All", "Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"];

export default function FloorPlans() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const sectionRef = useScrollReveal();

  const filtered =
    activeCategory === "All"
      ? PARKER_FLOOR_PLANS
      : PARKER_FLOOR_PLANS.filter((p) => p.category === activeCategory);

  return (
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
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Floor plan image */}
                <div
                  className="relative aspect-[3/4]"
                  style={{ background: "#f5f5f3" }}
                >
                  <Image
                    src={plan.image}
                    alt={`${plan.name} floor plan — ${plan.sqft} sq ft ${plan.category}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Card info */}
                <div className="px-5 py-4">
                  <h3
                    className="display mb-2"
                    style={{
                      fontSize: "1.35rem",
                      color: "var(--ink)",
                      lineHeight: 1.15,
                    }}
                  >
                    {plan.name}
                  </h3>

                  {/* Beds / baths / sqft row */}
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

                  {/* Price */}
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
                  >
                    {plan.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
