import { useEffect } from "react";
import { ADSENSE_CLIENT } from "../ads.config.js";

export function AdSenseBoot() {
  useEffect(() => {
    if (!ADSENSE_CLIENT) return;
    if (document.querySelector("script[data-adviser-ads]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.dataset.adviserAds = "1";
    document.head.appendChild(script);
  }, []);
  return null;
}

export default function AdSlot({ slot = "", format = "auto", className = "" }) {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* AdSense may throw if the slot renders twice in Strict Mode */
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) {
    return (
      <aside className={`ad-slot ad-placeholder ${className}`} aria-label="Advertisement">
        <span>Ad space</span>
        <em>Drop in your AdSense IDs to go live</em>
      </aside>
    );
  }

  return (
    <aside className={`ad-slot ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
