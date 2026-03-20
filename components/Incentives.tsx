"use client";

import { PARKER_PRICING, PARKER_INCENTIVES } from "@/lib/parker-data";

const ICONS: Record<string, React.ReactNode> = {
  gift: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13a4 4 0 01-4-4 2 2 0 014 0 2 2 0 014 0 4 4 0 01-4 4zM3 8h18v3H3z" />
    </svg>
  ),
  wifi: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  plane: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  car: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16H7v-3l2-6h6l2 6v3h-1m1 0H6" />
    </svg>
  ),
  coffee: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
    </svg>
  ),
  key: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
};

export default function Incentives({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section
      id="incentives"
      style={{ background: "var(--dark)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      className="py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14">
          <p
            className="mb-3 text-xs font-medium tracking-[0.25em] uppercase"
            style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
          >
            Current Offers
          </p>
          <h2
            className="display text-white"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)" }}
          >
            Move In Today
          </h2>
          <p
            className="mt-4 max-w-xl text-base"
            style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Suites are available now. Ask about our limited-time incentives — including up to 2 months free rent.
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {PARKER_PRICING.map((suite, i) => (
            <div
              key={i}
              className="relative flex flex-col p-6"
              style={{
                background: i === 3 ? "var(--orange)" : "rgba(255,255,255,0.04)",
                border: i === 3 ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {i === 3 && (
                <span
                  className="absolute top-4 right-4 text-xs font-medium tracking-widest uppercase px-2 py-0.5"
                  style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.9)", fontFamily: "var(--font-body)" }}
                >
                  Signature
                </span>
              )}

              {/* Suite type */}
              <p
                className="text-xs font-medium tracking-[0.18em] uppercase mb-1"
                style={{
                  color: i === 3 ? "rgba(255,255,255,0.75)" : "var(--orange)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {suite.beds} · {suite.baths}
              </p>
              <p
                className="display mb-5"
                style={{
                  color: "white",
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  lineHeight: 1.1,
                }}
              >
                {suite.type}
              </p>

              {/* Pricing */}
              <div className="mt-auto">
                {/* Free months badge */}
                <span
                  className="inline-block px-2 py-0.5 text-xs font-medium mb-3"
                  style={{
                    background: i === 3 ? "rgba(0,0,0,0.2)" : "rgba(232,91,58,0.15)",
                    color: i === 3 ? "rgba(255,255,255,0.95)" : "var(--orange)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {suite.freeMonths}
                </span>

                {/* Net effective — hero number */}
                <p
                  className="font-semibold leading-none"
                  style={{ color: "white", fontFamily: "var(--font-body)", fontSize: "clamp(2rem, 4vw, 2.6rem)" }}
                >
                  {suite.netEffective}
                  <span
                    className="text-sm font-normal ml-1"
                    style={{ color: i === 3 ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.5)" }}
                  >
                    /mo
                  </span>
                </p>
                <p
                  className="mt-1 text-xs font-medium tracking-wide uppercase"
                  style={{
                    color: i === 3 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Net Effective
                </p>

                {/* List price — secondary */}
                <p
                  className="mt-3 text-xs"
                  style={{
                    color: i === 3 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.28)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  List {suite.price}/mo
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Incentives list + CTA */}
        <div className="grid gap-12 lg:grid-cols-2 items-start">

          {/* Incentives */}
          <div>
            <p
              className="mb-6 text-xs font-medium tracking-[0.22em] uppercase"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              What's Included
            </p>
            <ul className="space-y-4">
              {PARKER_INCENTIVES.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 shrink-0 flex items-center justify-center h-8 w-8"
                    style={{ background: "rgba(232,91,58,0.12)", color: "var(--orange)" }}
                  >
                    {ICONS[item.icon]}
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA panel */}
          <div
            className="p-8"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p
              className="display text-white mb-3"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}
            >
              Book a Private Tour
            </p>
            <p
              className="text-sm mb-8 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Garima and the Team Nagpal crew know this building inside and out. Let us walk you through the suites, amenities, and current availability — personally.
            </p>
            <button
              onClick={onOpenChat}
              className="w-full py-4 text-xs font-medium tracking-widest uppercase transition-all duration-300"
              style={{ background: "var(--orange)", color: "white" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange)")}
            >
              Chat with Emma
            </button>
            <p
              className="mt-4 text-center text-xs"
              style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}
            >
              Typically replies in under a minute
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
