"use client";

import { useEffect, useState } from "react";

interface ContactLinkProps {
  encoded: string; // base64-encoded raw value (phone digits or email address)
  type: "tel" | "email";
  prefix?: string; // e.g. "Direct: " — shown in plain text, safe
  className?: string;
  style?: React.CSSProperties;
}

// Decoded only client-side; server-rendered HTML contains no contact info.
export default function ContactLink({ encoded, type, prefix, className, style }: ContactLinkProps) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    try {
      setValue(atob(encoded));
    } catch {
      // invalid base64 — silently skip
    }
  }, [encoded]);

  if (!value) {
    return <span className={className} style={style}>{prefix ?? "—"}</span>;
  }

  const href =
    type === "tel"
      ? `tel:${value.replace(/\D/g, "")}`
      : `mailto:${value}`;

  const display =
    type === "tel"
      ? `${prefix ?? ""}${value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}`
      : value;

  return (
    <a href={href} className={className} style={style}>
      {display}
    </a>
  );
}
