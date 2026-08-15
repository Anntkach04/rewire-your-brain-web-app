import { useEffect } from "react";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads Google Analytics 4 when VITE_GA_MEASUREMENT_ID is set at build time.
 * Create a GA4 property → copy Measurement ID (G-XXXXXXXX) →
 * Vercel → Settings → Environment Variables → Redeploy.
 */
export function GoogleAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID || MEASUREMENT_ID === "G-XXXXXXXX") return;
    if (document.getElementById("ga4-gtag")) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);

    const script = document.createElement("script");
    script.id = "ga4-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
