"use client";

import { useState } from "react";
import { PARKER_INFO } from "@/lib/parker-data";
import { useScrollReveal } from "@/lib/hooks";

export default function LeadForm() {
  const ref = useScrollReveal();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    moveIn: "",
    suiteType: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "Parker Contact Form" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", moveIn: "", suiteType: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      style={{ background: "var(--warm-white)", borderTop: "1px solid var(--border)" }}
    >
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28 lg:px-8">

        {/* Header */}
        <div className="reveal mb-14 sm:mb-18 grid lg:grid-cols-2 lg:gap-16 items-end">
          <div>
            <span
              className="mb-4 inline-flex items-center gap-4 text-xs font-medium tracking-[0.3em] uppercase"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              <span style={{ width: 28, height: 1, background: "var(--orange)", display: "inline-block", flexShrink: 0 }} />
              Get in Touch
            </span>
            <h2
              className="display delay-1"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", color: "var(--ink)", lineHeight: 1.05 }}
            >
              Book a Private Tour
            </h2>
          </div>
          <p
            className="reveal delay-2 text-[15px] leading-relaxed lg:mb-1"
            style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Ready to experience Parker in person? Our team will arrange a private showing
            tailored to your schedule.
          </p>
        </div>

        {status === "success" ? (
          <div
            className="reveal border-l-4 py-12 px-10 text-center"
            style={{ borderColor: "var(--orange)", background: "var(--orange-light)" }}
          >
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "var(--orange)" }}
            >
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3
              className="display mb-3"
              style={{ fontSize: "1.8rem", color: "var(--ink)" }}
            >
              We&apos;ll be in touch
            </h3>
            <p className="text-sm" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-body)" }}>
              Thank you for your interest in Parker. Our leasing team will reach out shortly.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 text-xs tracking-widest uppercase underline underline-offset-4"
              style={{ color: "var(--orange)", fontFamily: "var(--font-body)" }}
            >
              Submit another inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reveal delay-2">
            {/* Row 1: Name + Email */}
            <div className="grid gap-8 sm:grid-cols-2 mb-8">
              <div className="float-group">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  autoComplete="name"
                />
                <label htmlFor="name">Full Name *</label>
              </div>
              <div className="float-group">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  autoComplete="email"
                />
                <label htmlFor="email">Email Address *</label>
              </div>
            </div>

            {/* Row 2: Phone + Suite type */}
            <div className="grid gap-8 sm:grid-cols-2 mb-8">
              <div className="float-group">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  autoComplete="tel"
                />
                <label htmlFor="phone">Phone Number</label>
              </div>
              <div className="float-group">
                <select
                  name="suiteType"
                  id="suiteType"
                  value={form.suiteType}
                  onChange={handleChange}
                  style={{ appearance: "none", WebkitAppearance: "none" }}
                >
                  <option value="">Select</option>
                  {PARKER_INFO.suiteTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <label
                  htmlFor="suiteType"
                  style={form.suiteType ? { top: 2, fontSize: 10, color: "var(--orange)", letterSpacing: "0.12em" } : {}}
                >
                  Suite Type
                </label>
              </div>
            </div>

            {/* Row 3: Move-in */}
            <div className="mb-8">
              <div className="float-group" style={{ maxWidth: 340 }}>
                <input
                  type="month"
                  name="moveIn"
                  id="moveIn"
                  value={form.moveIn}
                  onChange={handleChange}
                  placeholder="Move-in"
                  style={{ colorScheme: "light" } as React.CSSProperties}
                />
                <label
                  htmlFor="moveIn"
                  style={form.moveIn ? { top: 2, fontSize: 10, color: "var(--orange)", letterSpacing: "0.12em" } : {}}
                >
                  Desired Move-In Date
                </label>
              </div>
            </div>

            {/* Row 4: Message */}
            <div className="float-group mb-10">
              <textarea
                name="message"
                id="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Message"
                style={{ resize: "none" }}
              />
              <label htmlFor="message">Questions or comments</label>
            </div>

            {status === "error" && (
              <p
                className="mb-5 text-sm"
                style={{ color: "#c0392b", fontFamily: "var(--font-body)" }}
              >
                Something went wrong — please try again or email{" "}
                <a href={`mailto:${PARKER_INFO.email}`} className="underline">{PARKER_INFO.email}</a>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative overflow-hidden w-full sm:w-auto flex items-center justify-center gap-3 text-sm font-medium tracking-widest uppercase text-white transition-all duration-300 disabled:opacity-50"
              style={{
                background: "var(--orange)",
                padding: "16px 48px",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#c94d2f")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--orange)")}
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <>
                  Request a Tour
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
