import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { AnalyticsProvider } from "../../components/site/AnalyticsProvider";
import { isValidGtmContainerId } from "../../lib/analytics/events.ts";
import "./site.css";
import "./inventory.css";
import { SiteHeader } from "./siteHeader";
import { SiteFooter } from "../../components/site/SiteFooter";
import { FloatingWhatsApp } from "../../components/site/FloatingWhatsApp";
import { getIndexingPolicy, getSiteMetadataBase } from "../../lib/siteMetadata";

export function generateMetadata(): Metadata {
  return {
    metadataBase: getSiteMetadataBase(),
    title: { default: "HGR Equipment Resources", template: "%s | HGR" },
    robots: getIndexingPolicy(),
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  await connection();
  const localReview = process.env.HGR_LOCAL_UI_REVIEW === "true" && process.env.NODE_ENV !== "production";
  const analyticsEnabled = process.env.HGR_ANALYTICS_ENABLED === "true" && !localReview;
  const configuredContainerId = process.env.HGR_GTM_CONTAINER_ID;
  const containerId = analyticsEnabled && isValidGtmContainerId(configuredContainerId) ? configuredContainerId : undefined;
  return <html lang="en"><body><AnalyticsProvider enabled={analyticsEnabled} containerId={containerId} localReview={localReview}>
    {localReview && <div className="review-banner" role="status">LOCAL UI REVIEW · Fictional sample content · Enquiries are not sent</div>}
    <a className="skip-link" href="#main-content">Skip to content</a>
    <SiteHeader /><div className="site-main">{children}</div><SiteFooter /><FloatingWhatsApp />
  </AnalyticsProvider></body></html>;
}
