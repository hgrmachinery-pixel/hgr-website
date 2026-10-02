import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./site.css";
import { SiteHeader } from "./siteHeader";
import { getIndexingPolicy, getSiteMetadataBase } from "../../lib/siteMetadata";

export function generateMetadata(): Metadata {
  return {
    metadataBase: getSiteMetadataBase(),
    title: { default: "HGR Equipment Resources", template: "%s | HGR" },
    robots: getIndexingPolicy(),
  };
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><SiteHeader /><div className="site-main">{children}</div><footer className="site-footer"><span>HGR Equipment Resources</span><nav aria-label="Footer navigation"><a href="/privacy-policy">Privacy Policy</a><a href="/website-terms">Website Terms</a><a href="/contact">Contact</a></nav></footer></body></html>;
}
