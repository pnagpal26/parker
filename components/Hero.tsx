"use client";

import Image from "next/image";
import { PARKER_IMAGES, PARKER_INFO } from "@/lib/parker-data";

const INCENTIVES = [
  { label: "1 month free rent", sub: "All suites, 12-month lease" },
  { label: "2 months free rent", sub: "All suites, 14-month lease" },
  { label: "Rogers Gigabit Internet", sub: "Complimentary, included" },
  { label: "50,000 Aeroplan® points", sub: "Earn while paying rent" },
  { label: "Enterprise Car Share", sub: "Located in the building" },
  { label: "20% off café drinks", sub: "Non-alcoholic, in-house café" },
];

export default function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100svh", minHeight: 620 }}>

      {/* ── MOBILE LAYOUT (hidden on lg+) ── */}

      {/* Top: image + PARKER text */}
      <div className="lg:hidden absolute top-0 left-0 right-0" style={{ height: "48%" }}>
        <Image
          src={PARKER_IMAGES.hero}
          alt="Parker at Yonge + Eglinton"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.75) 100%)" }}
        />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-5">
          <span
            className="inline-flex items-center gap-2 text-xs tracking-[0.28em] uppercase mb-2"
            style={{ color: "var(--orange)", fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            <span style={{ display: "inline-block", width: 18, height: 1, background: "var(--orange)" }} />
            {PARKER_INFO.neighbourhood} · Toronto
          </span>
          <h1
            className="display text-white mb-2"
            style={{ fontSize: "clamp(3.5rem, 18vw, 6rem)", lineHeight: 0.9 }}
          >
            PARKER
          </h1>
          <p
            className="text-sm text-white/65"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            {PARKER_INFO.tagline}
          </p>
        </div>
      </div>

      {/* Bottom: incentives panel */}
      <div
        className="lg:hidden absolute bottom-0 left-0 right-0 flex flex-col"
        style={{ height: "52%", background: "var(--dark)" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p
              className="text-xs font-medium tracking-[0.2em] uppercase mb-0.5"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              Current Incentives
            </p>
            <p
              className="display text-white"
              style={{ fontSize: "clamp(1.6rem, 7vw, 2.2rem)", lineHeight: 1 }}
            >
              Move In Today
            </p>
          </div>
          <button
            onClick={onOpenChat}
            className="shrink-0 px-4 py-2.5 text-xs font-medium tracking-widest uppercase text-white transition-all duration-200"
            style={{ background: "var(--orange)", fontFamily: "var(--font-body)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange)")}
          >
            Book Tour
          </button>
        </div>

        {/* Incentives list */}
        <ul className="flex-1 grid grid-cols-2 gap-px px-1 py-1" style={{ background: "rgba(255,255,255,0.04)" }}>
          {INCENTIVES.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 px-4 py-3"
              style={{ background: "var(--dark)" }}
            >
              <span
                className="mt-1.5 shrink-0 block h-1 w-3"
                style={{ background: "var(--orange)" }}
              />
              <div>
                <p
                  className="font-semibold leading-tight"
                  style={{ color: "white", fontFamily: "var(--font-body)", fontSize: "0.8rem" }}
                >
                  {item.label}
                </p>
                <p
                  className="mt-0.5 leading-tight"
                  style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "0.72rem" }}
                >
                  {item.sub}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA row */}
        <button
          onClick={onOpenChat}
          className="w-full py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white transition-all duration-200"
          style={{ background: "rgba(232,91,58,0.12)", color: "var(--orange)", fontFamily: "var(--font-body)", borderTop: "1px solid rgba(232,91,58,0.2)" }}
        >
          Chat with Emma to confirm availability →
        </button>
      </div>


      {/* ── DESKTOP LAYOUT (hidden below lg) ── */}

      {/* Full background image */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src={PARKER_IMAGES.hero}
          alt="Parker at Yonge + Eglinton"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.55) 75%, rgba(10,10,10,0.82) 100%)" }}
        />
      </div>

      {/* Left editorial accent */}
      <div className="absolute left-6 top-1/2 z-10 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
        <div style={{ width: 1, height: 64, background: "rgba(255,255,255,0.3)" }} />
        <p
          className="text-white/40 text-xs tracking-widest"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed", letterSpacing: "0.25em", fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          200 REDPATH AVE · TORONTO
        </p>
        <div style={{ width: 1, height: 64, background: "rgba(255,255,255,0.3)" }} />
      </div>

      {/* Desktop main content */}
      <div className="relative z-10 hidden lg:flex h-full flex-col justify-end px-16 pb-24">
        <div className="hero-text-animate mb-4 sm:mb-5" style={{ animationDelay: "0.1s" }}>
          <span
            className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--orange)", fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--orange)" }} />
            {PARKER_INFO.neighbourhood} · Toronto
          </span>
        </div>
        <h1
          className="hero-text-animate display mb-4 sm:mb-6 text-white"
          style={{ fontSize: "clamp(4.5rem, 14vw, 11rem)", animationDelay: "0.25s", lineHeight: 0.9 }}
        >
          PARKER
        </h1>
        <p
          className="hero-text-animate mb-8 sm:mb-10 max-w-sm text-base sm:text-lg text-white/75"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300, letterSpacing: "0.01em", animationDelay: "0.4s" }}
        >
          {PARKER_INFO.tagline}
        </p>
        <div className="hero-text-animate flex items-center gap-6" style={{ animationDelay: "0.55s" }}>
          <button
            onClick={onOpenChat}
            className="group flex items-center gap-3 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300"
            style={{ background: "var(--orange)", padding: "14px 28px" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange)")}
          >
            Book a Private Tour
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop right-side incentives panel */}
      <div
        className="absolute right-0 top-0 h-full z-10 hidden lg:flex flex-col justify-center px-10 xl:px-14"
        style={{ width: "min(420px, 36vw)" }}
      >
        <div
          className="relative p-8 xl:p-10"
          style={{
            background: "rgba(10,10,10,0.52)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="display text-white mb-1" style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", lineHeight: 1 }}>Move In</p>
          <p className="display mb-8" style={{ fontSize: "clamp(2rem, 3vw, 2.8rem)", lineHeight: 1, color: "var(--orange)" }}>Today</p>

          <ul className="space-y-4">
            {INCENTIVES.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 shrink-0 block h-1 w-4" style={{ background: "var(--orange)" }} />
                <div>
                  <p className="font-semibold leading-tight" style={{ color: "white", fontFamily: "var(--font-body)", fontSize: "clamp(0.85rem, 1.1vw, 1rem)" }}>
                    {item.label}
                  </p>
                  <p className="mt-0.5" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)", fontWeight: 300, fontSize: "0.8rem" }}>
                    {item.sub}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={onOpenChat}
              className="w-full text-xs font-medium tracking-[0.2em] uppercase text-left transition-opacity duration-200 hover:opacity-70"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              Chat with Emma to book your tour →
            </button>
          </div>
        </div>
      </div>

      {/* Desktop scroll indicator */}
      <div
        className="hero-text-animate absolute bottom-6 right-6 z-10 hidden lg:flex flex-col items-center gap-2"
        style={{ animationDelay: "1s" }}
      >
        <span className="text-white/40 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}>Scroll</span>
        <svg className="text-white/30" width="14" height="24" viewBox="0 0 14 24" fill="none" style={{ animation: "scrollPulse 2.2s ease-in-out infinite" }}>
          <rect x="1" y="1" width="12" height="22" rx="6" stroke="currentColor" strokeWidth="1.2" />
          <rect x="6" y="5" width="2" height="5" rx="1" fill="currentColor" />
        </svg>
      </div>

    </section>
  );
}
