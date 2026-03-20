"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PARKER_IMAGES } from "@/lib/parker-data";

export default function Nav({ onOpenChat }: { onOpenChat: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(250,249,247,0.97)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo + presented by */}
          <div className="flex items-center gap-4">
            <div className="relative h-[42px] w-36">
              <Image
                src={PARKER_IMAGES.logo}
                alt="Parker"
                fill
                className="object-contain object-left"
                sizes="144px"
                style={{ filter: scrolled ? "none" : "invert(1)" }}
                priority
              />
            </div>
            <div
              className="flex flex-col justify-center"
              style={{ borderLeft: `1px solid ${scrolled ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.25)"}`, paddingLeft: "1rem" }}
            >
              <p
                className="text-xs tracking-[0.15em] uppercase leading-tight"
                style={{ color: scrolled ? "var(--ink-muted)" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "0.62rem" }}
              >
                Presented by
              </p>
              <p
                className="text-xs font-medium leading-tight"
                style={{ color: scrolled ? "var(--ink)" : "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontSize: "0.72rem" }}
              >
                Garima Nagpal
              </p>
            </div>
          </div>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {["Amenities", "Floor Plans", "Gallery"].map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase().replace(" ", ""))}
                className="text-xs font-medium tracking-widest uppercase transition-colors duration-200"
                style={{ color: scrolled ? "var(--ink-muted)" : "rgba(255,255,255,0.75)" }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={onOpenChat}
              className="px-5 py-2.5 text-xs font-medium tracking-widest uppercase transition-all duration-300"
              style={{
                border: `1px solid ${scrolled ? "var(--orange)" : "rgba(255,255,255,0.6)"}`,
                color: scrolled ? "var(--orange)" : "white",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--orange)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--orange)";
                (e.currentTarget as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.borderColor = scrolled ? "var(--orange)" : "rgba(255,255,255,0.6)";
                (e.currentTarget as HTMLButtonElement).style.color = scrolled ? "var(--orange)" : "white";
              }}
            >
              Book a Tour
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex flex-col gap-1.5 md:hidden p-1"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span
              className="block h-px w-6 transition-all duration-300"
              style={{
                background: scrolled ? "var(--ink)" : "white",
                transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
              }}
            />
            <span
              className="block h-px w-6 transition-all duration-300"
              style={{
                background: scrolled ? "var(--ink)" : "white",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-px w-6 transition-all duration-300"
              style={{
                background: scrolled ? "var(--ink)" : "white",
                transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-500"
        style={{
          background: "var(--cream)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
        }}
      >
        {["Amenities", "Floor Plans", "Gallery"].map((label) => (
          <button
            key={label}
            onClick={() => scrollTo(label.toLowerCase().replace(" ", ""))}
            className="display-italic text-5xl"
            style={{ color: "var(--ink)" }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => { setMenuOpen(false); onOpenChat(); }}
          className="mt-4 px-8 py-3 text-xs font-medium tracking-widest uppercase"
          style={{
            background: "var(--orange)",
            color: "white",
          }}
        >
          Book a Tour
        </button>
      </div>
    </>
  );
}
