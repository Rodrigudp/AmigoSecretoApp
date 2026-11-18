"use client";

import { useEffect, useRef, useState } from "react";
import { useAdConsent } from "@/app/_lib/consent";

type AdSlotProps = { enabled: boolean; adsAllowed: boolean; client: string; slot: string };

/** No Google element exists until all gates pass and the slot enters the viewport. */
export function AdSlot({ enabled, adsAllowed, client, slot }: AdSlotProps) {
  const consent = useAdConsent();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const allowed =
    enabled &&
    adsAllowed &&
    consent === "granted" &&
    /^pub-\d{16}$/.test(client) &&
    /^\d+$/.test(slot);
  useEffect(() => {
    if (!allowed || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [allowed]);
  useEffect(() => {
    if (!allowed || !visible) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${client}`;
    document.head.appendChild(script);
    script.onload = () => {
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle?.push({});
    };
    return () => {
      script.remove();
    };
  }, [allowed, visible, client]);
  if (!allowed) return null;
  return (
    <div ref={ref} aria-label="Publicidade">
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={`ca-${client}`}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
