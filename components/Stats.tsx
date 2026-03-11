"use client";

import { useScrollReveal, useCountUp } from "@/lib/hooks";
import { PARKER_INFO } from "@/lib/parker-data";

function StatItem({ stat, index }: { stat: typeof PARKER_INFO.stats[0]; index: number }) {
  const numericValue = parseInt(stat.value.replace(/,/g, ""), 10);
  const isNumeric = !isNaN(numericValue);
  const countRef = useCountUp(isNumeric ? numericValue : 0, 1600);

  return (
    <div
      className="reveal flex flex-col items-center justify-center px-6 py-10 sm:py-14 text-center"
      style={{
        transitionDelay: `${index * 0.12}s`,
        borderRight: index < 3 ? "1px solid var(--border)" : "none",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Label */}
      <span
        className="mb-3 block text-xs font-medium tracking-[0.22em] uppercase"
        style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}
      >
        {stat.label}
      </span>

      {/* Number */}
      <div
        className="display mb-2"
        style={{
          fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
          color: "var(--ink)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {isNumeric ? (
          <span ref={countRef}>0</span>
        ) : (
          <span>{stat.value}</span>
        )}
      </div>

      {/* Sub-label */}
      <span
        className="text-xs leading-relaxed"
        style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        {stat.subtext}
      </span>

      {/* Orange underline accent */}
      <span
        className="mt-4 block"
        style={{ width: 24, height: 1.5, background: "var(--orange)" }}
      />
    </div>
  );
}

export default function Stats() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: "var(--warm-white)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4">
        {PARKER_INFO.stats.map((stat, i) => (
          <StatItem key={i} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}
