import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./site.css";
import { SiteHeader } from "./siteHeader";

export const metadata: Metadata = {
  title: { default: "HGR Equipment Resources", template: "%s | HGR" },
  robots: { index: false, follow: false },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><SiteHeader /><div className="site-main">{children}</div><footer className="site-footer"><span>HGR Equipment Resources</span><nav aria-label="Footer navigation"><a href="/privacy-policy">Privacy Policy</a><a href="/website-terms">Website Terms</a><a href="/contact">Contact</a></nav></footer></body></html>;
}
